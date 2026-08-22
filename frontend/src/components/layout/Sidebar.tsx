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
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Investigations', path: '/investigations', icon: Briefcase },
  { name: 'Network Analysis', path: '/network', icon: Share2 },
  { name: 'Entities Directory', path: '/entities', icon: Users },
  { name: 'Temporal Analysis', path: '/timeline', icon: Clock },
  { name: 'Alerts Center', path: '/alerts', icon: AlertTriangle, badge: '2' },
  { name: 'Evidence Vault', path: '/evidence', icon: FileCheck2 },
  { name: 'Investigator Copilot', path: '/copilot', icon: Bot },
  { name: 'What-If Simulation', path: '/what-if', icon: SlidersHorizontal },
  { name: 'Intelligence Reports', path: '/reports', icon: FileText },
  { name: 'Data Sources', path: '/data-sources', icon: Database },
  { name: 'Audit Trail', path: '/audit', icon: History },
  { name: 'System Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80">
          <div className="p-2 bg-gradient-to-br from-intel-cyan/20 to-intel-blue/20 border border-intel-cyan/40 rounded-lg text-intel-cyan">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-tight">NEXUS INTEL</h1>
            <span className="text-[10px] font-mono text-intel-cyan uppercase tracking-widest font-semibold">SIH 2026 Platform</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Temporal Intelligence
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
                      ? 'bg-gradient-to-r from-intel-cyan/15 to-transparent text-intel-cyan border-l-2 border-intel-cyan font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-colors group-hover:text-intel-cyan" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800/80 rounded">
                    {item.badge}
                  </span>
                )}
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
