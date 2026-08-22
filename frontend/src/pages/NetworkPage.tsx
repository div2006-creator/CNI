import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { apiService } from '../services/api';
import { NetworkGraphData, NetworkNode, EntityType, ShortestPathResult } from '../types';
import { 
  Share2, 
  Filter, 
  Search, 
  Waypoints, 
  X, 
  ExternalLink, 
  Sliders, 
  Layers,
  ChevronRight
} from 'lucide-react';

const ENTITY_TYPES_ALL: EntityType[] = [
  'PERSON', 'ORGANIZATION', 'LOCATION', 'VEHICLE', 'PHONE', 'ACCOUNT', 'EVENT', 'CASE'
];

export const NetworkPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [minRisk, setMinRisk] = useState<number>(0.0);
  const [selectedTypes, setSelectedTypes] = useState<EntityType[]>(ENTITY_TYPES_ALL);

  // Shortest path tool states
  const [showPathTool, setShowPathTool] = useState(false);
  const [sourceId, setSourceId] = useState<string>('person-101');
  const [targetId, setTargetId] = useState<string>('account-302');
  const [pathResult, setPathResult] = useState<ShortestPathResult | null>(null);
  const [pathLoading, setPathLoading] = useState(false);

  useEffect(() => {
    async function loadNetwork() {
      setLoading(true);
      try {
        const data = await apiService.getNetworkGraph(minRisk, selectedTypes);
        setGraphData(data);
      } catch (err) {
        console.error('Failed to load network graph:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNetwork();
  }, [minRisk, selectedTypes]);

  const toggleType = (t: EntityType) => {
    if (selectedTypes.includes(t)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(x => x !== t));
      }
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const handleComputeShortestPath = async () => {
    if (!sourceId || !targetId) return;
    setPathLoading(true);
    try {
      const res = await apiService.getShortestPath(sourceId, targetId);
      setPathResult(res);
    } catch (err) {
      console.error('Shortest path error:', err);
    } finally {
      setPathLoading(false);
    }
  };

  if (loading && !graphData) return <LoadingSpinner message="Building Knowledge Graph visualization workspace..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-intel-cyan" /> Network Analysis & Graph Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual knowledge graph of criminal multi-hop relationships, money flows, and communication clusters.
          </p>
        </div>

        {/* Shortest Path Action */}
        <button
          onClick={() => setShowPathTool(!showPathTool)}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold rounded-lg transition-all border ${
            showPathTool 
              ? 'bg-intel-cyan text-dark-950 border-intel-cyan' 
              : 'bg-dark-900 text-intel-cyan border-intel-cyan/40 hover:bg-intel-cyan/10'
          }`}
        >
          <Waypoints className="w-4 h-4" /> Link Path Explorer
        </button>
      </div>

      {/* Shortest Path Tool Drawer */}
      {showPathTool && (
        <Card className="border-intel-cyan/40 bg-dark-900/95">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-mono font-bold uppercase text-intel-cyan flex items-center gap-2">
                <Waypoints className="w-4 h-4" /> Shortest Connection Path Calculator
              </h4>
              <button onClick={() => setShowPathTool(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Source Node ID</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-800 rounded-lg text-xs font-mono p-2 text-slate-200"
                >
                  {graphData?.nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label} ({n.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Node ID</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-800 rounded-lg text-xs font-mono p-2 text-slate-200"
                >
                  {graphData?.nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label} ({n.id})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleComputeShortestPath}
                disabled={pathLoading}
                className="px-4 py-2 bg-intel-cyan text-dark-950 font-mono text-xs font-bold rounded-lg hover:bg-cyan-300 transition-colors"
              >
                {pathLoading ? 'Calculating...' : 'Compute Path'}
              </button>
            </div>

            {/* Path Result Display */}
            {pathResult && (
              <div className="p-3 bg-dark-950 border border-slate-800 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-emerald-400 font-semibold">
                    {pathResult.found ? `Connection Path Identified (${pathResult.distance} hops)` : 'No Connection Path Found'}
                  </span>
                  <span className="text-slate-500">{pathResult.path_nodes.length} entities in chain</span>
                </div>
                {pathResult.found && (
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    {pathResult.path_nodes.map((node, i) => (
                      <React.Fragment key={node.id}>
                        <span className="px-2 py-1 bg-dark-900 border border-slate-800 rounded text-slate-200 font-mono text-[11px] flex items-center gap-1.5">
                          <Badge label={node.type} variant="entity" typeValue={node.type} size="sm" />
                          {node.label}
                        </span>
                        {i < pathResult.path_nodes.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-intel-cyan" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-dark-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-intel-cyan" /> Filter Graph Layers
          </span>
          <span className="text-xs font-mono text-slate-400">
            Min Risk Threshold: <span className="text-intel-cyan font-bold">{(minRisk * 100).toFixed(0)}%</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Entity Type Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {ENTITY_TYPES_ALL.map(t => {
              const active = selectedTypes.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all ${
                    active
                      ? 'bg-dark-850 border-slate-700 text-slate-100 font-medium'
                      : 'bg-dark-950 border-slate-900 text-slate-600 opacity-50'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Risk Slider */}
          <div className="flex items-center gap-3 w-48">
            <Sliders className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="0.0"
              max="0.9"
              step="0.1"
              value={minRisk}
              onChange={(e) => setMinRisk(parseFloat(e.target.value))}
              className="w-full accent-intel-cyan cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Graph Area & Inspection Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Cytoscape Canvas (3 Columns) */}
        <div className="lg:col-span-3">
          {graphData && (
            <CytoscapeGraph
              graphData={graphData}
              onNodeSelect={setSelectedNode}
              selectedNodeId={selectedNode?.id}
              height="620px"
            />
          )}
        </div>

        {/* Node Detail Inspection Panel (1 Column) */}
        <div className="space-y-4">
          <Card title="Entity Inspector">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <Badge label={selectedNode.type} variant="entity" typeValue={selectedNode.type} size="sm" />
                    <h3 className="text-sm font-bold text-slate-100 mt-2">{selectedNode.label}</h3>
                    <span className="text-[10px] font-mono text-slate-500">ID: {selectedNode.id}</span>
                  </div>
                  <Badge label={selectedNode.risk_level} variant="risk" typeValue={selectedNode.risk_level} size="sm" />
                </div>

                {/* Risk Gauge Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Risk Assessment</span>
                    <span className="text-intel-cyan font-bold">{(selectedNode.risk_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-dark-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        selectedNode.risk_score > 0.8
                          ? 'bg-rose-500'
                          : selectedNode.risk_score > 0.6
                          ? 'bg-amber-500'
                          : 'bg-intel-cyan'
                      }`}
                      style={{ width: `${selectedNode.risk_score * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Entity Attributes */}
                <div>
                  <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Attribute Key-Values
                  </h4>
                  <div className="space-y-1 bg-dark-950 p-3 rounded-lg border border-slate-800/80 font-mono text-xs">
                    {Object.entries(selectedNode.properties || {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 capitalize">{k.replace('_', ' ')}:</span>
                        <span className="text-slate-200">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="w-full py-2 bg-dark-850 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 rounded-lg transition-colors"
                  >
                    Deselect Node
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-2">
                <Share2 className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-xs font-semibold text-slate-300">No Entity Selected</h4>
                <p className="text-[11px] text-slate-500">
                  Click any node on the graph canvas to inspect entity attributes and relationship edges.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
