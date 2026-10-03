import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sliders, Image, BarChart3, Archive, Radio, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Overview', path: '/overview', icon: LayoutDashboard },
    { label: 'Analyse', path: '/analyze', icon: Sliders },
    { label: 'Scene library', path: '/scenes', icon: Image },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Archive', path: '/archive', icon: Archive },
  ];

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white p-5 md:flex md:min-h-[calc(100vh-4rem)]">
        <div className="space-y-6">
          <div>
            <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">
              NAVIGATION
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/overview'}
                    className={({ isActive }) =>
                      `group relative flex items-center space-x-3 rounded-lg px-3.5 py-2.5 font-sans text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#E6F4F1] font-bold text-[#00A3A6] shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Connected Assets Telemetry Badge */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            <span>NETWORK ASSETS</span>
            <Radio className="w-3.5 h-3.5 text-[#00A3A6] animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 font-sans">
              12 Satellites In View
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 font-sans">ISRO &amp; Copernicus Constellation</p>
          </div>

          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[78%] rounded-full bg-[#00A3A6]"></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500 font-semibold">
              <span>COVERAGE</span>
              <span>78% GLOBAL</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Bar */}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-xl border border-slate-200/80 bg-white/95 p-2 shadow-lg backdrop-blur-xl md:hidden" aria-label="Mobile workspace navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/overview'}
              className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 px-2 py-1.5 text-[10px] font-medium transition-colors ${isActive ? 'text-[#00A3A6] font-bold' : 'text-slate-500'}`}
            >
              <Icon className="h-4 w-4" />
              <span className="max-w-16 truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
