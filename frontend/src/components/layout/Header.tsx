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
    <header className="h-16 bg-[#fcfcf9]/90 border-b border-[#e5dfd3] px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md font-sans">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Global intelligence search (Subject, IBAN, Phone)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#d8cfbe] rounded-xl text-slate-800 pl-9 pr-4 py-1.5 text-xs font-mono focus:outline-none focus:border-saffron-600 focus:ring-1 focus:ring-saffron-600 placeholder:text-slate-400 shadow-xs transition-all"
        />
      </div>

      {/* System Status Indicators & Right Actions */}
      <div className="flex items-center gap-5">
        {/* Status Pill */}
        <div className="hidden md:flex items-center gap-3 bg-[#f0ebd9] border border-[#e2dacd] px-3 py-1 rounded-full text-xs font-mono text-slate-700">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>FastAPI Server</span>
          </div>
          <span className="text-slate-400">|</span>
          <div className="flex items-center gap-1.5 text-saffron-700 font-bold" title="Neo4j Graph Database Driver Status">
            <Database className="w-3.5 h-3.5" />
            <span>Driver: {healthStatus?.graph_driver || 'MockInMemory'}</span>
          </div>
        </div>

        {/* Alerts Bell */}
        <button className="relative p-2 text-slate-600 hover:text-slate-900 bg-white border border-[#d8cfbe] rounded-xl hover:border-slate-400 transition-colors shadow-xs">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-mono text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse">
            4
          </span>
        </button>

        {/* Investigator Profile */}
        <div className="flex items-center gap-3 border-l border-[#e5dfd3] pl-4">
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-saffron-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md border border-saffron-700/20">
            INV
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-[#1c1917]">Investigator Miller</div>
            <div className="text-[10px] font-mono text-saffron-700 font-bold">Intel Division 04</div>
          </div>
        </div>
      </div>
    </header>
  );
};
