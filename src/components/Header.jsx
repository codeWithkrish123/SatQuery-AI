import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, Cpu } from 'lucide-react';

export default function Header() {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded border border-[#00A3A6] bg-[#E6F4F1] flex flex-col items-center justify-center font-mono text-[10px] font-bold text-[#00A3A6] leading-none">
          <span>S</span>
          <span>Q</span>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 font-sans">
            SatQuery<span className="text-[#00A3A6]">AI</span>
          </h1>
          <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
            EARTH OBSERVATION INTELLIGENCE
          </p>
        </div>
      </div>

      {/* Right Side Status Pills */}
      <div className="flex items-center space-x-4 text-[11px] font-mono">
        {/* Backend Nominal */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[#00A3A6]">
          <span className="w-2 h-2 rounded-full bg-[#00A3A6] animate-pulse"></span>
          <span>BACKEND NOMINAL</span>
        </div>

        {/* System Active */}
        <div className="hidden md:flex items-center space-x-1.5 text-[#00A3A6]">
          <span className="w-2 h-2 rounded-full bg-[#00A3A6]"></span>
          <span>SYSTEM ACTIVE</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-1 text-slate-500 font-semibold">
          <span>{utcTime || '16:35:04 UTC'}</span>
        </div>

        {/* User Node A7 */}
        <div className="px-2.5 py-1 rounded border border-[#00A3A6]/30 bg-[#E6F4F1] text-[#00A3A6] font-bold text-[11px]">
          A7
        </div>
      </div>
    </header>
  );
}
