import React, { useEffect, useState } from 'react';
import { useInvestigation } from '../context/InvestigationContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { FilterBar } from '../components/common/FilterBar';
import { ConnectionPath } from '../components/graph/ConnectionPath';
import { NetworkGraph } from '../components/workspace/NetworkGraph';
import { EntityProfile } from '../components/graph/EntityProfile';
import { apiService } from '../services/api';
import { NetworkAnalyticsData } from '../types';
import { Share2, Waypoints, Filter, Sliders, X, Eye, Layers, ShieldAlert, Cpu } from 'lucide-react';

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
  const [analytics, setAnalytics] = useState<NetworkAnalyticsData | null>(null);

  useEffect(() => {
    async function loadNetworkAnalytics() {
      try {
        const res = await apiService.getNetworkAnalytics();
        setAnalytics(res);
      } catch (err) {
        console.error('Network analytics error:', err);
      }
    }
    loadNetworkAnalytics();
  }, []);

  const handleComputePath = () => {
    if (sourceId && targetId) {
      findConnectionPath(sourceId, targetId);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-[1650px] mx-auto pb-10">
      {/* Page Title & Bridge Node Highlights */}
      <div className="flex flex-wrap items-center justify-between gap-4 intel-glass-panel p-5 rounded-2xl shadow-sm border-l-4 border-l-saffron-600 border-[#e5dfd3]">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1c1917] flex items-center gap-3">
            <Share2 className="w-7 h-7 text-saffron-600" /> Dedicated Network Analysis Engine
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
            Visual knowledge graph of criminal multi-hop relationships, centrality metrics, community clusters, and bridge nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {analytics?.bridge_nodes && analytics.bridge_nodes.length > 0 && (
            <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-mono text-xs flex items-center gap-2 font-bold shadow-2xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Bridge Node Detected: <strong className="text-rose-900">{analytics.bridge_nodes[0].name}</strong></span>
            </div>
          )}

          <button
            onClick={() => setShowPathTool(!showPathTool)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold rounded-xl transition-all border shadow-xs ${
              showPathTool 
                ? 'bg-saffron-600 text-white border-saffron-600' 
                : 'bg-white text-saffron-700 border-saffron-600/40 hover:bg-saffron-600/10'
            }`}
          >
            <Waypoints className="w-4 h-4" /> Hidden Path Finder
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <FilterBar />

      {/* Shortest Path Tool Drawer */}
      {showPathTool && (
        <Card className="border-saffron-600/40 bg-white shadow-md">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-3.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-saffron-700 flex items-center gap-2">
                <Waypoints className="w-4 h-4" /> Hidden Connection Path Calculator
              </h4>
              <button onClick={() => { setShowPathTool(false); clearConnectionPath(); }} className="p-1 text-slate-500 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-slate-500 block">Source Entity</label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full bg-white border border-[#d8cfbe] rounded-xl text-xs font-mono p-3 text-slate-800 focus:outline-none focus:border-saffron-600"
                >
                  {entities.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-slate-500 block">Target Entity</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-white border border-[#d8cfbe] rounded-xl text-xs font-mono p-3 text-slate-800 focus:outline-none focus:border-saffron-600"
                >
                  {entities.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleComputePath}
                className="px-5 py-3 intel-btn-primary font-mono text-xs font-bold rounded-xl transition-all"
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[660px]">
        <div className="lg:col-span-3 h-full">
          <NetworkGraph height="100%" />
        </div>

        {/* Selected Entity Side Inspection */}
        <div className="space-y-4 font-sans">
          <Card title="Entity Inspector" subtitle="Selected graph target property view.">
            {selectedEntity ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between border-b border-[#e5dfd3] pb-4">
                  <div className="space-y-1">
                    <Badge label={selectedEntity.type} variant="entity" typeValue={selectedEntity.type} size="sm" />
                    <h3 className="text-base font-bold text-[#1c1917] mt-2">{selectedEntity.name}</h3>
                    <p className="text-xs font-mono text-slate-500 font-bold">ID: {selectedEntity.id}</p>
                  </div>
                  <Badge label={selectedEntity.risk_level} variant="risk" typeValue={selectedEntity.risk_level} size="sm" />
                </div>

                <button
                  onClick={() => setShowProfile(true)}
                  className="w-full py-3 bg-saffron-600/10 border border-saffron-600/40 text-saffron-700 font-mono text-xs font-bold rounded-xl hover:bg-saffron-600/20 transition-all shadow-2xs"
                >
                  Open Full Centrality Profile
                </button>
              </div>
            ) : (
              <div className="text-center py-16 px-4 text-slate-500 space-y-3">
                <Share2 className="w-10 h-10 mx-auto text-slate-400" />
                <p className="text-xs font-mono leading-relaxed">Select any node on the interactive graph canvas to inspect target attributes.</p>
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
