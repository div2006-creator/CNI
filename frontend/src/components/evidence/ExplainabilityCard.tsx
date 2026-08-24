import React from 'react';
import { Cpu, ShieldAlert, FileText, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ExplainabilityCardProps {
  findingTitle: string;
  confidenceScore: number;
  reasons: string[];
  supportingEvidenceIds: string[];
  relatedEntityIds?: string[];
  onSelectEvidence?: (evidenceId: string) => void;
  className?: string;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({
  findingTitle,
  confidenceScore,
  reasons,
  supportingEvidenceIds,
  relatedEntityIds = [],
  onSelectEvidence,
  className = ''
}) => {
  return (
    <div className={`p-4 bg-dark-950 border border-slate-800 rounded-xl space-y-3 font-sans text-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-intel-cyan/10 border border-intel-cyan/40 rounded-lg text-intel-cyan">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-intel-cyan font-semibold">Explainable Insight</span>
            <h4 className="font-bold text-slate-100 mt-0.5">{findingTitle}</h4>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] font-mono font-bold rounded">
          {(confidenceScore * 100).toFixed(0)}% Confidence
        </span>
      </div>

      {/* Why This Finding Exists */}
      <div>
        <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-semibold">
          Why This Finding Was Flagged:
        </span>
        <ul className="space-y-1 bg-dark-900 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-intel-cyan font-bold leading-tight">&bull;</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Supporting Evidence Items */}
      {supportingEvidenceIds.length > 0 && (
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-semibold">
            Supporting Evidence References:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {supportingEvidenceIds.map(evId => (
              <button
                key={evId}
                onClick={() => onSelectEvidence && onSelectEvidence(evId)}
                className="px-2.5 py-1 bg-dark-900 hover:bg-dark-850 border border-slate-800 hover:border-intel-cyan/40 text-intel-cyan font-mono text-[10px] rounded transition-all flex items-center gap-1"
              >
                <FileText className="w-3 h-3" /> {evId}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Non-Verdict Advisory Footer */}
      <div className="pt-2 border-t border-slate-900 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Decision support lead only. Requires investigator verification.</span>
      </div>
    </div>
  );
};
