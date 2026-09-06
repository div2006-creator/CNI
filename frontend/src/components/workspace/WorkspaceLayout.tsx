import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CytoscapeGraph } from '../graph/CytoscapeGraph';
import { NetworkGraphData, NetworkNode, Entity, Relationship, EvidenceItem } from '../../types';
import { apiService } from '../../services/api';
import { 
  Search, 
  Filter, 
  FileCheck2, 
  Clock, 
  Cpu, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Sliders
} from 'lucide-react';

interface WorkspaceLayoutProps {
  caseTitle?: string;
  caseNumber?: string;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  caseTitle = 'Operation NorthStar',
  caseNumber = 'INV-2026-0891'
}) => {
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedRel, setSelectedRel] = useState<Relationship | null>(null);
  const [linkedEvidence, setLinkedEvidence] = useState<EvidenceItem | null>(null);
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState<number>(30); // days

  useEffect(() => {
    async function loadWorkspaceData() {
      const data = await apiService.getNetworkGraph();
      setGraphData(data);
    }
    loadWorkspaceData();
  }, []);

  const handleNodeClick = async (node: NetworkNode | null) => {
    setSelectedNode(node);
    if (node) {
      const rels = await apiService.getRelationships(node.id);
      if (rels.length > 0) {
        setSelectedRel(rels[0]);
        if (rels[0].evidence_id) {
          const ev = await apiService.getEvidenceById(rels[0].evidence_id);
          setLinkedEvidence(ev);
        }
      }
    } else {
      setSelectedRel(null);
      setLinkedEvidence(null);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Workspace Header Bar */}
      <div className="bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-saffron-700 bg-saffron-50 px-2 py-1 rounded border border-saffron-200">
            {caseNumber}
          </span>
          <h2 className="text-sm font-bold text-stone-900">{caseTitle} — 4-Pane Workspace</h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-stone-600">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> Live Temporal State</span>
        </div>
      </div>

      {/* Main 4-Pane Container */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* PANE 1 (LEFT 3 COLS): Entity & Search Panel */}
        <div className="col-span-3 bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl p-3 flex flex-col min-h-0 shadow-sm">
          <h3 className="text-xs font-mono font-semibold uppercase text-stone-600 mb-2 flex items-center justify-between">
            <span>Entity Directory</span>
            <span className="text-[10px] text-saffron-700 font-bold">{graphData?.nodes.length || 0} nodes</span>
          </h3>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-stone-900 focus:border-saffron-500 placeholder-stone-400"
            />
          </div>

          {/* Scrollable Entity List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {graphData?.nodes
              .filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
              .map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNodeClick(n)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedNode?.id === n.id
                      ? 'bg-saffron-50 border-saffron-500 text-stone-900 font-medium shadow'
                      : 'bg-[#f8f6f0] border-[#e5dfd3] hover:border-saffron-300 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 truncate max-w-[140px]">{n.label}</span>
                    <Badge label={n.type} variant="entity" typeValue={n.type} size="sm" />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-stone-500">
                    <span>ID: {n.id}</span>
                    <span className="text-saffron-700 font-bold">Risk: {(n.risk_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* PANE 2 (CENTER 6 COLS): Interactive Network Graph */}
        <div className="col-span-6 bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl overflow-hidden flex flex-col min-h-0 shadow-sm">
          <div className="p-2.5 bg-[#f8f6f0] border-b border-[#e5dfd3] flex items-center justify-between text-xs font-mono">
            <span className="text-stone-900 font-semibold">Temporal Knowledge Graph Canvas</span>
            <span className="text-stone-500">Cytoscape.js Engine</span>
          </div>
          <div className="flex-1 relative bg-[#fcfcf9]">
            {graphData && (
              <CytoscapeGraph
                graphData={graphData}
                onNodeSelect={handleNodeClick}
                selectedNodeId={selectedNode?.id}
                height="100%"
              />
            )}
          </div>
        </div>

        {/* PANE 3 (RIGHT 3 COLS): Evidence & Explanation Panel */}
        <div className="col-span-3 bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl p-3 flex flex-col min-h-0 space-y-3 overflow-y-auto shadow-sm">
          <h3 className="text-xs font-mono font-semibold uppercase text-stone-600 flex items-center gap-1.5 border-b border-[#e5dfd3] pb-2">
            <FileCheck2 className="w-4 h-4 text-saffron-600" /> Evidence & Explanation
          </h3>

          {selectedNode ? (
            <div className="space-y-3 text-xs">
              {/* Selected Node Summary */}
              <div className="p-2.5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg">
                <div className="flex items-center justify-between">
                  <Badge label={selectedNode.type} variant="entity" typeValue={selectedNode.type} size="sm" />
                  <Badge label={selectedNode.risk_level} variant="risk" typeValue={selectedNode.risk_level} size="sm" />
                </div>
                <h4 className="font-bold text-stone-900 mt-1">{selectedNode.label}</h4>
                {selectedNode.is_bridge_node && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono rounded">
                    ★ Flagged Bridge Entity
                  </span>
                )}
              </div>

              {/* Explainability Finding Box */}
              <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg space-y-2">
                <div className="flex items-center gap-1 text-saffron-700 font-mono text-[10px] font-semibold">
                  <Cpu className="w-3.5 h-3.5 text-saffron-600" /> Explainable Finding
                </div>
                <p className="text-stone-800 text-[11px] leading-relaxed">
                  Linked to offshore wire transfers and encrypted VOIP contacts within 10 days of corporate formation.
                </p>
              </div>

              {/* Linked Evidence Item */}
              {linkedEvidence && (
                <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px] text-stone-600">
                    <span className="text-emerald-700 font-semibold">{linkedEvidence.source_type}</span>
                    <span>Conf: {(linkedEvidence.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <h5 className="font-semibold text-stone-900 text-xs">{linkedEvidence.title}</h5>
                  <p className="text-[11px] text-stone-600 italic bg-[#f3efe6] p-2 rounded border border-[#e5dfd3]">
                    &quot;{linkedEvidence.content_snippet}&quot;
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 px-3 text-stone-500 space-y-2">
              <FileCheck2 className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-xs">Click any node or relationship link to inspect evidence provenance.</p>
            </div>
          )}
        </div>

      </div>

      {/* PANE 4 (BOTTOM FULL): Interactive Temporal Investigation Timeline Slider */}
      <div className="bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl p-3 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-2 text-stone-900">
            <Clock className="w-4 h-4 text-saffron-600" />
            <span className="font-bold">Temporal Analysis Window</span>
          </div>
          <span className="text-saffron-700 font-semibold">Past {timeRange} Days Telemetry</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-stone-500">T-30 Days</span>
          <input
            type="range"
            min="1"
            max="30"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="flex-1 accent-saffron-600 cursor-pointer"
          />
          <span className="text-[10px] font-mono text-stone-500">Present (T-0)</span>
        </div>
      </div>
    </div>
  );
};
