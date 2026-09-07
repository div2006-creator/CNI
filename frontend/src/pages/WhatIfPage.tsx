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
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <SlidersHorizontal className="w-7 h-7 text-saffron-600" /> What-If Network Simulation Engine
          </h2>
          <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
            Simulate entity or bridge node removal, evaluate network fragmentation impact, and compare before vs after graph states.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Selector Controls */}
        <Card title="Simulation Configuration" subtitle="Select target suspect/bridge node to test network collapse." className="bg-[#fcfcf9] border-[#e5dfd3]">
          <div className="space-y-5 text-sm font-sans">
            <div className="space-y-2">
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-stone-600 block">Select Target Node to Remove</label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="w-full bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl p-3 font-mono text-xs text-stone-900 focus:outline-none focus:border-saffron-500 shadow-sm"
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
              className="w-full py-3 bg-saffron-500 text-white font-mono text-xs font-bold rounded-xl hover:bg-saffron-600 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Play className="w-4 h-4" /> {loading ? 'Computing Graph Impact...' : 'Execute What-If Simulation'}
            </button>

            <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1.5 text-xs text-stone-700">
              <span className="font-mono font-bold text-amber-800 uppercase tracking-wider block text-[11px]">Simulation Engine Mechanics</span>
              <p className="leading-relaxed">Clones active topology state &rarr; removes target node/edges &rarr; recalculates betweenness centrality & connected components.</p>
            </div>
          </div>
        </Card>

        {/* Simulation Impact Results (2 Cols) */}
        <div className="lg:col-span-2">
          {result ? (
            <Card title="Simulation Impact Analysis Report" subtitle="Calculated topological fragmentation and graph metrics." className="bg-[#fcfcf9] border-[#e5dfd3]">
              <div className="space-y-6 font-sans">
                {/* Metric Comparison Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs text-center">
                  <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl space-y-1">
                    <span className="intel-data-label">Nodes Remaining</span>
                    <span className="text-2xl font-bold text-stone-900">{result.metrics.total_nodes_after} / {result.metrics.total_nodes_before}</span>
                  </div>
                  <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl space-y-1">
                    <span className="intel-data-label">Edges Remaining</span>
                    <span className="text-2xl font-bold text-saffron-700">{result.metrics.total_edges_after} / {result.metrics.total_edges_before}</span>
                  </div>
                  <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl space-y-1">
                    <span className="intel-data-label">Isolated Clusters</span>
                    <span className="text-2xl font-bold text-rose-600">{result.metrics.disconnected_clusters_count} Sub-Graphs</span>
                  </div>
                </div>

                {/* Impact Executive Summary */}
                <div className="p-5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl space-y-2">
                  <h4 className="font-mono text-xs font-bold text-saffron-700 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-saffron-600" /> Topology Impact Assessment Summary
                  </h4>
                  <p className="text-sm text-stone-800 leading-relaxed font-sans">{result.metrics.impact_summary}</p>
                </div>

                {/* Affected Entities */}
                <div className="space-y-2">
                  <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-600">Affected Entity Clusters</h5>
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.metrics.affected_entity_ids.map(id => (
                      <span key={id} className="px-3 py-1.5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl font-mono text-xs text-stone-900 font-semibold shadow-sm">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center border border-dashed border-[#e5dfd3] rounded-2xl bg-[#f8f6f0]/50 p-8 text-center space-y-2">
              <SlidersHorizontal className="w-12 h-12 text-stone-400 mb-2" />
              <h4 className="text-base font-bold text-stone-800">No Active Simulation Executed</h4>
              <p className="text-xs text-stone-600 max-w-md leading-relaxed">Select a target bridge node from the left configuration pane and click &quot;Execute What-If Simulation&quot; to evaluate network fragmentation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
