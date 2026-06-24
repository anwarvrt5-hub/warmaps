/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { audio } from '../utils/audio';
import { Shield, Server, Terminal as TerminalIcon } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  accentColor: string;
}

const BOOT_LOGS = [
  'INITIALIZING WARMAPS SECURITY TERMINAL v3.8...',
  'ESTABLISHING ENCRYPTED VPN TUNNEL (AES-256-GCM)...',
  'ESTABLISHED INGRESS ROUTING TO COLD RUN BACKBONE...',
  'CONNECTING TO GLOBAL TELEPHONY DATABASE REGISTRY...',
  'SYNCHRONIZING REVERSE GEOLOCATION MATRIX CODES...',
  'LOADING CARTODB MAP TILE SYSTEMS...',
  'PRE-LOAD SOUND SYNTHESIZER OSCILLATORS...',
  'SYNCED 32 INTERNATIONAL DIALER COUNTRY CODES...',
  'CHECKING CORE HEALTH: 100% HEALTHY',
  'WARMAPS INTEL CORE STATUS: READY'
];

export default function SplashScreen({ onComplete, accentColor }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);

  useEffect(() => {
    // Play startup process sound on initial mount
    audio.playProcessStart();

    // Progress bar increment
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // randomly increment
        const next = prev + Math.floor(Math.random() * 8) + 4;
        return next > 100 ? 100 : next;
      });
    }, 150);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Add logs dynamically as progress advances
    const logInterval = setInterval(() => {
      if (logIndex < BOOT_LOGS.length) {
        setCurrentLogs((prev) => [...prev, BOOT_LOGS[logIndex]].slice(-4));
        setLogIndex((prev) => prev + 1);
      }
    }, 250);

    return () => clearInterval(logInterval);
  }, [logIndex]);

  useEffect(() => {
    if (progress === 100) {
      const delay = setTimeout(() => {
        audio.playSuccess();
        onComplete();
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [progress, onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0c14] text-[#e8edf5] select-none cursor-pointer p-4 overflow-hidden"
    >
      {/* Glow Effect */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full filter blur-[120px] opacity-20 transition-all duration-1000"
        style={{
          background: accentColor,
          boxShadow: `0 0 100px ${accentColor}`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full text-center space-y-8">
        {/* Pulsing Logo Emblem */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-[#121624] border border-[#1e2433] shadow-2xl animate-pulse">
          <Shield className="w-12 h-12 text-[#00b4ff]" style={{ color: accentColor }} />
          <div
            className="absolute inset-0 rounded-2xl opacity-20 filter blur-md"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Title & Slogan */}
        <div className="space-y-2">
          <h1
            className="text-4xl font-extrabold tracking-wider font-mono bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400"
            style={{ textShadow: `0 0 20px ${accentColor}33` }}
          >
            WARMAPS
          </h1>
          <p className="text-xs text-[#8892a8] uppercase tracking-widest font-mono">
            Ultimate IP & Geolocator Cyber Intel
          </p>
        </div>

        {/* Progress Bar & Counter */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#8892a8]">
            <span>BOOTING INTERFACE SYSTEM</span>
            <span style={{ color: accentColor }} className="font-semibold">{progress}%</span>
          </div>
          <div className="relative w-full h-1.5 bg-[#121624] border border-[#1e2433] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
            />
          </div>
        </div>

        {/* Fake Boot Terminal Logs */}
        <div className="w-full bg-[#0d101d]/90 border border-[#1e2433]/70 rounded-lg p-3 h-28 text-left font-mono text-[10px] text-slate-400 space-y-1 overflow-hidden select-none">
          <div className="flex items-center space-x-1.5 text-slate-500 mb-1 border-b border-[#1e2433]/50 pb-1">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>CORE BOOT DIAGNOSTICS</span>
          </div>
          {currentLogs.map((log, idx) => (
            <div key={idx} className="truncate flex items-start space-x-1">
              <span style={{ color: accentColor }}>&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>

        {/* Action Trigger hint */}
        <p className="text-[10px] text-slate-600 font-mono animate-bounce uppercase tracking-wider">
          Klik di mana saja untuk melewati inisialisasi
        </p>
      </div>
    </div>
  );
}
