import React from 'react';
import { Activity, Cpu, Calculator } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  type: 'calculated' | 'ai_inference';
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  type,
  description
}) => {
  const isCalc = type === 'calculated';

  return (
    <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">{label}</span>
        <span
          className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded flex items-center gap-1 ${
            isCalc
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              : 'bg-purple-950 text-purple-400 border border-purple-800'
          }`}
        >
          {isCalc ? <Calculator className="w-2.5 h-2.5" /> : <Cpu className="w-2.5 h-2.5" />}
          {isCalc ? 'Graph Metric' : 'AI Inference'}
        </span>
      </div>
      <div className="text-base font-bold font-mono text-slate-100">{value}</div>
      {description && <p className="text-[10px] text-slate-500 font-sans leading-tight">{description}</p>}
    </div>
  );
};
