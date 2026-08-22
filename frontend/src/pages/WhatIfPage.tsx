import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { WhatIfResult, NetworkGraphData } from '../types';
import { SlidersHorizontal, Play, RefreshCw, AlertTriangle, ShieldCheck, Activity, Share2 } from 'lucide-react';

export const WhatIfPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [targetNode, setTargetNode] = useState<string>('person-102');
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);

  useEffect(() => {
    async function loadData() {
      const g = await apiService.getNetworkGraph();
      setGraphData(g);
    }
    loadData();
  }, []);

  const handleSimulate = async () => {
    if (!targetNode) return;
    setLoading(true);
    try {
      const res = await apiService.runWhatIfSim([targetNode]);
      setResult(res);
    } catch (err) {
      console.error('What-if error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-intel-cyan" /> What-If Network Simulation Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate entity or bridge node removal, evaluate network fragmentation impact, and compare before vs after graph states.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Selector Controls */}
        <Card title="Simulation Configuration">
          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-mono text-slate-400 block mb-1">Select Bridge Entity to Remove</label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-slate-200"
              >
                {graphData?.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.label} {n.is_bridge_node ? '★ (Bridge Node)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSimulate}
              disabled={loading}
              className="w-full py-2.5 bg-intel-cyan text-dark-950 font-mono text-xs font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> {loading ? 'Computing Graph Impact...' : 'Execute What-If Simulation'}
            </button>

            <div className="p-3 bg-dark-950 border border-slate-800 rounded-lg space-y-1 text-[11px] text-slate-400">
              <span className="font-mono font-semibold text-amber-400 uppercase block">Simulation Mechanics</span>
              <p>Clones state &rarr; removes target node/edges &rarr; recalculates betweenness centrality & connected components.</p>
            </div>
          </div>
        </Card>

        {/* Simulation Impact Results (2 Cols) */}
        <div className="lg:col-span-2">
          {result ? (
            <Card title="Simulation Impact Analysis Report">
              <div className="space-y-6">
                {/* Metric Comparison Cards */}
                <div className="grid grid-cols-3 gap-3 font-mono text-xs text-center">
                  <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase block">Nodes Remaining</span>
                    <span className="text-lg font-bold text-slate-100">{result.metrics.total_nodes_after} / {result.metrics.total_nodes_before}</span>
                  </div>
                  <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase block">Edges Remaining</span>
                    <span className="text-lg font-bold text-intel-cyan">{result.metrics.total_edges_after} / {result.metrics.total_edges_before}</span>
                  </div>
                  <div className="p-3 bg-dark-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase block">Isolated Clusters</span>
                    <span className="text-lg font-bold text-rose-400">{result.metrics.disconnected_clusters_count} Sub-Graphs</span>
                  </div>
                </div>

                {/* Impact Executive Summary */}
                <div className="p-4 bg-dark-950 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="font-mono text-xs font-bold text-intel-cyan uppercase flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Graph Topology Impact Summary
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{result.metrics.impact_summary}</p>
                </div>

                {/* Affected Entities */}
                <div>
                  <h5 className="font-mono text-xs font-semibold uppercase text-slate-400 mb-2">Affected Entity Clusters</h5>
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.metrics.affected_entity_ids.map(id => (
                      <span key={id} className="px-2.5 py-1 bg-dark-950 border border-slate-800 rounded-md font-mono text-[11px] text-slate-300">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-dark-900/50 p-8 text-center">
              <SlidersHorizontal className="w-10 h-10 text-slate-600 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">No Simulation Executed</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Select a target bridge node and click &quot;Execute What-If Simulation&quot; to evaluate network fragmentation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
