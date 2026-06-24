/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { audio } from '../utils/audio';
import { User } from '../types';
import { KeyRound, Shield, User as UserIcon, Lock, Cpu, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  accentColor: string;
}

export default function LoginScreen({ onLoginSuccess, accentColor }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // OTP Verification Stage
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(''));
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);

  const handleLoginOrRegister = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap isi semua kolom kredensial.');
      audio.playError();
      return;
    }

    if (username.length < 3) {
      setErrorMsg('Nama pengguna minimal 3 karakter.');
      audio.playError();
      return;
    }

    // Default admin check
    const isAdmin = username.toLowerCase() === 'admin' && password === 'admin';
    
    // Store user account locally
    const usersJson = localStorage.getItem('warmaps_users') || '{}';
    const users = JSON.parse(usersJson);

    if (isRegistering) {
      if (users[username.toLowerCase()]) {
        setErrorMsg('Nama pengguna sudah terdaftar.');
        audio.playError();
        return;
      }

      // Save user
      users[username.toLowerCase()] = {
        username: username,
        password: password,
        role: 'user',
        level: 'Bronze',
        points: 0,
        achievements: [],
        searchCount: 0
      };
      localStorage.setItem('warmaps_users', JSON.stringify(users));
    } else {
      // Login mode
      if (!isAdmin) {
        const storedUser = users[username.toLowerCase()];
        if (!storedUser || storedUser.password !== password) {
          setErrorMsg('Kredensial tidak valid. Silakan coba lagi atau daftar.');
          audio.playError();
          return;
        }
      }
    }

    // Prepare User Object for OTP stage
    const matchedUser: User = isAdmin
      ? {
          username: 'Admin Intel',
          role: 'admin',
          level: 'Platinum',
          points: 1000,
          achievements: ['Admin Access Granted', 'Intel Commander'],
          searchCount: 0
        }
      : users[username.toLowerCase()];

    setTempUser(matchedUser);
    setErrorMsg('');
    
    // Play process sound and switch to OTP stage
    audio.playProcessStart();
    setIsOtpStage(true);
  };

  const handleOtpInput = (index: number, val: string) => {
    audio.playClick();
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal) return;

    const newOtp = [...otpCode];
    newOtp[index] = cleanVal.substring(0, 1);
    setOtpCode(newOtp);

    // Auto-focus next input
    if (index < 5 && cleanVal !== '') {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      audio.playClick();
      const newOtp = [...otpCode];
      newOtp[index] = '';
      setOtpCode(newOtp);

      // Focus previous input
      if (index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      }
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();
    
    const codeString = otpCode.join('');
    if (codeString.length < 6) {
      setErrorMsg('Masukkan kode OTP 6-digit lengkap.');
      audio.playError();
      return;
    }

    setIsOtpVerifying(true);
    setErrorMsg('');

    // Simulate network delay
    setTimeout(() => {
      if (codeString === '123456') {
        audio.playSuccess();
        setIsOtpVerifying(false);
        if (tempUser) {
          onLoginSuccess(tempUser);
        }
      } else {
        audio.playError();
        setErrorMsg('Kode OTP salah. Gunakan kode simulasi: 123456');
        setIsOtpVerifying(false);
        setOtpCode(Array(6).fill(''));
        document.getElementById('otp-0')?.focus();
      }
    }, 1200);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] w-full p-4 select-none">
      {/* Container Panel */}
      <div className="w-full max-w-md bg-[#121624]/70 border border-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-xl transition-all duration-300">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-[#121624]/60 border border-white/10 shadow-lg">
            {isOtpStage ? (
              <KeyRound className="w-8 h-8" style={{ color: accentColor }} />
            ) : (
              <Shield className="w-8 h-8" style={{ color: accentColor }} />
            )}
            <div className="absolute inset-0 rounded-xl opacity-10 filter blur-sm" style={{ backgroundColor: accentColor }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
              {isOtpStage ? 'Secure OTP Verification' : (isRegistering ? 'Register Intel Agent' : 'Access Terminal')}
            </h2>
            <p className="text-xs text-[#8892a8] font-mono mt-1">
              {isOtpStage 
                ? 'Sistem Keamanan 2FA Menggunakan Enkripsi OTP' 
                : 'Otentikasi Kredensial Enkripsi End-to-End'
              }
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-5 bg-red-950/40 border border-red-500/50 rounded-lg p-3 text-xs text-red-400 font-mono flex items-center space-x-2">
            <Cpu className="w-4 h-4 shrink-0 animate-pulse text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STAGE 1: LOGIN / REGISTER */}
        {!isOtpStage ? (
          <form onSubmit={handleLoginOrRegister} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                <UserIcon className="w-3.5 h-3.5" />
                <span>Agent Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin atau nama_anda"
                  className="w-full bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-[#e8edf5] placeholder-slate-500 focus:outline-none focus:ring-1 transition-all"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Agent Access Code</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password anda..."
                  className="w-full bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-[#e8edf5] placeholder-slate-500 focus:outline-none focus:ring-1 transition-all"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full font-mono text-sm uppercase py-3.5 rounded-xl text-[#0a0c14] font-bold tracking-widest cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 15px ${accentColor}40`,
              }}
              onMouseEnter={() => audio.playClick()}
            >
              {isRegistering ? 'Register Agent' : 'Decrypt & Enter'}
            </button>

            {/* Toggle Link */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setIsRegistering(!isRegistering);
                  setErrorMsg('');
                }}
                className="text-xs font-mono text-slate-500 hover:underline transition"
                style={{ color: `${accentColor}cc` }}
              >
                {isRegistering 
                  ? 'Sudah memiliki kredensial agen? Masuk' 
                  : 'Belum memiliki kredensial? Registrasi Agen Baru'
                }
              </button>
            </div>

            {/* Note info */}
            <div className="border-t border-white/5 pt-4 text-center">
              <p className="text-[10px] text-slate-600 font-mono">
                Admin Demo default: gunakan username <span className="text-slate-400">admin</span> & password <span className="text-slate-400">admin</span>
              </p>
            </div>
          </form>
        ) : (
          /* STAGE 2: OTP VERIFICATION */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center space-y-2 mb-2">
              <p className="text-xs text-slate-400 font-mono">
                Kode 2FA satu-kali pakai dikirim ke portal enkripsi internal anda.
              </p>
              <div className="bg-[#0a0c14]/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm inline-block">
                <span className="text-[11px] font-mono text-[#8892a8]">Kode Simulasi OTP: </span>
                <span className="text-xs font-mono font-bold" style={{ color: accentColor }}>123456</span>
              </div>
            </div>

            {/* OTP Input Fields */}
            <div className="flex justify-between gap-2.5">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 rounded-xl text-center text-lg font-bold font-mono text-white focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Submit & Back Buttons */}
            <div className="space-y-3 pt-3">
              <button
                type="submit"
                disabled={isOtpVerifying}
                className="w-full font-mono text-sm uppercase py-3.5 rounded-xl text-[#0a0c14] font-bold tracking-widest cursor-pointer transition-all duration-300 flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 15px ${accentColor}40`,
                  opacity: isOtpVerifying ? 0.7 : 1
                }}
              >
                {isOtpVerifying ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setIsOtpStage(false);
                  setOtpCode(Array(6).fill(''));
                  setErrorMsg('');
                }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs uppercase py-2.5 rounded-xl text-slate-400 transition"
              >
                Kembali ke Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
