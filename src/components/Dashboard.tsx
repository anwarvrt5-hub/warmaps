/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../utils/audio';
import { COUNTRIES, generateLocationByPhone, generateLocationByIP } from '../utils/geoDatabase';
import { translations, ACHIEVEMENTS_LIST, Language } from '../utils/translation';
import { User, TrackerResult, SearchRecord, AlertRule, GlobalLog } from '../types';
import TrackerMap from './TrackerMap';
import TerminalLogs from './TerminalLogs';
import {
  Compass,
  Server,
  ShieldAlert,
  Radio,
  Terminal as TermIcon,
  Palette,
  Shield,
  User as UserIcon,
  LogOut,
  Star,
  Trash,
  Search,
  Download,
  RefreshCw,
  Bell,
  CloudRain,
  Sun,
  HelpCircle,
  Key,
  AlertTriangle,
  Play,
  Square,
  Activity,
  Cpu,
  Code,
  Database,
  History,
  Globe,
  Wifi,
  Volume2,
  VolumeX,
  Map,
  X,
  Flame,
  Award,
  ListFilter,
  CheckCircle2
} from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  activeThemeId: string;
  setActiveThemeId: (id: string) => void;
  isLightMode: boolean;
  setIsLightMode: (val: boolean) => void;
}

const THEMES = [
  { id: 'frost', name: 'Frost Blue', color: '#00b4ff' },
  { id: 'crimson', name: 'Crimson Red', color: '#ff3355' },
  { id: 'matrix', name: 'Matrix Green', color: '#00ff88' },
  { id: 'gold', name: 'Gold Amber', color: '#ffaa00' },
  { id: 'purple', name: 'Purple Haze', color: '#b44cff' },
  { id: 'arctic', name: 'Arctic White', color: '#64748b' } // Special treatment
];

export default function Dashboard({
  user,
  onLogout,
  accentColor,
  setAccentColor,
  activeThemeId,
  setActiveThemeId,
  isLightMode,
  setIsLightMode
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'tracker' | 'bulk' | 'reverse' | 'tools' | 'history' | 'api' | 'gamification' | 'admin'>('tracker');
  const [lang, setLang] = useState<Language>('id');
  const t = translations[lang];

  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  // Sound and Volume Controls
  const [volume, setVolume] = useState(() => audio.getVolume());
  const [muted, setMuted] = useState(() => audio.getMuted());
  const [ambientActive, setAmbientActive] = useState(() => audio.isAmbientActive());

  // Tutorial / Help Overlay
  const [showTutorial, setShowTutorial] = useState(false);

  // --- PERSISTENT DATA STATE ---
  const [searchHistory, setSearchHistory] = useState<SearchRecord[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [globalLogs, setGlobalLogs] = useState<GlobalLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(user);

  // --- TRACKER TAB STATES ---
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locatingProgress, setLocatingProgress] = useState(0);
  const [locatingStatus, setLocatingStatus] = useState('');
  const [activeResult, setActiveResult] = useState<TrackerResult | null>(null);
  const [isScanningDarkWeb, setIsScanningDarkWeb] = useState(false);
  const [darkWebResult, setDarkWebResult] = useState<string | null>(null);
  
  // --- LIVE TRACKING ACTION STATES ---
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const liveTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- BULK LOOKUP STATES ---
  const [bulkInput, setBulkInput] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState<TrackerResult[]>([]);

  // --- REVERSE LOOKUP STATES ---
  const [reverseIPInput, setReverseIPInput] = useState('');
  const [isReverseLocating, setIsReverseLocating] = useState(false);
  const [reverseProgress, setReverseProgress] = useState(0);

  // --- NETWORK TOOLS STATES ---
  const [activeTool, setActiveTool] = useState<'ping' | 'traceroute' | 'whois' | 'dns' | 'ports' | 'email' | 'ssl' | 'subdomain'>('ping');
  const [toolInput, setToolInput] = useState('8.8.8.8');
  const [toolOutput, setToolOutput] = useState<string[]>([]);
  const [isToolRunning, setIsToolRunning] = useState(false);

  // --- HISTORY FILTERS ---
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterCountry, setHistoryFilterCountry] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState('all');

  // --- TERMINAL LOGS CORES ---
  const [terminalLogs, setTerminalLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'warn' | 'error' }>>([]);

  // --- INITIAL LOAD & SYNC ---
  useEffect(() => {
    // Load local history
    const storedHistory = localStorage.getItem('warmaps_history');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }

    // Load alerts
    const storedAlerts = localStorage.getItem('warmaps_alerts');
    if (storedAlerts) {
      setAlertRules(JSON.parse(storedAlerts));
    }

    // Load/Create global logs for admin console faking
    const storedGlobalLogs = localStorage.getItem('warmaps_global_logs');
    if (storedGlobalLogs) {
      setGlobalLogs(JSON.parse(storedGlobalLogs));
    } else {
      const initialLogs: GlobalLog[] = [
        { id: 'LOG-1', username: 'admin', type: 'phone', input: '+628123456789', country: 'Indonesia', city: 'Bandung', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: 'LOG-2', username: 'anwar_agent', type: 'ip', input: '172.56.20.10', country: 'United States', city: 'Los Angeles', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 'LOG-3', username: 'demouser', type: 'reverse', input: '8.8.8.8', country: 'United States', city: 'Mountain View', timestamp: new Date(Date.now() - 12000000).toISOString() }
      ];
      setGlobalLogs(initialLogs);
      localStorage.setItem('warmaps_global_logs', JSON.stringify(initialLogs));
    }

    // Load Gamification stats
    const storedUser = localStorage.getItem(`warmaps_user_${currentUser.username}`);
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    // Show tutorial for first-time login
    const visited = localStorage.getItem('warmaps_tutorial_shown');
    if (!visited) {
      setShowTutorial(true);
      localStorage.setItem('warmaps_tutorial_shown', 'true');
    }

    // Play low hum on start if setting active
    if (localStorage.getItem('warmaps_ambient_enabled') === 'true') {
      audio.startAmbient();
      setAmbientActive(true);
    }
  }, []);

  // Sync volume node
  const handleVolumeChange = (v: number) => {
    setVolume(v);
    audio.setVolume(v);
  };

  const handleMuteToggle = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    audio.setMuted(nextMute);
  };

  const handleAmbientToggle = () => {
    audio.toggleAmbient();
    setAmbientActive(audio.isAmbientActive());
  };

  // Push terminal logs helper
  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    setTerminalLogs((prev) => [...prev, { text, type }]);
  };

  // --- KEYBOARD SHORTCUTS IMPLEMENTATION ---
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        audio.playClick();
        setActiveTab('tracker');
        setTimeout(() => phoneInputRef.current?.focus(), 100);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        audio.playClick();
        setActiveTab('history');
      } else if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        audio.playClick();
        setActiveTab('tracker');
      } else if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        audio.playClick();
        // Cycle active themes
        const nextIdx = (THEMES.findIndex(t => t.id === activeThemeId) + 1) % THEMES.length;
        handleThemeSelect(THEMES[nextIdx]);
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [activeThemeId]);

  // --- THEME SELECTOR ---
  const handleThemeSelect = (themeObj: typeof THEMES[0]) => {
    audio.playClick();
    setActiveThemeId(themeObj.id);
    setAccentColor(themeObj.color);
    if (themeObj.id === 'arctic') {
      setIsLightMode(true);
    } else {
      setIsLightMode(false);
    }
    // Track achievement
    awardPoints(50, 'theme_hacker');
  };

  // --- GAMIFICATION GAMEPLAY ENGINE ---
  const awardPoints = (amount: number, achievementId?: string) => {
    const updated = { ...currentUser };
    updated.points += amount;

    if (achievementId && !updated.achievements.includes(achievementId)) {
      updated.achievements.push(achievementId);
      // Play a custom success chord
      audio.playNotification();
      addLog(`ACHIEVEMENT UNLOCKED: ${ACHIEVEMENTS_LIST.find(a => a.id === achievementId)?.title}`, 'success');
    }

    // Calculate level rank
    if (updated.points >= 800) updated.level = 'Platinum';
    else if (updated.points >= 500) updated.level = 'Gold';
    else if (updated.points >= 200) updated.level = 'Silver';
    else updated.level = 'Bronze';

    setCurrentUser(updated);
    localStorage.setItem(`warmaps_user_${currentUser.username}`, JSON.stringify(updated));
  };

  // --- 1. SINGLE PHONE TRACKER FLOW ---
  const handleLocatePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocating) return;

    audio.playClick();

    if (!phoneNumber.trim()) {
      addLog('No target dial code entered.', 'error');
      audio.playError();
      return;
    }

    // Start Tracker Loading Overlay Sequence
    setIsLocating(true);
    setLocatingProgress(0);
    audio.playProcessStart();
    setTerminalLogs([]); // clear for tracking diagnostic
    setDarkWebResult(null);

    const steps = [
      { prg: 15, msg: 'Menginisialisasi koneksi ke menara seluler...', type: 'info' as const },
      { prg: 35, msg: 'Mengambil data dari HLR (Home Location Register)...', type: 'info' as const },
      { prg: 55, msg: 'Menganalisis routing prefix ISP...', type: 'warn' as const },
      { prg: 75, msg: 'Memetakan koordinat dan elevasi satelit...', type: 'info' as const },
      { prg: 90, msg: 'Mengalkulasi faks alamat IP...', type: 'info' as const },
      { prg: 100, msg: 'Finalisasi integrasi paket WARMAPS...', type: 'success' as const }
    ];

    let currentStep = 0;
    
    const trackerInterval = setInterval(() => {
      setLocatingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(trackerInterval);
          finalizePhoneScan();
          return 100;
        }

        const next = prev + Math.floor(Math.random() * 4) + 1;
        const mappedStep = steps.find(s => next >= s.prg - 15 && next <= s.prg);
        
        if (mappedStep && steps.indexOf(mappedStep) === currentStep) {
          setLocatingStatus(mappedStep.msg);
          addLog(mappedStep.msg, mappedStep.type);
          currentStep++;
        }

        return next > 100 ? 100 : next;
      });
    }, 180); // ~20 seconds to 100%
    
    // Save reference so we can force cancel or skip
    (window as any).activeTrackerInterval = trackerInterval;
  };

  const skipTrackingLoader = () => {
    audio.playSuccess();
    if ((window as any).activeTrackerInterval) {
      clearInterval((window as any).activeTrackerInterval);
    }
    setLocatingProgress(100);
    finalizePhoneScan();
  };

  const finalizePhoneScan = () => {
    const result = generateLocationByPhone(phoneNumber);
    setActiveResult(result);
    setIsLocating(false);
    audio.playSuccess();

    // Append to local search history
    const newRecord: SearchRecord = {
      id: `REC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'phone',
      input: phoneNumber,
      result,
      isBookmarked: false
    };

    setSearchHistory((prev) => {
      const updated = [newRecord, ...prev];
      localStorage.setItem('warmaps_history', JSON.stringify(updated));
      return updated;
    });

    // Log to admin global auditor
    const newGlobalLog: GlobalLog = {
      id: `LOG-${Date.now()}`,
      username: currentUser.username,
      type: 'phone',
      input: phoneNumber,
      country: result.country,
      city: result.city,
      timestamp: new Date().toISOString()
    };
    setGlobalLogs((prev) => {
      const updated = [newGlobalLog, ...prev];
      localStorage.setItem('warmaps_global_logs', JSON.stringify(updated));
      return updated;
    });

    addLog(`TARGET RESOLVED: ${result.city}, ${result.country}`, 'success');
    addLog(`SPY DEVICE DETECTED: ${result.deviceBrand}`, 'info');

    // Gamification point rewards
    const scCount = currentUser.searchCount + 1;
    let updatedUser = { ...currentUser, searchCount: scCount };
    localStorage.setItem(`warmaps_user_${currentUser.username}`, JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);

    awardPoints(10, 'first_scan');
    
    // Check if 10 countries achieved
    const countriesCount = new Set(searchHistory.map(h => h.result.country)).size;
    if (countriesCount >= 10) {
      awardPoints(150, 'bulk_expert');
    }
  };

  // --- LIVE RADER MOVING COORDINATES SIMULATION ---
  const handleToggleLiveTrace = () => {
    audio.playClick();
    if (isLiveTracking) {
      // STOP
      if (liveTrackingIntervalRef.current) {
        clearInterval(liveTrackingIntervalRef.current);
      }
      setIsLiveTracking(false);
      addLog('Live Tracking dihentikan oleh pengguna.', 'warn');
    } else {
      // START
      if (!activeResult) return;
      setIsLiveTracking(true);
      setLiveCoords({ lat: activeResult.lat, lon: activeResult.lon });
      setLiveSpeed(35); // km/h
      audio.playProcessStart();
      addLog('Menginisialisasi pergerakan radar GPS...', 'info');

      let traceCount = 0;

      liveTrackingIntervalRef.current = setInterval(() => {
        traceCount++;
        audio.playRadar();
        
        setLiveCoords((prev) => {
          if (!prev) return null;
          // small random walking drift
          const dLat = (Math.random() - 0.5) * 0.0015;
          const dLon = (Math.random() - 0.5) * 0.0015;
          const nextLat = prev.lat + dLat;
          const nextLon = prev.lon + dLon;

          // Update active marker positions on map too
          setActiveResult((current) => {
            if (!current) return null;
            return {
              ...current,
              lat: nextLat,
              lon: nextLon
            };
          });

          return { lat: nextLat, lon: nextLon };
        });

        setLiveSpeed(Math.floor(Math.random() * 80) + 10);
        addLog(`PULSE BEAT: Kecepatan target: ${liveSpeed} km/h`, 'info');

        if (traceCount >= 15) { // 30 seconds
          if (liveTrackingIntervalRef.current) {
            clearInterval(liveTrackingIntervalRef.current);
          }
          setIsLiveTracking(false);
          addLog('Siklus radar live tracking selesai.', 'success');
          awardPoints(100, 'radar_commander');
        }
      }, 2000);
    }
  };

  // --- DARK WEB SCANNING SIMULATOR ---
  const handleDarkWebScan = () => {
    if (!activeResult) return;
    audio.playClick();
    setIsScanningDarkWeb(true);
    setDarkWebResult(null);
    addLog('Meluncurkan porting payload ke onion database...', 'warn');

    setTimeout(() => {
      setIsScanningDarkWeb(false);
      setDarkWebResult(activeResult.darkWebStatus);
      addLog(`Kebocoran DarkWeb: ${activeResult.darkWebStatus}`, activeResult.darkWebStatus === 'Not found' ? 'success' : 'error');
    }, 2000);
  };

  // --- EXPORT TOOLS ---
  const handleExportData = (format: 'json' | 'csv' | 'pdf') => {
    if (!activeResult) return;
    audio.playClick();
    addLog(`Menyiapkan data ekspor dalam format ${format.toUpperCase()}...`, 'info');

    setTimeout(() => {
      let content = '';
      let filename = `warmaps_intelligence_${activeResult.id}`;

      if (format === 'json') {
        content = JSON.stringify(activeResult, null, 2);
        filename += '.json';
      } else if (format === 'csv') {
        const keys = Object.keys(activeResult);
        const values = Object.values(activeResult).map(v => `"${v}"`);
        content = keys.join(',') + '\n' + values.join(',');
        filename += '.csv';
      } else {
        // PDF Simulation
        content = `==================================================\n`;
        content += `      WARMAPS CYBER INTEL SYSTEM REPORT\n`;
        content += `      REPORT REF ID: ${activeResult.id}\n`;
        content += `==================================================\n\n`;
        content += `PHONE TARGET:     ${activeResult.phone}\n`;
        content += `GEOLOCATED IP:    ${activeResult.ip}\n`;
        content += `COUNTRY / PROV:   ${activeResult.country} / ${activeResult.province}\n`;
        content += `CITY / ZIPCODE:   ${activeResult.city} / ${activeResult.zip}\n`;
        content += `COORDINATES:      ${activeResult.lat.toFixed(6)}, ${activeResult.lon.toFixed(6)}\n`;
        content += `CARRIER/ISP:      ${activeResult.isp}\n`;
        content += `CONNECTION TYPE:  ${activeResult.connectionType}\n`;
        content += `THREAT RISK SCORE: ${activeResult.riskScore}/100 [${activeResult.threatLevel.toUpperCase()}]\n`;
        content += `DEVICE DETAILS:   ${activeResult.deviceBrand}\n`;
        content += `FINGERPRINT CODE: ${activeResult.fingerprint}\n\n`;
        content += `==================================================\n`;
        content += `DOCUMENT CONFIDENTIALITY Level 4 - RESTRICTED USE\n`;
        filename += '.pdf';
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      addLog(`File ${filename} berhasil dihasilkan dan diunduh.`, 'success');
    }, 1200);
  };

  // --- 2. BULK LOOKUP PROCESSING ---
  const handleBulkLookup = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();

    const phones = bulkInput
      .split(/[\n,]/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (phones.length === 0) {
      addLog('Masukkan setidaknya satu nomor telepon.', 'error');
      audio.playError();
      return;
    }

    setIsBulkProcessing(true);
    setBulkProgress(0);
    setBulkResults([]);
    audio.playProcessStart();

    const mockBulkList: TrackerResult[] = [];
    let count = 0;

    const interval = setInterval(() => {
      if (count < phones.length) {
        const itemRes = generateLocationByPhone(phones[count]);
        mockBulkList.push(itemRes);
        count++;
        setBulkResults([...mockBulkList]);
        setBulkProgress(Math.floor((count / phones.length) * 100));
        addLog(`Bulk process resolved [${count}/${phones.length}]: ${itemRes.phone}`, 'info');
      } else {
        clearInterval(interval);
        setIsBulkProcessing(false);
        audio.playSuccess();
        addLog(`Pencarian massal selesai. ${phones.length} data dipetakan.`, 'success');
        
        // Award points if they scanned 5+
        if (phones.length >= 5) {
          awardPoints(150, 'bulk_expert');
        }
      }
    }, 800);
  };

  // --- 3. REVERSE IP LOOKUP ---
  const handleReverseIP = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();

    if (!reverseIPInput.trim()) {
      addLog('Alamat IP kosong.', 'error');
      audio.playError();
      return;
    }

    setIsReverseLocating(true);
    setReverseProgress(0);
    audio.playProcessStart();

    const reverseInterval = setInterval(() => {
      setReverseProgress((prev) => {
        if (prev >= 100) {
          clearInterval(reverseInterval);
          finalizeReverseIP();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const finalizeReverseIP = () => {
    const res = generateLocationByIP(reverseIPInput);
    setActiveResult(res);
    setIsReverseLocating(false);
    audio.playSuccess();

    setSearchHistory((prev) => {
      const record: SearchRecord = {
        id: `REC-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'reverse',
        input: reverseIPInput,
        result: res,
        isBookmarked: false
      };
      const updated = [record, ...prev];
      localStorage.setItem('warmaps_history', JSON.stringify(updated));
      return updated;
    });

    addLog(`Reverse lookup resolved IP ${res.ip} to dial: ${res.phone}`, 'success');
    awardPoints(100, 'reverse_detective');
  };

  // --- 4. NETWORK DIAGNOSTICS LAB ---
  const handleRunNetworkTool = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();
    setIsToolRunning(true);
    setToolOutput([]);
    addLog(`Meluncurkan utilitas diagnostik: ${activeTool.toUpperCase()}...`, 'warn');

    setTimeout(() => {
      const out: string[] = [];
      const randVal = Math.random();

      if (activeTool === 'ping') {
        out.push(`PING ${toolInput} (56 data bytes)...`);
        for (let i = 1; i <= 4; i++) {
          out.push(`64 bytes dari ${toolInput}: icmp_seq=${i} ttl=54 time=${(Math.random() * 50 + 10).toFixed(1)} ms`);
        }
        out.push(`--- ${toolInput} statistik ping ---`);
        out.push(`4 paket terkirim, 4 diterima, 0% packet loss, rtt min/avg/max = 11.2/24.5/54.8 ms`);
      } else if (activeTool === 'traceroute') {
        out.push(`traceroute ke ${toolInput}, 30 hops max, 60-byte packets`);
        out.push(` 1  192.168.1.1 (192.168.1.1)  0.342 ms  0.228 ms`);
        out.push(` 2  10.0.0.1 (10.0.0.1)  1.214 ms  1.102 ms`);
        out.push(` 3  104.244.42.1 (104.244.42.1)  8.104 ms  7.994 ms`);
        out.push(` 4  203.0.113.85 (203.0.113.85)  18.421 ms  16.112 ms`);
        out.push(` 5  ${toolInput} (${toolInput})  24.120 ms  23.844 ms`);
      } else if (activeTool === 'whois') {
        out.push(`Domain Name: ${toolInput}`);
        out.push(`Registry Domain ID: WHOIS_${Math.floor(Math.random() * 1000000)}`);
        out.push(`Registrar: Cloudflare, Inc.`);
        out.push(`Creation Date: 2012-10-18T10:14:15Z`);
        out.push(`Registry Expiry Date: 2029-10-18T10:14:15Z`);
        out.push(`Registrant Country: US`);
        out.push(`DNSSEC: signedDelegation`);
      } else if (activeTool === 'dns') {
        out.push(`; <<>> DiG 9.10.6 <<>> A ${toolInput}`);
        out.push(`;; ANSWER SECTION:`);
        out.push(`${toolInput}.   300 IN  A   ${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}`);
      } else if (activeTool === 'ports') {
        out.push(`SCANNING FOR COMMON SYSTEM PORTS ON ${toolInput}...`);
        out.push(`PORT 22/tcp  - [CLOSED] (SSH secure connection)`);
        out.push(`PORT 80/tcp  - [OPEN] (HTTP non-secure server)`);
        out.push(`PORT 443/tcp - [OPEN] (HTTPS TLS protected service)`);
        out.push(`PORT 3306/tcp - [CLOSED] (MySQL local Database)`);
      } else if (activeTool === 'email') {
        out.push(`CHECKING EMAIL BREACH DATABASE FOR: ${toolInput}`);
        if (randVal > 0.4) {
          out.push(`[BREACH DETECTED] Email ditemukan di 3 database kebocoran.`);
          out.push(`1. Canva (2020) - Password hash & email leaked.`);
          out.push(`2. Tokopedia (2021) - Alamat rumah & email leaked.`);
          out.push(`3. Adobe (2013) - Hint password leaked.`);
        } else {
          out.push(`[SAFE] Email tidak ditemukan dalam basis data kebocoran.`);
        }
      } else if (activeTool === 'ssl') {
        out.push(`Sertifikat SSL untuk ${toolInput}:`);
        out.push(`Issuer: Let's Encrypt Authority X3`);
        out.push(`Valid From: 2026-04-01`);
        out.push(`Valid Until: 2026-07-01`);
        out.push(`Key Size: RSA 2048-bit`);
      } else if (activeTool === 'subdomain') {
        out.push(`Mencari subdomain di domain ${toolInput}:`);
        out.push(`- api.${toolInput} (A -> active)`);
        out.push(`- dev.${toolInput} (CNAME -> dev.github.io)`);
        out.push(`- staging.${toolInput} (A -> protected)`);
        out.push(`- mail.${toolInput} (MX -> mx.google.com)`);
      }

      setToolOutput(out);
      setIsToolRunning(false);
      audio.playSuccess();
      addLog(`Utilitas ${activeTool.toUpperCase()} selesai dilaksanakan.`, 'success');
      awardPoints(15, 'network_hacker');
    }, 1500);
  };

  // --- 5. SEARCH HISTORY CONTROLLERS ---
  const handleToggleBookmark = (id: string) => {
    audio.playClick();
    setSearchHistory((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
      );
      localStorage.setItem('warmaps_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteHistory = (id: string) => {
    audio.playClick();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem('warmaps_history', JSON.stringify(updated));
      return updated;
    });
    addLog(`Menghapus rekaman riwayat: ${id}`, 'warn');
  };

  const handleClearAllHistory = () => {
    audio.playClick();
    if (confirm('Apakah Anda yakin ingin menghapus semua riwayat pelacakan?')) {
      setSearchHistory([]);
      localStorage.removeItem('warmaps_history');
      addLog('Seluruh basis riwayat lokal telah dihapus.', 'error');
    }
  };

  // --- 6. ADMIN SYSTEM MANAGEMENT CONTROLLERS ---
  const handleResetAdminGlobal = () => {
    audio.playClick();
    if (confirm('RESET TOTAL? Tindakan ini akan mengosongkan seluruh database simulasi di browser.')) {
      localStorage.clear();
      onLogout();
    }
  };

  // Filter history
  const filteredHistory = searchHistory.filter((item) => {
    const query = historySearch.toLowerCase();
    const matchesSearch =
      item.result.phone.toLowerCase().includes(query) ||
      item.result.ip.toLowerCase().includes(query) ||
      item.result.city.toLowerCase().includes(query) ||
      item.result.country.toLowerCase().includes(query);

    const matchesCountry =
      !historyFilterCountry || item.result.country === historyFilterCountry;

    const matchesType =
      historyFilterType === 'all' ||
      (historyFilterType === 'bookmarked' && item.isBookmarked) ||
      item.type === historyFilterType;

    return matchesSearch && matchesCountry && matchesType;
  });

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${isLightMode ? 'bg-slate-50 text-slate-800' : 'bg-[#05060a] bg-[radial-gradient(#1e2433_1px,transparent_1px)] bg-[size:40px_40px] text-[#e8edf5]'}`}>
      
      {/* GLOW ATMOSPHERE */}
      {!isLightMode && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[100px] rounded-full filter blur-[120px] opacity-15 pointer-events-none transition-all duration-500"
          style={{ background: accentColor }}
        />
      )}

      {/* HEADER BAR */}
      <header className={`border-b z-20 sticky top-0 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl ${isLightMode ? 'bg-white/80 border-slate-200' : 'bg-[#0a0c14]/80 border-white/10 shadow-sm'}`}>
        <div className="flex items-center space-x-3 select-none">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#121624]/60 border border-white/10 shadow-md backdrop-blur-sm">
            <Compass className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black tracking-wider font-mono">WARMAPS</h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono font-extrabold bg-[#1e2433] text-slate-400">PRO v3.8</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-tight">{t.tagline}</p>
          </div>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Audio Controls */}
          <div className="flex items-center space-x-1 border border-slate-700/30 rounded-lg p-1.5 bg-[#0a0c14]/20">
            <button
              onClick={handleMuteToggle}
              title="Mute / Unmute"
              className="p-1 rounded text-slate-400 hover:text-white transition"
            >
              {muted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-16 accent-current h-1 rounded-lg"
              style={{ color: accentColor }}
            />
            <button
              onClick={handleAmbientToggle}
              title="Ambient Server Hum"
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition ${ambientActive ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 animate-pulse' : 'bg-slate-800 text-slate-400'}`}
            >
              HUM
            </button>
          </div>

          {/* Quick Language Toggle */}
          <div className="flex border border-slate-700/30 rounded-lg overflow-hidden text-[10px] font-mono">
            <button
              onClick={() => { audio.playClick(); setLang('id'); }}
              className={`px-2 py-1.5 transition ${lang === 'id' ? 'bg-[#1e2433] text-white font-bold' : 'text-slate-400'}`}
            >
              ID
            </button>
            <button
              onClick={() => { audio.playClick(); setLang('en'); }}
              className={`px-2 py-1.5 transition ${lang === 'en' ? 'bg-[#1e2433] text-white font-bold' : 'text-slate-400'}`}
            >
              EN
            </button>
          </div>

          {/* Tutorial Trigger */}
          <button
            onClick={() => { audio.playClick(); setShowTutorial(true); }}
            className="p-1.5 rounded-lg border border-slate-700/30 hover:bg-slate-700/10 text-slate-400 hover:text-white transition"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>

          {/* User Meta Badge */}
          <div className="flex items-center space-x-2 border border-white/10 rounded-lg px-2.5 py-1.5 bg-[#121624]/60 backdrop-blur-sm shadow-md">
            <UserIcon className="w-4 h-4 text-slate-400" />
            <div className="text-[10px] font-mono leading-none">
              <div className="font-bold text-white max-w-[80px] truncate">{currentUser.username}</div>
              <div className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: accentColor }}>
                {currentUser.level} ({currentUser.points} pts)
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => { audio.playClick(); audio.stopAmbient(); onLogout(); }}
            className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/30 border border-red-500/20 text-red-400 hover:text-red-300 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID CONTENT */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* SIDEBAR NAVIGATION - 3 Columns */}
        <nav className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {[
            { id: 'tracker', label: t.tracker, icon: Compass },
            { id: 'bulk', label: t.bulk, icon: Server },
            { id: 'reverse', label: t.reverse, icon: ShieldAlert },
            { id: 'tools', label: t.tools, icon: TermIcon },
            { id: 'history', label: t.history, icon: History },
            { id: 'gamification', label: t.gamification, icon: Award },
            ...(currentUser.role === 'admin' ? [{ id: 'admin', label: t.admin, icon: Shield }] : [])
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  audio.playClick();
                  setActiveTab(item.id as any);
                }}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl border text-xs font-mono font-bold tracking-wide text-left shrink-0 transition-all duration-200 ${
                  isActive
                    ? `shadow-lg border-current text-white`
                    : `${isLightMode ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100 shadow-sm' : 'bg-[#121624]/50 border-white/10 text-slate-400 hover:bg-[#1c2237]/60 backdrop-blur-md shadow-sm'}`
                }`}
                style={{
                  color: isActive ? accentColor : undefined,
                  borderColor: isActive ? accentColor : undefined,
                  boxShadow: isActive ? `0 0 12px ${accentColor}25` : undefined
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* THEME SELECTION PANEL */}
          <div className={`mt-auto hidden lg:block rounded-xl border p-4 font-mono text-[11px] ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/50 border-white/10 backdrop-blur-md shadow-md'}`}>
            <div className="flex items-center space-x-2 mb-3 border-b border-white/5 pb-2 text-slate-400">
              <Palette className="w-3.5 h-3.5" />
              <span className="uppercase tracking-widest">{t.activeTheme}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((theme) => {
                const isActive = activeThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[8px] transition-all hover:scale-105 ${
                      isActive ? 'border-white bg-[#1e2433]' : 'border-slate-800/55 bg-black/20'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full mb-1 shadow border border-white/20"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="text-slate-400 truncate w-full text-center">{theme.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* MAIN PANEL CONTENT - 9 Columns */}
        <main className="lg:col-span-9 flex flex-col space-y-6">

          {/* TAB 1: PHONE TRACKER */}
          {activeTab === 'tracker' && (
            <div className="space-y-6">
              
              {/* Tracker search bar */}
              <div className={`rounded-2xl border p-6 backdrop-blur-xl ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
                <form onSubmit={handleLocatePhone} className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm select-none">+</span>
                    <input
                      ref={phoneInputRef}
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                      placeholder={t.placeholderPhone}
                      className="w-full bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 text-sm text-[#e8edf5] placeholder-slate-500 font-mono py-3.5 pl-8 pr-10 rounded-xl focus:outline-none focus:ring-1 focus:border-[#00b4ff]/80 transition-all"
                      style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                    />
                    <button
                      type="button"
                      onClick={() => setPhoneNumber('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLocating}
                    className="cursor-pointer font-mono text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-xl text-[#0a0c14] transition-all duration-300 flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: accentColor,
                      boxShadow: `0 0 15px ${accentColor}40`,
                      opacity: isLocating ? 0.7 : 1
                    }}
                  >
                    <Search className="w-4 h-4" />
                    <span>{isLocating ? t.btnTracking : t.btnTrack}</span>
                  </button>
                </form>

                {/* Country Code Helper Badge list */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[10px] font-mono text-slate-500">
                  <span>Negara Populer:</span>
                  {COUNTRIES.slice(0, 5).map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { audio.playClick(); setPhoneNumber(`+${c.code}`); }}
                      className="bg-black/20 hover:bg-slate-700/20 px-1.5 py-0.5 rounded border border-slate-700/30 text-slate-400"
                    >
                      +{c.code} ({c.country})
                    </button>
                  ))}
                </div>
              </div>

              {/* TRACKING OVERLAY ANIMATOR */}
              {isLocating && (
                <div className="fixed inset-0 bg-[#0a0c14]/95 z-50 flex flex-col items-center justify-center p-6 text-center select-none">
                  <div className="max-w-md w-full space-y-6">
                    {/* Pulsing Radar Ring */}
                    <div className="relative flex items-center justify-center w-28 h-28 mx-auto rounded-full bg-[#121624] border border-[#1e2433] shadow-2xl">
                      <Radio className="w-12 h-12 animate-pulse text-cyan-400" style={{ color: accentColor }} />
                      <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-25" style={{ color: accentColor }} />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold font-mono text-white tracking-wide uppercase">LOKALISASI SEDANG BERLANGSUNG</h3>
                      <p className="text-xs text-slate-400 font-mono h-8 flex items-center justify-center">
                        {locatingStatus}
                      </p>
                    </div>

                    {/* Horizontal bar */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>DECRYPTING NETWORK PACKETS</span>
                        <span style={{ color: accentColor }}>{locatingProgress}%</span>
                      </div>
                      <div className="h-2 w-full bg-[#121624] border border-[#1e2433] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-150"
                          style={{
                            width: `${locatingProgress}%`,
                            backgroundColor: accentColor,
                            boxShadow: `0 0 10px ${accentColor}`
                          }}
                        />
                      </div>
                    </div>

                    {/* Skip trigger */}
                    <button
                      onClick={skipTrackingLoader}
                      className="px-6 py-2 border border-slate-700 rounded-xl font-mono text-xs text-slate-400 hover:text-white hover:border-slate-500 transition"
                    >
                      Bypass / Percepat Proses
                    </button>
                  </div>
                </div>
              )}

              {/* INTERACTIVE MAP BLOCK */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Geolocation Map */}
                <div className="md:col-span-8 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400 flex items-center space-x-1">
                      <Map className="w-4 h-4" style={{ color: accentColor }} />
                      <span>VISUALISASI INTEL MAPS</span>
                    </span>
                    {/* Map selector style */}
                    <div className="flex border border-slate-700/30 rounded-lg overflow-hidden text-[9px] font-mono">
                      {['dark', 'street', 'satellite'].map((style) => (
                        <button
                          key={style}
                          onClick={() => { audio.playClick(); }} // tile update handled internally or in future if we store mapStyle
                          className="px-2 py-1 bg-[#121624] text-slate-400 hover:text-white transition"
                        >
                          {style.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <TrackerMap
                    results={activeResult ? [activeResult] : []}
                    activeResult={activeResult}
                    mapStyle="dark"
                    accentColor={accentColor}
                  />
                </div>

                {/* Cyber Diagnostics Terminal logs */}
                <div className="md:col-span-4 flex flex-col">
                  <span className="text-xs font-mono font-bold text-slate-400 mb-3 flex items-center space-x-1">
                    <Activity className="w-4 h-4" style={{ color: accentColor }} />
                    <span>DIAGNOSTIK TERMINAL</span>
                  </span>
                  <TerminalLogs logs={terminalLogs} accentColor={accentColor} />
                </div>
              </div>

              {/* PROFILE RESULT DISPLAY */}
              {activeResult ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                  
                  {/* Results Grid - 8 Columns */}
                  <div className={`md:col-span-8 rounded-2xl border p-6 backdrop-blur-xl space-y-6 ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
                    <div className="border-b border-[#1e2433] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="text-lg font-bold font-mono tracking-wide" style={{ color: accentColor }}>
                          {t.resultsHeader}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono">TARGET ID: {activeResult.id} (VERIFIED SIGNAL)</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Bookmark */}
                        <button
                          onClick={() => handleToggleBookmark(activeResult.id)}
                          className="p-2 border border-slate-700/30 rounded-lg hover:bg-slate-700/20 text-slate-400 hover:text-white transition"
                        >
                          <Star className="w-4.5 h-4.5" />
                        </button>
                        
                        {/* Live Tracking toggle button */}
                        <button
                          onClick={handleToggleLiveTrace}
                          className={`font-mono text-[10px] font-bold tracking-wider px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition ${
                            isLiveTracking
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5 animate-spin" />
                          <span>{isLiveTracking ? t.stopLive : t.liveTrace}</span>
                        </button>
                      </div>
                    </div>

                    {/* Details List Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: t.phoneNum, val: activeResult.phone },
                        { label: t.ipAddr, val: activeResult.ip },
                        { label: t.country, val: activeResult.country },
                        { label: t.province, val: activeResult.province },
                        { label: t.city, val: activeResult.city },
                        { label: t.zipCode, val: activeResult.zip },
                        { label: t.isp, val: activeResult.isp },
                        { label: t.coords, val: `${activeResult.lat.toFixed(6)}, ${activeResult.lon.toFixed(6)}` },
                        { label: t.timezone, val: activeResult.timezone },
                        { label: t.connection, val: activeResult.connectionType },
                        { label: t.device, val: activeResult.deviceBrand },
                        { label: t.fingerprint, val: activeResult.fingerprint, mono: true }
                      ].map((cell, idx) => (
                        <div key={idx} className="border-b border-[#1e2433]/30 pb-2">
                          <div className="text-[9px] text-slate-500 font-mono uppercase">{cell.label}</div>
                          <div className={`text-xs text-white font-mono font-semibold mt-0.5 ${cell.mono ? 'break-all text-[10px]' : ''}`}>
                            {cell.val}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Sub-Widgets (Social and Weather) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#1e2433]/30">
                      
                      {/* Social profile recon mockup */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">{t.socialHeader}</span>
                        <div className="bg-black/20 rounded-xl p-3 border border-[#1e2433] space-y-2 text-[11px] font-mono">
                          <div className="flex items-center justify-between border-b border-[#1e2433]/50 pb-1.5">
                            <span className="text-slate-400">Telegram:</span>
                            <span className="text-emerald-400 font-bold">TERKONEKSI (@user_recon)</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-[#1e2433]/50 pb-1.5">
                            <span className="text-slate-400">Instagram:</span>
                            <span className="text-slate-300">Terkait (Private)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">LinkedIn:</span>
                            <span className="text-slate-300">Tersedia (IT Specialist)</span>
                          </div>
                        </div>
                      </div>

                      {/* Location weather widget mock */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">{t.weatherHeader}</span>
                        <div className="bg-black/20 rounded-xl p-3 border border-[#1e2433] flex items-center justify-between font-mono">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white">28°C</div>
                            <div className="text-[10px] text-slate-400">Cerah Berawan / Hujan Ringan</div>
                          </div>
                          <CloudRain className="w-8 h-8 text-cyan-400 shrink-0" />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Threat Risk Assessment Panel - 4 Columns */}
                  <div className="md:col-span-4 flex flex-col space-y-6">
                    
                    {/* Threat Score Card */}
                    <div className={`rounded-2xl border p-6 backdrop-blur-xl ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
                      <h4 className="text-xs font-mono font-bold text-slate-400 mb-4 uppercase tracking-widest">
                        RISK ASSESSMENT GAUGER
                      </h4>

                      {/* Score gauge circle/bar */}
                      <div className="relative flex flex-col items-center justify-center p-4">
                        <div className="text-4xl font-black font-mono tracking-tight" style={{ color: activeResult.riskScore > 75 ? '#ff3355' : activeResult.riskScore > 40 ? '#ffaa00' : '#00ff88' }}>
                          {activeResult.riskScore}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">THREAT RATING SCORE</div>

                        {/* Bar indicator */}
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${activeResult.riskScore}%`,
                              backgroundColor: activeResult.riskScore > 75 ? '#ff3355' : activeResult.riskScore > 40 ? '#ffaa00' : '#00ff88'
                            }}
                          />
                        </div>
                      </div>

                      {/* Detailed Threat Analysis */}
                      <div className="mt-4 border-t border-[#1e2433] pt-4 text-[10px] font-mono text-slate-400 space-y-2">
                        <div className="flex justify-between">
                          <span>VPN / Proxy:</span>
                          <span className={activeResult.proxyDetected ? 'text-red-400' : 'text-emerald-400'}>
                            {activeResult.proxyDetected ? t.detected : t.notDetected}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Blacklist IP:</span>
                          <span className="text-emerald-400">CLEAN (0 Rencana)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Indikator Spam:</span>
                          <span className={activeResult.riskScore > 60 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                            {activeResult.riskScore > 60 ? 'TERLAPOR SPAMMED' : 'NORMAL / CLEAN'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dark Web Scan Button */}
                    <div className={`rounded-2xl border p-6 backdrop-blur-xl ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
                      <h4 className="text-xs font-mono font-bold text-slate-400 mb-3 uppercase tracking-widest">
                        {t.darkWebStatus.toUpperCase()}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mb-4 leading-relaxed">
                        Pindai seluruh arsip kebocoran database untuk mendeteksi apakah nomor telepon atau IP ini terekspos.
                      </p>

                      {darkWebResult ? (
                        <div className={`p-3 rounded-xl border text-[11px] font-mono leading-normal ${darkWebResult === 'Not found' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' : 'bg-red-950/20 border-red-500/30 text-red-400'}`}>
                          {darkWebResult}
                        </div>
                      ) : (
                        <button
                          onClick={handleDarkWebScan}
                          disabled={isScanningDarkWeb}
                          className="w-full bg-[#1c2237] hover:bg-[#252d49] border border-slate-700/50 rounded-xl font-mono text-xs font-bold py-3 text-white cursor-pointer transition flex items-center justify-center space-x-2"
                        >
                          {isScanningDarkWeb ? (
                            <>
                              <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
                              <span>{t.scanning}</span>
                            </>
                          ) : (
                            <span>{t.scanDarkWeb}</span>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Data Exporter Card */}
                    <div className={`rounded-2xl border p-6 backdrop-blur-xl ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
                      <h4 className="text-xs font-mono font-bold text-slate-400 mb-3 uppercase tracking-widest">
                        {t.exportHeader}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {['json', 'csv', 'pdf'].map((format) => (
                          <button
                            key={format}
                            onClick={() => handleExportData(format as any)}
                            className="bg-black/20 hover:bg-slate-700/20 border border-[#1e2433] rounded-lg py-2 font-mono text-[10px] text-slate-300 transition"
                          >
                            {format.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="text-center p-12 border border-dashed border-[#1e2433] rounded-2xl">
                  <Compass className="w-12 h-12 text-slate-700 mx-auto animate-bounce mb-3" />
                  <p className="text-sm text-slate-500 font-mono">MENUNGGU NOMOR TARGET UNTUK DILOKALISASI...</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BULK LOOKUP */}
          {activeTab === 'bulk' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-xl space-y-6 ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
              <div className="border-b border-[#1e2433] pb-4">
                <h3 className="text-lg font-bold font-mono tracking-wide" style={{ color: accentColor }}>
                  {t.bulk.toUpperCase()} PROCESSOR
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Masukkan beberapa dial kode untuk memetakan koordinat sekaligus.</p>
              </div>

              <form onSubmit={handleBulkLookup} className="space-y-4">
                <textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder={t.bulkPlaceholder}
                  rows={5}
                  className="w-full bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 text-sm text-[#e8edf5] placeholder-slate-600 font-mono p-4 rounded-xl focus:outline-none focus:ring-1 focus:border-[#00b4ff]/80 transition-all"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
                <button
                  type="submit"
                  disabled={isBulkProcessing}
                  className="cursor-pointer font-mono text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-xl text-[#0a0c14] transition-all flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 15px ${accentColor}40`,
                    opacity: isBulkProcessing ? 0.7 : 1
                  }}
                >
                  {isBulkProcessing ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>PROCESSING BULK ({bulkProgress}%)</span>
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4" />
                      <span>{t.btnBulk}</span>
                    </>
                  )}
                </button>
              </form>

              {bulkResults.length > 0 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="h-80 w-full rounded-xl overflow-hidden">
                    <TrackerMap
                      results={bulkResults}
                      activeResult={null}
                      mapStyle="dark"
                      accentColor={accentColor}
                    />
                  </div>

                  {/* Mass Data table */}
                  <div className="overflow-x-auto border border-[#1e2433] rounded-xl bg-[#0a0c14]/40">
                    <table className="w-full font-mono text-[11px] text-left">
                      <thead className="bg-[#121624] border-b border-[#1e2433] text-slate-400">
                        <tr>
                          <th className="p-3">PHONE</th>
                          <th className="p-3">IP ADDRESS</th>
                          <th className="p-3">COUNTRY</th>
                          <th className="p-3">CITY</th>
                          <th className="p-3">ISP</th>
                          <th className="p-3">RISK SCORE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2433]/40">
                        {bulkResults.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-700/10">
                            <td className="p-3 text-white font-bold">{item.phone}</td>
                            <td className="p-3 text-slate-300">{item.ip}</td>
                            <td className="p-3 text-slate-400">{item.country}</td>
                            <td className="p-3 text-slate-400">{item.city}</td>
                            <td className="p-3 text-slate-400 max-w-[120px] truncate">{item.isp}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${item.riskScore > 70 ? 'bg-red-950/40 text-red-400' : 'bg-emerald-950/40 text-emerald-400'}`}>
                                {item.riskScore}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REVERSE LOOKUP */}
          {activeTab === 'reverse' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-xl space-y-6 ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
              <div className="border-b border-[#1e2433] pb-4">
                <h3 className="text-lg font-bold font-mono tracking-wide" style={{ color: accentColor }}>
                  {t.reverse.toUpperCase()} SIMULATOR
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Lacak dan identifikasi kepemilikan nomor telepon seluler berdasarkan alamat IP target.</p>
              </div>

              <form onSubmit={handleReverseIP} className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={reverseIPInput}
                  onChange={(e) => setReverseIPInput(e.target.value)}
                  placeholder={t.ipLookupPlaceholder}
                  className="flex-1 bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 text-sm text-[#e8edf5] placeholder-slate-500 font-mono p-3.5 rounded-xl focus:outline-none focus:ring-1 focus:border-[#00b4ff]/80 transition-all"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
                <button
                  type="submit"
                  disabled={isReverseLocating}
                  className="cursor-pointer font-mono text-xs uppercase font-bold tracking-widest px-8 py-3.5 rounded-xl text-[#0a0c14] transition-all flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 0 15px ${accentColor}40`,
                    opacity: isReverseLocating ? 0.7 : 1
                  }}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isReverseLocating ? `RESOLVING (${reverseProgress}%)` : t.btnReverse}</span>
                </button>
              </form>

              {isReverseLocating && (
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-[#121624] border border-[#1e2433] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-150"
                      style={{ width: `${reverseProgress}%`, backgroundColor: accentColor }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono animate-pulse">Memindai jalur ISP dan membalikkan DNS routing...</p>
                </div>
              )}

              {activeResult && activeTab === 'reverse' && !isReverseLocating && (
                <div className="border border-emerald-500/30 bg-emerald-950/15 p-4 rounded-xl flex items-center space-x-4 font-mono text-xs text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="font-bold">IP BERHASIL DIAMBIL KORELASINYA</div>
                    <div className="mt-1">
                      Target IP <span className="text-white underline">{activeResult.ip}</span> berkorelasi dengan nomor telepon <span className="text-white font-bold">{activeResult.phone}</span> di {activeResult.city}, {activeResult.country}.
                    </div>
                    <button
                      onClick={() => { audio.playClick(); setActiveTab('tracker'); }}
                      className="mt-2 text-[10px] text-cyan-400 hover:underline block"
                    >
                      Buka di Panel Peta Utama &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NETWORK TOOLS LAB */}
          {activeTab === 'tools' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-xl space-y-6 ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
              <div className="border-b border-[#1e2433] pb-4">
                <h3 className="text-lg font-bold font-mono tracking-wide" style={{ color: accentColor }}>
                  Tactical Net Lab Diagnostics
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Luncurkan simulasi perintah jaringan taktis untuk menganalisis IP target secara fiktif namun konsisten.</p>
              </div>

              {/* Sub tabs list */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'ping', label: t.pingTool },
                  { id: 'traceroute', label: t.traceTool },
                  { id: 'whois', label: t.whoisTool },
                  { id: 'dns', label: t.dnsTool },
                  { id: 'ports', label: t.portTool },
                  { id: 'email', label: t.emailTool },
                  { id: 'ssl', label: t.certTool },
                  { id: 'subdomain', label: t.subdomainTool }
                ].map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => {
                      audio.playClick();
                      setActiveTool(tool.id as any);
                      setToolOutput([]);
                      if (tool.id === 'email') setToolInput('target@domain.com');
                      else if (tool.id === 'whois' || tool.id === 'ssl' || tool.id === 'subdomain') setToolInput('target-website.com');
                      else setToolInput(activeResult?.ip ?? '103.45.12.8');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono border transition ${
                      activeTool === tool.id
                        ? 'bg-slate-700/40 text-white border-white'
                        : 'bg-[#121624] text-slate-400 border-transparent hover:border-slate-800'
                    }`}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleRunNetworkTool} className="flex gap-4">
                <input
                  type="text"
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  placeholder="e.g. 8.8.8.8 atau target.com"
                  className="flex-1 bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 text-sm text-[#e8edf5] placeholder-slate-600 font-mono p-3.5 rounded-xl focus:outline-none focus:ring-1 focus:border-[#00b4ff]/80 transition-all"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
                <button
                  type="submit"
                  disabled={isToolRunning}
                  className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 font-mono text-xs uppercase px-6 rounded-xl text-white transition flex items-center space-x-1.5"
                >
                  {isToolRunning ? <Cpu className="w-4 h-4 animate-spin text-cyan-400" /> : <Play className="w-4 h-4" />}
                  <span>{isToolRunning ? 'Executing...' : 'EXECUTE'}</span>
                </button>
              </form>

              {/* Console Output box */}
              <div className="bg-[#0a0c14]/70 backdrop-blur-xl border border-white/10 rounded-xl p-4 min-h-[180px] font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto shadow-2xl">
                {toolOutput.length === 0 ? (
                  <div className="text-slate-600 flex items-center justify-center h-40">
                    MENUNGGU DIAGNOSTIK PAYLOAD DIMULAI...
                  </div>
                ) : (
                  toolOutput.map((line, i) => (
                    <div key={i} className="whitespace-pre truncate text-[#00ff88]">
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: RIWAYAT PENCARIAN (HISTORY) */}
          {activeTab === 'history' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-xl space-y-6 ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
              <div className="border-b border-[#1e2433] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold font-mono tracking-wide" style={{ color: accentColor }}>
                    LOCAL STORAGE HISTORY AUDIT
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">Daftar pencarian taktis simulasi terekam secara offline.</p>
                </div>
                
                {searchHistory.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="flex items-center space-x-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 transition"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    <span>HAPUS SEMUA AUDIT</span>
                  </button>
                )}
              </div>

              {/* History Search & Filters row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Cari nomor, IP, kota..."
                    className="w-full bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 pl-10 pr-4 py-2.5 rounded-xl font-mono text-xs text-slate-300 focus:outline-none focus:ring-1 focus:border-[#00b4ff]/80 transition-all"
                  />
                </div>
                
                <div className="md:col-span-4">
                  <select
                    value={historyFilterType}
                    onChange={(e) => setHistoryFilterType(e.target.value)}
                    className="w-full bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 px-3 py-2.5 rounded-xl font-mono text-xs text-slate-400 focus:outline-none focus:ring-1 focus:border-[#00b4ff]/80 transition-all"
                  >
                    <option value="all">Semua Tipe Pencarian</option>
                    <option value="phone">Pelacakan Nomor</option>
                    <option value="reverse">Reverse IP Lookup</option>
                    <option value="bookmarked">Tersimpan (Bookmarks)</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <select
                    value={historyFilterCountry}
                    onChange={(e) => setHistoryFilterCountry(e.target.value)}
                    className="w-full bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 px-3 py-2.5 rounded-xl font-mono text-xs text-slate-400 focus:outline-none focus:ring-1 focus:border-[#00b4ff]/80 transition-all"
                  >
                    <option value="">Semua Negara</option>
                    {Array.from(new Set(searchHistory.map((item) => item.result.country))).map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* History Data Table */}
              {filteredHistory.length > 0 ? (
                <div className="overflow-x-auto border border-[#1e2433]/70 rounded-xl bg-black/10">
                  <table className="w-full font-mono text-[11px] text-left">
                    <thead className="bg-[#121624] border-b border-[#1e2433] text-slate-400">
                      <tr>
                        <th className="p-3 w-10">★</th>
                        <th className="p-3">WAKTU SCANNED</th>
                        <th className="p-3">INPUT TARGET</th>
                        <th className="p-3">NEGARA</th>
                        <th className="p-3">KOTA</th>
                        <th className="p-3">THREAT RISK</th>
                        <th className="p-3 text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2433]/30">
                      {filteredHistory.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-700/10 cursor-pointer"
                          onClick={() => {
                            audio.playClick();
                            setActiveResult(item.result);
                            setActiveTab('tracker');
                            addLog(`Memuat data audit riwayat: ${item.result.phone}`, 'info');
                          }}
                        >
                          <td className="p-3" onClick={(e) => { e.stopPropagation(); handleToggleBookmark(item.id); }}>
                            <Star className={`w-3.5 h-3.5 transition-colors ${item.isBookmarked ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                          </td>
                          <td className="p-3 text-slate-500">{new Date(item.timestamp).toLocaleString()}</td>
                          <td className="p-3 text-white font-bold truncate max-w-[120px]">
                            {item.input}
                          </td>
                          <td className="p-3 text-slate-300">{item.result.country}</td>
                          <td className="p-3 text-slate-300">{item.result.city}</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${item.result.riskScore > 70 ? 'bg-red-950/50 text-red-400' : 'bg-emerald-950/50 text-emerald-400'}`}>
                              {item.result.riskScore}%
                            </span>
                          </td>
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDeleteHistory(item.id)}
                              className="p-1 rounded text-slate-600 hover:text-red-400 transition"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-12 border border-dashed border-[#1e2433] rounded-2xl text-slate-500 font-mono text-xs">
                  Tidak ada rekaman data audit yang cocok dengan filter pencarian.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ACHIEVEMENT & GAMIFICATION DISPLAY */}
          {activeTab === 'gamification' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-xl space-y-6 ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
              <div className="border-b border-[#1e2433] pb-4">
                <h3 className="text-lg font-bold font-mono tracking-wide" style={{ color: accentColor }}>
                  AGEN KREDIBILITAS & LENCANA SPESIALIS
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Selesaikan misi untuk mendapatkan poin kredibilitas siber dan meningkatkan pangkat operasi Anda.</p>
              </div>

              {/* Progress and status cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/30 p-4 rounded-xl border border-[#1e2433] text-center font-mono space-y-1">
                  <div className="text-xs text-slate-500 uppercase">PANGKAT OPERATOR</div>
                  <div className="text-lg font-black" style={{ color: accentColor }}>
                    {currentUser.level.toUpperCase()}
                  </div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-[#1e2433] text-center font-mono space-y-1">
                  <div className="text-xs text-slate-500 uppercase">POIN AKUMULASI</div>
                  <div className="text-lg font-black text-white">{currentUser.points} Pts</div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-[#1e2433] text-center font-mono space-y-1">
                  <div className="text-xs text-slate-500 uppercase">MISI SELESAI</div>
                  <div className="text-lg font-black text-emerald-400">
                    {currentUser.achievements.length} / {ACHIEVEMENTS_LIST.length}
                  </div>
                </div>
              </div>

              {/* Achievements Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                  DAFTAR ACHIEVEMENT OPERASI
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ACHIEVEMENTS_LIST.map((ach) => {
                    const isUnlocked = currentUser.achievements.includes(ach.id);
                    return (
                      <div
                        key={ach.id}
                        className={`p-4 rounded-xl border font-mono flex items-start space-x-3 transition-colors ${
                          isUnlocked
                            ? 'bg-slate-800/20 border-emerald-500/20 text-white'
                            : 'bg-black/20 border-[#1e2433]/70 text-slate-500'
                        }`}
                      >
                        <div className={`p-2 rounded-lg border ${isUnlocked ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 text-left">
                          <div className="text-xs font-bold">{ach.title}</div>
                          <div className="text-[10px] text-slate-400 leading-normal">{ach.description}</div>
                          <div className="text-[9px] font-extrabold text-slate-500">
                            Poin Hadiah: <span className={isUnlocked ? 'text-emerald-400' : 'text-slate-400'}>+{ach.points} Pts</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN CONSOLE */}
          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <div className={`rounded-2xl border p-6 backdrop-blur-xl space-y-6 ${isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121624]/70 border-white/10 shadow-xl'}`}>
              <div className="border-b border-[#1e2433] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold font-mono tracking-wide text-rose-500">
                    WARMAPS ADMINISTRATIVE MATRIX COMMAND
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">Audit log pencarian global, registrasi pengguna, dan pemeliharaan platform.</p>
                </div>
                
                <button
                  onClick={handleResetAdminGlobal}
                  className="bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-400 text-xs font-mono px-3 py-1.5 rounded-lg transition"
                >
                  RESET TOTAL SYSTEM
                </button>
              </div>

              {/* Stats panel cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-xl border border-[#1e2433]">
                  <div className="text-xs font-mono text-slate-500 uppercase mb-2">LIMIT HARIAN SIMULASI</div>
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-sm text-slate-300">50 Pencarian/Hari/Agen</span>
                    <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                      AKTIF (DEMO VISUAL)
                    </span>
                  </div>
                </div>
                
                <div className="bg-black/30 p-4 rounded-xl border border-[#1e2433]">
                  <div className="text-xs font-mono text-slate-500 uppercase mb-2">INTEGRASI WEBHOOK ALERT LOGS</div>
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="text-slate-400 truncate max-w-[150px]">http://internal.gateway.int/log</span>
                    <span className="text-[9px] bg-emerald-950/50 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      ONLINE
                    </span>
                  </div>
                </div>
              </div>

              {/* Search log audits table */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                  GLOBAL SEARCH LOGS AUDIT TRAIL
                </h4>

                <div className="overflow-x-auto border border-[#1e2433] rounded-xl bg-black/10">
                  <table className="w-full font-mono text-[11px] text-left">
                    <thead className="bg-[#121624] border-b border-[#1e2433] text-slate-400">
                      <tr>
                        <th className="p-3">OPERATOR</th>
                        <th className="p-3">TIPE</th>
                        <th className="p-3">INPUT TARGET</th>
                        <th className="p-3">RESOLVED LOCATION</th>
                        <th className="p-3">WAKTU AUDIT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2433]/30">
                      {globalLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-700/5">
                          <td className="p-3 text-white font-bold">@{log.username}</td>
                          <td className="p-3 text-slate-400">{log.type.toUpperCase()}</td>
                          <td className="p-3 text-cyan-400">{log.input}</td>
                          <td className="p-3 text-slate-400">{log.city}, {log.country}</td>
                          <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* KEYBOARD SHORTCUT HELPER - HUMBLE & MINIMAL FOOTER AT BOTTOM */}
          <footer className="pt-6 border-t border-[#1e2433]/30 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-500">
            <div>
              <span>{t.keyboardShortcuts}: </span>
              <span className="text-slate-400">{t.shortcutsInfo}</span>
            </div>
            <div>
              <span>Sistem Enkripsi: AES-256-GCM. 100% Client-Side.</span>
            </div>
          </footer>

        </main>
      </div>

      {/* TUTORIAL HELP OVERLAY MODAL */}
      {showTutorial && (
        <div className="fixed inset-0 bg-[#0a0c14]/90 z-50 flex items-center justify-center p-4 backdrop-blur-md select-none">
          <div className="bg-[#121624] border border-[#1e2433] rounded-2xl max-w-lg w-full p-6 text-left space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2433] pb-3">
              <h3 className="text-base font-bold font-mono text-white flex items-center space-x-2">
                <Compass className="w-5 h-5" style={{ color: accentColor }} />
                <span>PANDUAN OPERASI TERMINAL WARMAPS</span>
              </h3>
              <button
                onClick={() => { audio.playClick(); setShowTutorial(false); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 font-mono text-xs text-slate-300 leading-relaxed">
              <p>Selamat bergabung di platform taktis simulasi <span style={{ color: accentColor }} className="font-bold">WARMAPS</span>. Berikut adalah instruksi cepat cara mengoperasikan terminal:</p>
              
              <ul className="list-disc pl-5 space-y-2 text-slate-400">
                <li><span className="text-white font-bold">Lacak Lokasi:</span> Masukkan dial kode/nomor telepon internasional lengkap (e.g. +62...) untuk memulai proses triangulasi sinyal HLR & memetakan koordinat seluler.</li>
                <li><span className="text-white font-bold">Live Radar Sweep:</span> Aktifkan mode radar live untuk melihat pergerakan simulasi dinamis dari target koordinat secara real-time.</li>
                <li><span className="text-white font-bold">Network diagnostics:</span> Akses lab jaringan untuk melakukan simulasi tracing SSL, ping latency, DNS lookup, email breaches, dan port scanner.</li>
                <li><span className="text-white font-bold">Poin Kredibilitas:</span> Tingkatkan pangkat operasi agen Anda dari Bronze hingga Platinum dengan menyelesaikan misi-misi intelijen.</li>
              </ul>

              <div className="bg-[#0a0c14] border border-[#1e2433] p-3 rounded-xl flex items-center space-x-2 text-[11px] text-slate-500">
                <TermIcon className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Pencarian bersifat simulasi fiktif yang konsisten, aman, dan murni berjalan offline di peramban browser.</span>
              </div>
            </div>

            <button
              onClick={() => { audio.playClick(); setShowTutorial(false); }}
              className="w-full py-3 rounded-xl text-[#0a0c14] font-bold font-mono text-xs uppercase tracking-widest cursor-pointer transition-all duration-200"
              style={{ backgroundColor: accentColor }}
            >
              MULAI OPERASI TERMINAL
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
