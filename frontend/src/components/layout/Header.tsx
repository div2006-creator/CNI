import React, { useEffect, useState } from 'react';
import { Search, Bell, Shield, Database, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, SystemHealth } from '../../types';
import { apiService } from '../../services/api';

interface HeaderProps {
  healthStatus?: SystemHealth | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  healthStatus,
  searchQuery,
  setSearchQuery
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    apiService.getAlerts().then(setAlerts).catch(console.error);
  }, []);

  return (
    <header className="h-16 bg-dark-900/95 border-b border-slate-800/80 px-5 lg:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Global intelligence search (Subject, IBAN, Phone)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-850 border border-slate-800 rounded-lg text-slate-200 pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:border-intel-blue/50 focus:ring-1 focus:ring-intel-blue/20 placeholder:text-slate-500 transition-all"
        />
      </div>

      {/* System Status Indicators & Right Actions */}
      <div className="flex items-center gap-5">
        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-3 bg-dark-950 border border-slate-800 px-3 py-1 rounded-full text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Online</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-cyan-400" title="Neo4j Graph Database Driver Status">
            <Database className="w-3.5 h-3.5" />
            <span>Graph Driver: {healthStatus?.graph_driver || 'MockInMemory'}</span>
          </div>
        </div>

        {/* Alerts Bell */}
        <div className="relative">
          <button
            type="button"
            aria-label="Open notifications"
            aria-expanded={showNotifications}
            onClick={() => setShowNotifications((isOpen) => !isOpen)}
            className="relative p-2 text-slate-400 hover:text-slate-200 bg-dark-850 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-80 bg-dark-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-100">Notifications</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Recent pattern alerts</p>
                </div>
                <span className="text-xs font-mono text-rose-500">{alerts.length} active</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.length > 0 ? alerts.slice(0, 4).map((alert) => (
                  <Link
                    key={alert.id}
                    to="/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="block px-4 py-3 border-b border-slate-800/70 hover:bg-dark-850 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-slate-200 line-clamp-1">{alert.title}</span>
                      <span className="text-[10px] font-mono text-rose-500 shrink-0">{alert.severity}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{alert.description}</p>
                  </Link>
                )) : (
                  <p className="px-4 py-6 text-center text-xs text-slate-400">No active notifications.</p>
                )}
              </div>
              <Link
                to="/alerts"
                onClick={() => setShowNotifications(false)}
                className="block px-4 py-3 text-center text-xs font-semibold text-intel-blue hover:bg-blue-50 transition-colors"
              >
                View all alerts
              </Link>
            </div>
          )}
        </div>

        {/* Investigator Profile */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-semibold text-xs border border-cyan-400/30 shadow-md">
            INV
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">Investigator Miller</div>
            <div className="text-[10px] font-mono text-cyan-400">Intel Division 04</div>
          </div>
        </div>
      </div>
    </header>
  );
};
