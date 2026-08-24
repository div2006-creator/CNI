import React from 'react';
import { ShortestPathResult } from '../../types';
import { Badge } from '../common/Badge';
import { Waypoints, ChevronRight, FileCheck2, Info, ArrowRight } from 'lucide-react';

interface ConnectionPathProps {
  pathResult: ShortestPathResult | null;
  className?: string;
}

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  pathResult,
  className = ''
}) => {
  if (!pathResult || !pathResult.found) {
    return (
      <div className={`p-4 bg-dark-950 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 space-y-1 ${className}`}>
        <Waypoints className="w-6 h-6 mx-auto text-slate-600" />
        <p className="text-xs font-mono">No indirect connection path requested yet.</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-dark-950 border border-intel-cyan/40 rounded-xl space-y-4 font-sans text-xs ${className}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Waypoints className="w-4 h-4 text-intel-cyan" />
          <span className="font-mono text-xs font-bold text-slate-100 uppercase">
            Potential Indirect Connection Path
          </span>
        </div>
        <span className="px-2 py-0.5 bg-intel-cyan/20 text-intel-cyan border border-intel-cyan/40 font-mono text-[11px] font-bold rounded">
          {pathResult.distance} Hops Traversed
        </span>
      </div>

      {/* Multi-Hop Path Visual Sequence */}
      <div className="p-3 bg-dark-900 border border-slate-800/90 rounded-lg overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {pathResult.path_nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              <div className="p-2.5 bg-dark-950 border border-slate-800 rounded-lg flex items-center gap-2 text-xs">
                <Badge label={node.type} variant="entity" typeValue={node.type} size="sm" />
                <div>
                  <div className="font-semibold text-slate-100">{node.label}</div>
                  <div className="text-[9px] font-mono text-slate-500">{node.id}</div>
                </div>
              </div>

              {i < pathResult.path_nodes.length - 1 && (
                <div className="flex flex-col items-center px-1">
                  <span className="text-[9px] font-mono text-intel-cyan">
                    {pathResult.path_edges[i]?.type || 'CONNECTED_TO'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-intel-cyan" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Path Stats */}
      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-center">
        <div className="p-2 bg-dark-900 border border-slate-800 rounded">
          <span className="text-slate-500 block text-[9px] uppercase">Path Length</span>
          <span className="text-slate-200 font-bold">{pathResult.distance} Hops</span>
        </div>
        <div className="p-2 bg-dark-900 border border-slate-800 rounded">
          <span className="text-slate-500 block text-[9px] uppercase">Avg Confidence</span>
          <span className="text-emerald-400 font-bold">92%</span>
        </div>
        <div className="p-2 bg-dark-900 border border-slate-800 rounded">
          <span className="text-slate-500 block text-[9px] uppercase">Supporting Evidence</span>
          <span className="text-intel-cyan font-bold">{pathResult.path_edges.length} Records</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-900 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Indirect paths flag structural connectivity. Investigator review required.</span>
      </div>
    </div>
  );
};
