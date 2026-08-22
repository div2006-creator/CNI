import React, { useState } from 'react';
import { useInvestigation } from '../context/InvestigationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { FilterBar } from '../components/common/FilterBar';
import { ConnectionPath } from '../components/graph/ConnectionPath';
import { NetworkGraph } from '../components/workspace/NetworkGraph';
import { EntityProfile } from '../components/graph/EntityProfile';
import { SearchEntity } from '../components/common/SearchEntity';
import { Share2, Waypoints, Filter, Sliders, X, Eye } from 'lucide-react';

export const NetworkPage: React.FC = () => {
  const { 
    entities, 
    relationships, 
    selectedEntity, 
    selectEntity, 
    connectionPathResult, 
    findConnectionPath,
    clearConnectionPath
  } = useInvestigation();

  const [showPathTool, setShowPathTool] = useState(false);
  const [sourceId, setSourceId] = useState<string>('person-101');
  const [targetId, setTargetId] = useState<string>('account-302');
  const [showProfile, setShowProfile] = useState(false);

  const handleComputePath = () => {
    if (sourceId && targetId) {
      findConnectionPath(sourceId, targetId);
    }
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-dark-900 border border-slate-800 p-3.5 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-intel-cyan" /> Dedicated Network Analysis Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual knowledge graph of criminal multi-hop relationships, money flows, and communication clusters.
          </p>
        </div>

        <button
          onClick={() => setShowPathTool(!showPathTool)}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold rounded-lg transition-all border ${
            showPathTool 
              ? 'bg-intel-cyan text-dark-950 border-intel-cyan' 
              : 'bg-dark-950 text-intel-cyan border-intel-cyan/40 hover:bg-intel-cyan/10'
          }`}
        >
          <Waypoints className="w-4 h-4" /> Hidden Path Finder
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <FilterBar />

      {/* Shortest Path Tool Drawer */}
      {showPathTool && (
        <Card className="border-intel-cyan/40 bg-dark-900/95">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-mono font-bold uppercase text-intel-cyan flex items-center gap-2">
                <Waypoints className="w-4 h-4" /> Hidden Connection Path Calculator
              </h4>
              <button onClick={() => { setShowPathTool(false); clearConnectionPath(); }} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Source Entity</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-800 rounded-lg text-xs font-mono p-2 text-slate-200"
                >
                  {entities.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Entity</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-800 rounded-lg text-xs font-mono p-2 text-slate-200"
                >
                  {entities.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleComputePath}
                className="px-4 py-2 bg-intel-cyan text-dark-950 font-mono text-xs font-bold rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Compute Indirect Path
              </button>
            </div>

            {/* Path Result Component */}
            {connectionPathResult && (
              <ConnectionPath pathResult={connectionPathResult} />
            )}
          </div>
        </Card>
      )}

      {/* Network Graph Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
        <div className="lg:col-span-3 h-full">
          <NetworkGraph height="100%" />
        </div>

        {/* Selected Entity Side Inspection */}
        <div className="space-y-4 font-sans">
          <Card title="Entity Inspector">
            {selectedEntity ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <Badge label={selectedEntity.type} variant="entity" typeValue={selectedEntity.type} size="sm" />
                    <h3 className="text-sm font-bold text-slate-100 mt-2">{selectedEntity.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500">ID: {selectedEntity.id}</span>
                  </div>
                  <Badge label={selectedEntity.risk_level} variant="risk" typeValue={selectedEntity.risk_level} size="sm" />
                </div>

                <button
                  onClick={() => setShowProfile(true)}
                  className="w-full py-2 bg-intel-cyan/10 border border-intel-cyan/40 text-intel-cyan font-mono text-xs font-semibold rounded-lg hover:bg-intel-cyan/20 transition-all"
                >
                  Open Full Centrality Profile
                </button>
              </div>
            ) : (
              <div className="text-center py-12 px-2 text-slate-500 space-y-2">
                <Share2 className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-mono">Select any node on the graph canvas to inspect attributes.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {showProfile && selectedEntity && (
        <EntityProfile
          entity={selectedEntity}
          relationships={relationships}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};
