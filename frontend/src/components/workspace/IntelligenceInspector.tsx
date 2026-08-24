import React from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { ExplainabilityCard } from '../evidence/ExplainabilityCard';
import { EvidencePanel } from '../evidence/EvidencePanel';
import { Badge } from '../common/Badge';
import { FileCheck2, Cpu, ShieldAlert, ChevronRight, UserCheck } from 'lucide-react';

export const IntelligenceInspector: React.FC = () => {
  const { 
    selectedEntity, 
    selectedRelationship, 
    selectedEvidence, 
    selectEvidence, 
    relationships 
  } = useInvestigation();

  if (!selectedEntity) {
    return (
      <div className="h-full bg-dark-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center text-slate-500 space-y-2 font-sans text-xs">
        <FileCheck2 className="w-8 h-8 text-slate-600" />
        <h4 className="font-semibold text-slate-300">Intelligence Inspector</h4>
        <p className="text-[11px] text-slate-500 max-w-xs">
          Select any node or relationship link on the network canvas to view evidence provenance and explainability findings.
        </p>
      </div>
    );
  }

  const entityRels = relationships.filter(r => r.source_id === selectedEntity.id || r.target_id === selectedEntity.id);

  return (
    <div className="h-full bg-dark-900 border border-slate-800 rounded-xl p-3.5 flex flex-col min-h-0 space-y-3 overflow-y-auto font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="font-mono text-xs font-bold text-slate-100 uppercase flex items-center gap-1.5">
          <FileCheck2 className="w-4 h-4 text-intel-cyan" /> Intelligence Inspector
        </span>
        <Badge label={selectedEntity.risk_level} variant="risk" typeValue={selectedEntity.risk_level} size="sm" />
      </div>

      {/* Selected Entity Card */}
      <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <Badge label={selectedEntity.type} variant="entity" typeValue={selectedEntity.type} size="sm" />
          <span className="font-mono text-[10px] text-intel-cyan font-semibold">
            Risk: {(selectedEntity.risk_score * 100).toFixed(0)}%
          </span>
        </div>
        <h3 className="font-bold text-slate-100 text-sm">{selectedEntity.name}</h3>
        <div className="text-[10px] font-mono text-slate-500 flex justify-between">
          <span>Node ID: {selectedEntity.id}</span>
          <span>{entityRels.length} direct links</span>
        </div>
      </div>

      {/* Explainability Card */}
      <ExplainabilityCard
        findingTitle={`Pattern Finding for ${selectedEntity.name}`}
        confidenceScore={selectedEntity.risk_score}
        reasons={[
          "Co-location logged at unlisted industrial warehouse",
          "Offshore wire transfer executed within 2 mins of account deposit",
          "Encrypted VOIP burst contact registered across burner lines"
        ]}
        supportingEvidenceIds={["ev-001", "ev-003", "ev-004"]}
        onSelectEvidence={selectEvidence}
      />

      {/* Evidence Panel */}
      <EvidencePanel
        evidence={selectedEvidence}
      />
    </div>
  );
};
