import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

export default function Header() {
  const [utcTime, setUtcTime] = useState('');
  const [userName, setUserName] = useState('ANALYST');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    try {
      const stored = localStorage.getItem('satquery_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        let rawName = parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'ANALYST');
        rawName = rawName.toUpperCase();
        if (/^[A-Z0-9_-]+$/.test(rawName)) {
          setUserName(`ANALYST ${rawName}`);
        } else {
          setUserName(rawName);
        }
      }
    } catch (e) {}

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl md:px-7 shadow-xs">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="relative flex h-9 w-9 flex-col items-center justify-center rounded-xl border border-[#00A3A6] bg-[#E6F4F1] font-mono text-[10px] font-bold leading-none text-[#00A3A6] shadow-xs">
          <span>S</span>
          <span>Q</span>
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#00A3A6] animate-pulse" />
        </div>
        <div>
          <h1 className="font-sans text-base font-extrabold tracking-tight text-slate-900">
            SatQuery<span className="text-[#00A3A6]">AI</span>
          </h1>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
            EARTH OBSERVATION INTELLIGENCE
          </p>
        </div>
      </div>

      {/* Right Side Status Pills */}
      <div className="flex items-center space-x-3 font-mono text-[10px] md:space-x-4 md:text-[11px]">
        {/* Backend Nominal */}
        <div className="hidden items-center space-x-1.5 text-[#00A3A6] font-semibold sm:flex bg-[#E6F4F1] px-2.5 py-1 rounded-lg border border-[#00A3A6]/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00A3A6] animate-pulse"></span>
          <span>BACKEND ONLINE</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-1 text-slate-500 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
          <span>{utcTime || '16:35:04 UTC'}</span>
        </div>

        {/* Logged in User Badge */}
        <div className="flex items-center space-x-1.5 border border-[#00A3A6]/30 bg-[#E6F4F1] px-3 py-1 rounded-lg font-sans font-bold text-[#00A3A6] text-[11px] shadow-xs">
          <User className="w-3.5 h-3.5 text-[#00A3A6]" />
          <span>{userName}</span>
        </div>
      </div>
    </header>
  );
}
