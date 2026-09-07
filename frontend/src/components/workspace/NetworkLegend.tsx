import React from 'react';

export const NetworkLegend: React.FC = () => {
  return (
    <div className="px-3 py-1.5 bg-[#f8f6f0] border-t border-[#e5dfd3] flex flex-wrap items-center justify-between text-[11px] font-mono text-stone-600 gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-stone-500 font-bold">Palette:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-saffron-600"></span> Person</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Org</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Account</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Phone</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Location</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> Vehicle</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Event</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Case</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 border-2 border-amber-500 text-amber-900 bg-amber-50 rounded text-[10px] font-bold">
          ★ Bridge Entity
        </span>
      </div>
    </div>
  );
};
