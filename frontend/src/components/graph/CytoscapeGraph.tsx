import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { NetworkGraphData, NetworkNode } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';

// Register layout extension if available
try {
  cytoscape.use(coseBilkent);
} catch (e) {
  // Extension already registered or fallback
}

interface CytoscapeGraphProps {
  graphData: NetworkGraphData;
  onNodeSelect?: (node: NetworkNode | null) => void;
  selectedNodeId?: string | null;
  height?: string;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  graphData,
  onNodeSelect,
  selectedNodeId,
  height = '550px'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'circle' | 'grid'>('cose');

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert API nodes/edges to Cytoscape elements
    const elements: cytoscape.ElementDefinition[] = [
      ...graphData.nodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          risk_level: n.risk_level,
          risk_score: n.risk_score,
          raw: n
        }
      })),
      ...graphData.edges.map(e => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type,
          confidence: e.confidence,
          weight: e.weight
        }
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#1e293b',
            'font-size': '11px',
            'font-family': 'Inter, sans-serif',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'background-color': '#ea580c',
            'width': '36px',
            'height': '36px',
            'border-width': 2,
            'border-color': '#e2dacd',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': 0.2
          }
        },
        // Entity Type Colors
        { selector: 'node[type = "PERSON"]', style: { 'background-color': '#ea580c' } },
        { selector: 'node[type = "ORGANIZATION"]', style: { 'background-color': '#7c3aed' } },
        { selector: 'node[type = "LOCATION"]', style: { 'background-color': '#059669' } },
        { selector: 'node[type = "ACCOUNT"]', style: { 'background-color': '#d97706' } },
        { selector: 'node[type = "PHONE"]', style: { 'background-color': '#4f46e5' } },
        { selector: 'node[type = "VEHICLE"]', style: { 'background-color': '#0284c7' } },
        { selector: 'node[type = "EVENT"]', style: { 'background-color': '#e11d48' } },
        { selector: 'node[type = "CASE"]', style: { 'background-color': '#0d9488' } },
        { selector: 'node[type = "DOCUMENT"]', style: { 'background-color': '#0891b2' } },

        // Highlight bridge nodes
        {
          selector: 'node[?is_bridge_node]',
          style: {
            'border-color': '#d97706',
            'border-width': 4
          }
        },

        // Highlight critical risk nodes
        {
          selector: 'node[risk_level = "CRITICAL"]',
          style: {
            'border-color': '#e11d48',
            'border-width': 4
          }
        },
        // Selected Node
        {
          selector: 'node:selected',
          style: {
            'border-color': '#1c1917',
            'border-width': 4,
            'width': '44px',
            'height': '44px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#94a3b8',
            'target-arrow-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(type)',
            'font-size': '9px',
            'font-family': 'JetBrains Mono, monospace',
            'color': '#475569',
            'text-rotation': 'autorotate',
            'text-margin-y': -8
          }
        },
        { selector: 'edge[type = "TRANSFERRED_TO"]', style: { 'line-color': '#d97706', 'target-arrow-color': '#d97706' } },
        { selector: 'edge[type = "CALLS"]', style: { 'line-color': '#4f46e5', 'target-arrow-color': '#4f46e5' } },
        { selector: 'edge[type = "OWNS"]', style: { 'line-color': '#7c3aed', 'target-arrow-color': '#7c3aed' } }
      ],
      layout: {
        name: layoutName,
        padding: 50,
        animate: true,
        animationDuration: 500
      }
    });

    cy.on('tap', 'node', (evt) => {
      const nodeObj = evt.target as NodeSingular;
      const rawData = nodeObj.data('raw') as NetworkNode;
      if (onNodeSelect) onNodeSelect(rawData);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        if (onNodeSelect) onNodeSelect(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData, layoutName]);

  useEffect(() => {
    if (cyRef.current && selectedNodeId) {
      cyRef.current.nodes().unselect();
      const target = cyRef.current.getElementById(selectedNodeId);
      if (target) {
        target.select();
        cyRef.current.center(target);
      }
    }
  }, [selectedNodeId]);

  const handleZoomIn = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current && cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current && cyRef.current.fit(undefined, 40);

  return (
    <div className="relative w-full rounded-2xl bg-[#fcfcf9] border border-[#e5dfd3] overflow-hidden shadow-xs">
      {/* Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Layout selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 border border-[#e0d8c8] rounded-xl p-1 backdrop-blur-md shadow-sm">
          <span className="text-xs text-slate-500 font-mono font-bold px-2">Layout:</span>
          {(['cose', 'concentric', 'circle', 'grid'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLayoutName(l)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg capitalize transition-all ${
                layoutName === l ? 'bg-saffron-600/15 text-saffron-700 font-bold border border-saffron-600/40' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 border border-[#e0d8c8] rounded-xl p-1 backdrop-blur-md shadow-sm">
          <button onClick={handleZoomIn} title="Zoom In" className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-[#f5f0e6] rounded-lg transition-colors">
            <ZoomIn className="w-4 h-4 text-saffron-600" />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out" className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-[#f5f0e6] rounded-lg transition-colors">
            <ZoomOut className="w-4 h-4 text-saffron-600" />
          </button>
          <button onClick={handleFit} title="Fit to Screen" className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-[#f5f0e6] rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4 text-saffron-600" />
          </button>
        </div>
      </div>

      {/* Graph Render Container */}
      <div ref={containerRef} style={{ height }} className="w-full bg-[#fcfcf9]" />

      {/* Legend Footer */}
      <div className="px-4 py-2 bg-[#f8f6f0] border-t border-[#e5dfd3] flex flex-wrap items-center justify-between text-xs text-slate-700 gap-2 font-sans">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-slate-500 font-bold">Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-saffron-600 inline-block"></span> Person</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span> Org</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> Account</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span> Phone</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Location</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span> Event</span>
        </div>
        <span className="font-mono text-slate-500 font-bold">{graphData.total_nodes} nodes | {graphData.total_edges} connections</span>
      </div>
    </div>
  );
};
