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
    <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-2 hover:border-saffron-300 transition-all">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-stone-600 font-semibold">{label}</span>
        <span
          className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md flex items-center gap-1 shrink-0 ${
            isCalc
              ? 'bg-saffron-50 text-saffron-700 border border-saffron-200'
              : 'bg-purple-50 text-purple-700 border border-purple-200'
          }`}
        >
          {isCalc ? <Calculator className="w-3 h-3 text-saffron-600" /> : <Cpu className="w-3 h-3 text-purple-600" />}
          {isCalc ? 'Graph Metric' : 'AI Inference'}
        </span>
      </div>
      <div className="text-xl font-bold font-mono text-stone-900">{value}</div>
      {description && <p className="text-xs text-stone-600 font-sans leading-relaxed">{description}</p>}
    </div>
  );
};
