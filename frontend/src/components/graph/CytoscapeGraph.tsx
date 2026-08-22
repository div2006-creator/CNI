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
            'color': '#cbd5e1',
            'font-size': '11px',
            'font-family': 'Inter, sans-serif',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'background-color': '#00f0ff',
            'width': '36px',
            'height': '36px',
            'border-width': 2,
            'border-color': '#1e2d4d',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': 0.2
          }
        },
        // Entity Type Colors
        { selector: 'node[type = "PERSON"]', style: { 'background-color': '#00f0ff' } },
        { selector: 'node[type = "ORGANIZATION"]', style: { 'background-color': '#a855f7' } },
        { selector: 'node[type = "LOCATION"]', style: { 'background-color': '#10b981' } },
        { selector: 'node[type = "ACCOUNT"]', style: { 'background-color': '#f59e0b' } },
        { selector: 'node[type = "PHONE"]', style: { 'background-color': '#6366f1' } },
        { selector: 'node[type = "VEHICLE"]', style: { 'background-color': '#38bdf8' } },
        { selector: 'node[type = "EVENT"]', style: { 'background-color': '#f43f5e' } },
        { selector: 'node[type = "CASE"]', style: { 'background-color': '#14b8a6' } },
        { selector: 'node[type = "DOCUMENT"]', style: { 'background-color': '#06b6d4' } },

        // Highlight bridge nodes
        {
          selector: 'node[?is_bridge_node]',
          style: {
            'border-color': '#fbbf24',
            'border-width': 4
          }
        },

        // Highlight critical risk nodes
        {
          selector: 'node[risk_level = "CRITICAL"]',
          style: {
            'border-color': '#f43f5e',
            'border-width': 3
          }
        },
        // Selected Node
        {
          selector: 'node:selected',
          style: {
            'border-color': '#ffffff',
            'border-width': 4,
            'width': '44px',
            'height': '44px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(type)',
            'font-size': '9px',
            'font-family': 'JetBrains Mono, monospace',
            'color': '#64748b',
            'text-rotation': 'autorotate',
            'text-margin-y': -8
          }
        },
        { selector: 'edge[type = "TRANSFERRED_TO"]', style: { 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b' } },
        { selector: 'edge[type = "CALLS"]', style: { 'line-color': '#6366f1', 'target-arrow-color': '#6366f1' } },
        { selector: 'edge[type = "OWNS"]', style: { 'line-color': '#a855f7', 'target-arrow-color': '#a855f7' } }
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
    <div className="relative w-full rounded-xl bg-dark-950 border border-slate-800 overflow-hidden">
      {/* Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Layout selector */}
        <div className="pointer-events-auto flex items-center gap-1 bg-dark-900/90 border border-slate-800 rounded-lg p-1 backdrop-blur-md shadow-md">
          <span className="text-xs text-slate-400 font-mono px-2">Layout:</span>
          {(['cose', 'concentric', 'circle', 'grid'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLayoutName(l)}
              className={`px-2.5 py-1 text-xs font-mono rounded capitalize transition-all ${
                layoutName === l ? 'bg-intel-cyan/20 text-intel-cyan font-semibold border border-intel-cyan/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="pointer-events-auto flex items-center gap-1 bg-dark-900/90 border border-slate-800 rounded-lg p-1 backdrop-blur-md shadow-md">
          <button onClick={handleZoomIn} title="Zoom In" className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out" className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={handleFit} title="Fit to Screen" className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Graph Render Container */}
      <div ref={containerRef} style={{ height }} className="w-full bg-dark-950" />

      {/* Legend Footer */}
      <div className="px-4 py-2 bg-dark-900 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-slate-500">Legend:</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Person</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span> Org</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Account</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span> Phone</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Location</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span> Event</span>
        </div>
        <span className="font-mono text-slate-500">{graphData.total_nodes} nodes | {graphData.total_edges} connections</span>
      </div>
    </div>
  );
};
