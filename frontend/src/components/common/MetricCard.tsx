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
    <div className="p-4 bg-dark-950/90 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700/80 transition-all">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">{label}</span>
        <span
          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md flex items-center gap-1 shrink-0 ${
            isCalc
              ? 'bg-blue-50 text-intel-blue border border-blue-200'
              : 'bg-violet-50 text-violet-700 border border-violet-200'
          }`}
        >
          {isCalc ? <Calculator className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
          {isCalc ? 'Graph Metric' : 'AI Inference'}
        </span>
      </div>
      <div className="text-xl font-bold font-mono text-slate-100">{value}</div>
      {description && <p className="text-xs text-slate-400 font-sans leading-relaxed">{description}</p>}
    </div>
  );
};
