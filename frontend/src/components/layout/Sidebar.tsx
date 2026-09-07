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
  Activity,
  Landmark,
  Sparkles,
  MapPin
} from 'lucide-react';

const coreNavItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Spatial Map Intel', path: '/spatial', icon: MapPin, badge: 'REAL MAP' },
  { name: 'Network Analysis', path: '/network', icon: Share2 },
  { name: 'Financial Intelligence', path: '/financial', icon: Landmark },
  { name: 'Predictive Nexus', path: '/predictive', icon: Sparkles },
  { name: 'Evidence Vault', path: '/evidence', icon: FileCheck2 },
  { name: 'Investigator Copilot', path: '/copilot', icon: Bot, badge: 'AI' },
  { name: 'Intelligence Reports', path: '/reports', icon: FileText },
  { name: 'System Settings', path: '/settings', icon: Settings },
];



export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#f3efe6] border-r border-[#e0d8c8] flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#e0d8c8] bg-[#f8f6f0]">
          <div className="p-2 bg-gradient-to-br from-saffron-600 to-amber-600 border border-saffron-700/30 rounded-xl text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-[#1c1917] tracking-tight leading-tight">NEXUS INTEL</h1>
            <span className="text-[10px] font-mono text-saffron-700 uppercase tracking-widest font-bold">Stitch Indian Platform</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Core Modules
          </div>
          {coreNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-saffron-600/15 to-amber-500/10 text-saffron-700 border-l-4 border-saffron-600 font-extrabold shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#eae5d8]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-colors group-hover:text-saffron-600" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-saffron-600/10 text-saffron-700 border border-saffron-600/30 rounded font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-3 border-t border-[#e0d8c8] bg-[#f8f6f0]">
        <div className="p-2.5 bg-white border border-[#e5dfd3] rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-0.5">
            <Activity className="w-3.5 h-3.5 text-saffron-600 animate-pulse" />
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
