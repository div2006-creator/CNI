import React from 'react';
import { Search, Bell, Shield, Database, Cpu } from 'lucide-react';
import { SystemHealth } from '../../types';

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
  return (
    <header className="h-16 bg-dark-900/95 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Global intelligence search (Subject, IBAN, Phone)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-850 border border-slate-800 rounded-lg text-slate-200 pl-9 pr-4 py-1.5 text-xs font-mono focus:outline-none focus:border-intel-cyan/50 focus:ring-1 focus:ring-intel-cyan/50 placeholder:text-slate-500 transition-all"
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
        <button className="relative p-2 text-slate-400 hover:text-slate-200 bg-dark-850 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            4
          </span>
        </button>

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
