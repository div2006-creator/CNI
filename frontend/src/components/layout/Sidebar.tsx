import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Share2,
  Users,
  Clock,
  AlertTriangle,
  FileCheck2,
  Bot,
  SlidersHorizontal,
  FileText,
  Database,
  History,
  Settings,
  Shield,
  Activity
} from 'lucide-react';

const navItems = [
  { name: 'Investigation Workspace', path: '/', icon: LayoutDashboard },
  { name: 'Investigator Copilot', path: '/copilot', icon: Bot },
  { name: 'Evidence Explorer', path: '/evidence', icon: FileCheck2 },
  { name: 'Hidden Connections', path: '/network', icon: Share2 },
  { name: 'What-If Analysis', path: '/what-if', icon: SlidersHorizontal },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80">
          <div className="p-2 bg-intel-cyan text-white rounded-lg shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-tight">CNI</h1>
            <span className="text-[10px] font-mono text-intel-blue uppercase tracking-widest font-semibold">Intelligence Platform</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Investigation Suite
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-intel-cyan border-l-2 border-intel-blue font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-colors group-hover:text-intel-cyan" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="p-2.5 bg-dark-950 border border-slate-800/80 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-0.5">
            <Activity className="w-3.5 h-3.5 text-intel-cyan animate-pulse" />
            Decision Support Only
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Synthetic demo data mode. Human-in-the-loop validation required.
          </p>
        </div>
      </div>
    </aside>
  );
};
