import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { CytoscapeGraph } from '../graph/CytoscapeGraph';
import { NetworkLegend } from './NetworkLegend';
import { NetworkToolbar } from './NetworkToolbar';

interface NetworkGraphProps {
  height?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ height = '100%' }) => {
  const { graphData, selectedEntityId, selectEntity, filterState } = useInvestigation();
  const [layoutName, setLayoutName] = useState<string>('cose');

  if (!graphData) return <div className="h-full bg-[#f8f6f0] flex items-center justify-center text-stone-500 font-mono text-xs">Loading graph canvas...</div>;

  // Apply context filters
  const filteredNodes = graphData.nodes.filter(n => {
    const matchesType = filterState.entityTypes.includes(n.type);
    const matchesRisk = n.risk_score >= filterState.minRisk;
    return matchesType && matchesRisk;
  });

  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = graphData.edges.filter(e => {
    const matchesType = filterState.relationshipTypes.includes(e.type);
    const matchesConf = e.confidence >= filterState.minConfidence;
    return nodeIds.has(e.source) && nodeIds.has(e.target) && matchesType && matchesConf;
  });

  const activeGraph = {
    nodes: filteredNodes,
    edges: filteredEdges,
    total_nodes: filteredNodes.length,
    total_edges: filteredEdges.length
  };

  return (
    <div className="h-full bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl overflow-hidden flex flex-col min-h-0 relative shadow-sm">
      {/* Top Toolbar */}
      <div className="p-2 bg-[#f8f6f0] border-b border-[#e5dfd3]">
        <NetworkToolbar
          layoutName={layoutName}
          setLayoutName={setLayoutName}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onFit={() => {}}
          onReset={() => {}}
        />
      </div>

      {/* Cytoscape Canvas */}
      <div className="flex-1 relative bg-[#fcfcf9]">
        <CytoscapeGraph
          graphData={activeGraph}
          onNodeSelect={(n) => selectEntity(n ? n.id : null)}
          selectedNodeId={selectedEntityId}
          height="100%"
        />
      </div>

      {/* Legend */}
      <NetworkLegend />
    </div>
  );
};
