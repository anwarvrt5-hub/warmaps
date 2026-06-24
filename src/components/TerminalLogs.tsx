/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, Wifi } from 'lucide-react';

interface TerminalLogsProps {
  logs: Array<{ text: string; type: 'info' | 'success' | 'warn' | 'error' }>;
  title?: string;
  accentColor: string;
}

export default function TerminalLogs({ logs, title = 'WARMAPS CORE STACK DEPLOYER', accentColor }: TerminalLogsProps) {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full bg-[#0a0c14]/70 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-60">
      {/* Top Bar */}
      <div className="bg-[#121624]/60 border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-xs font-semibold font-mono tracking-wider text-slate-300">
            {title}
          </span>
        </div>
        <div className="flex space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500/80" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
          <span className="w-2 h-2 rounded-full bg-green-500/80" />
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 select-text selection:bg-[#1e2433] selection:text-[#00b4ff]">
        {logs.length === 0 ? (
          <div className="text-slate-500 flex items-center space-x-1.5 h-full justify-center">
            <Wifi className="w-4 h-4 animate-pulse" />
            <span>KONEKSI TERMINAL SIAP. MENUNGGU INISIASI TARGET...</span>
          </div>
        ) : (
          logs.map((log, idx) => {
            let textColor = 'text-slate-400';
            let prefix = '[INFO]';
            let Icon: any = null;

            if (log.type === 'success') {
              textColor = 'text-emerald-400';
              prefix = '[OK]';
            } else if (log.type === 'warn') {
              textColor = 'text-amber-400 animate-pulse';
              prefix = '[WARN]';
            } else if (log.type === 'error') {
              textColor = 'text-rose-500 font-bold';
              prefix = '[CRIT]';
              Icon = ShieldAlert;
            }

            return (
              <div key={idx} className={`flex items-start space-x-2 ${textColor}`}>
                <span className="text-slate-600 shrink-0 select-none">
                  {new Date().toLocaleTimeString()}
                </span>
                <span className="font-bold shrink-0 select-none">{prefix}</span>
                <div className="flex-1 flex items-center space-x-1.5">
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0 inline text-rose-500" />}
                  <span>{log.text}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
