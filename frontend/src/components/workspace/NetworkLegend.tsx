import React from 'react';

export const NetworkLegend: React.FC = () => {
  return (
    <div className="px-3 py-1.5 bg-dark-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-slate-500 font-bold">Palette:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Person</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Org</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Account</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Phone</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Location</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Vehicle</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Event</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> Case</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 border-2 border-amber-400 text-amber-300 rounded text-[10px] font-bold">
          ★ Bridge Entity
        </span>
      </div>
    </div>
  );
};
