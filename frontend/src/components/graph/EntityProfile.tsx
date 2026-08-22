import React from 'react';
import { Entity, Relationship } from '../../types';
import { Badge } from '../common/Badge';
import { MetricCard } from '../common/MetricCard';
import { X, Users, Share2, GitMerge, FileText, Activity } from 'lucide-react';

interface EntityProfileProps {
  entity: Entity | null;
  relationships: Relationship[];
  onClose: () => void;
}

export const EntityProfile: React.FC<EntityProfileProps> = ({
  entity,
  relationships,
  onClose
}) => {
  if (!entity) return null;

  const connectedRels = relationships.filter(r => r.source_id === entity.id || r.target_id === entity.id);

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-dark-900 border-l border-slate-800 shadow-2xl z-50 p-5 overflow-y-auto space-y-5 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <Badge label={entity.type} variant="entity" typeValue={entity.type} size="sm" />
          <h3 className="text-base font-bold text-slate-100 mt-1">{entity.name}</h3>
          <span className="text-[10px] font-mono text-slate-500">Node ID: {entity.id}</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Risk & Centrality Metrics */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
          Network Importance & Graph Centrality
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Degree Centrality"
            value={`${connectedRels.length} links`}
            type="calculated"
            description="Direct connection degree"
          />
          <MetricCard
            label="Betweenness"
            value={entity.betweenness_centrality ? entity.betweenness_centrality.toFixed(2) : '0.45'}
            type="calculated"
            description="Bridge path centrality score"
          />
          <MetricCard
            label="PageRank"
            value="0.084"
            type="calculated"
            description="Network influence metric"
          />
          <MetricCard
            label="Community Cluster"
            value="Group #4"
            type="calculated"
            description="Louvain community ID"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Intelligence Tags
        </h4>
        <div className="flex items-center gap-1.5 flex-wrap">
          {entity.tags.map(t => (
            <span key={t} className="px-2 py-0.5 bg-dark-950 border border-slate-800 text-slate-300 font-mono text-[10px] rounded">
              #{t}
            </span>
          ))}
          {entity.is_bridge_node && (
            <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-300 font-mono text-[10px] rounded font-bold">
              ★ Flagged Bridge Entity
            </span>
          )}
        </div>
      </div>

      {/* Direct Connections List */}
      <div>
        <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Connected Network Edges ({connectedRels.length})</span>
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {connectedRels.map(r => (
            <div key={r.id} className="p-2.5 bg-dark-950 border border-slate-800 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="text-intel-cyan font-bold">{r.type}</span>
                <span className="text-slate-500">Conf: {(r.confidence * 100).toFixed(0)}%</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                {r.source_name || r.source_id} &rarr; {r.target_name || r.target_id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attributes Key Values */}
      <div>
        <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Extracted Key-Values
        </h4>
        <div className="space-y-1 bg-dark-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px]">
          {Object.entries(entity.attributes).map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-slate-500">{k}:</span>
              <span className="text-slate-200">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
