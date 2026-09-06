import React from 'react';
import { EvidenceItem } from '../../types';
import { Badge } from '../common/Badge';
import { FileCheck2, ExternalLink, ShieldCheck, Eye, Clock } from 'lucide-react';

interface EvidencePanelProps {
  evidence: EvidenceItem | null;
  onViewDetails?: (evidenceId: string) => void;
  className?: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidence,
  onViewDetails,
  className = ''
}) => {
  if (!evidence) {
    return (
      <div className={`p-4 bg-[#f8f6f0] border border-dashed border-[#e5dfd3] rounded-xl text-center text-stone-500 space-y-2 ${className}`}>
        <FileCheck2 className="w-6 h-6 mx-auto text-stone-400" />
        <p className="text-xs font-mono">No evidence item selected for inspection.</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl space-y-3 font-sans text-xs ${className}`}>
      {/* Evidence Top Metadata */}
      <div className="flex items-start justify-between border-b border-[#e5dfd3] pb-2.5">
        <div>
          <span className="font-mono text-[10px] font-bold text-saffron-700 bg-saffron-50 px-2 py-0.5 rounded border border-saffron-200 uppercase">
            {evidence.source_type}
          </span>
          <h4 className="font-bold text-stone-900 mt-1">{evidence.title}</h4>
          <span className="text-[10px] font-mono text-stone-500">Source Record: {evidence.source_id}</span>
        </div>
        <div className="text-right font-mono text-[11px]">
          <span className="text-emerald-700 font-semibold block">{(evidence.confidence * 100).toFixed(0)}% Confidence</span>
          <span className="text-[10px] text-stone-500">{evidence.extraction_method}</span>
        </div>
      </div>

      {/* Raw Snippet Extract */}
      <div>
        <span className="text-[10px] font-mono uppercase text-stone-600 block mb-1">Raw Intelligence Record Extract</span>
        <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg text-stone-800 font-mono text-[11px] leading-relaxed">
          &quot;{evidence.content_snippet}&quot;
        </div>
      </div>

      {/* Linked Graph Entities */}
      {evidence.linked_entity_ids.length > 0 && (
        <div>
          <span className="text-[10px] font-mono uppercase text-stone-600 block mb-1">Linked Entities ({evidence.linked_entity_ids.length})</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {evidence.linked_entity_ids.map(eid => (
              <span key={eid} className="px-2 py-0.5 bg-[#f8f6f0] border border-[#e5dfd3] rounded text-stone-800 font-mono text-[10px]">
                {eid}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 border-t border-[#e5dfd3] flex items-center justify-between text-[11px] font-mono">
        <span className="text-stone-500 flex items-center gap-1">
          <Clock className="w-3 h-3 text-stone-500" /> {new Date(evidence.timestamp).toLocaleDateString()}
        </span>
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(evidence.id)}
            className="flex items-center gap-1 text-saffron-700 hover:underline font-semibold"
          >
            <Eye className="w-3.5 h-3.5" /> View Evidence Record
          </button>
        )}
      </div>
    </div>
  );
};
