import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sliders, Image, BarChart3, Archive } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Analyse', path: '/analyze', icon: Sliders },
    { label: 'Scene library', path: '/scenes', icon: Image },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Archive', path: '/archive', icon: Archive },
  ];

  return (
    <aside className="w-56 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-3.5rem)]">
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase mb-3 px-3">
            WORKSPACE
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-r-md text-xs font-sans transition-all relative ${
                      isActive
                        ? 'bg-[#E6F4F1] text-[#00A3A6] font-bold border-l-2 border-[#00A3A6]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Connected Assets Badge */}
      <div className="p-3 border-t border-slate-100 space-y-3 font-mono">
        <p className="text-[10px] text-slate-400 tracking-wider uppercase">CONNECTED ASSETS</p>
        <div className="text-sm font-bold text-slate-900">
          12 satellites in view
        </div>

        <div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#00A3A6] rounded-full w-[74%]"></div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">74% COVERAGE</div>
        </div>
      </div>
    </aside>
  );
}
