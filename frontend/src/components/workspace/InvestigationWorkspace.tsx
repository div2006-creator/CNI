import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { EntityExplorer } from './EntityExplorer';
import { NetworkGraph } from './NetworkGraph';
import { IntelligenceInspector } from './IntelligenceInspector';
import { InvestigationTimeline } from './InvestigationTimeline';
import { FilterBar } from '../common/FilterBar';
import { EntityProfile } from '../graph/EntityProfile';
import { ConnectionPath } from '../graph/ConnectionPath';
import { Shield, Briefcase, SlidersHorizontal, Waypoints } from 'lucide-react';

interface InvestigationWorkspaceProps {
  caseTitle?: string;
  caseNumber?: string;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  caseTitle = 'Operation NorthStar',
  caseNumber = 'INV-2026-0891'
}) => {
  const { selectedEntity, selectEntity, relationships, connectionPathResult } = useInvestigation();
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showPathFinder, setShowPathFinder] = useState(false);

  return (
    <div className="space-y-4 h-[calc(100vh-90px)] flex flex-col font-sans">
      {/* Workspace Bar */}
      <div className="bg-dark-900 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-intel-cyan bg-intel-cyan/10 px-2.5 py-1 rounded border border-intel-cyan/30">
            {caseNumber}
          </span>
          <h2 className="text-sm font-bold text-slate-100">{caseTitle} — Coordinated Investigation Workspace</h2>
        </div>

        <div className="flex items-center gap-2">
          {selectedEntity && (
            <button
              onClick={() => setShowProfileDrawer(true)}
              className="px-3 py-1.5 bg-dark-850 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 rounded-lg transition-all flex items-center gap-1.5"
            >
              Entity Centrality Metrics
            </button>
          )}

          <button
            onClick={() => setShowPathFinder(!showPathFinder)}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all border flex items-center gap-1.5 ${
              showPathFinder
                ? 'bg-intel-cyan text-dark-950 border-intel-cyan'
                : 'bg-dark-950 border-slate-800 text-intel-cyan hover:bg-intel-cyan/10'
            }`}
          >
            <Waypoints className="w-3.5 h-3.5" /> Hidden Path Finder
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="shrink-0">
        <FilterBar />
      </div>

      {/* Hidden Connection Path Container */}
      {showPathFinder && connectionPathResult && (
        <div className="shrink-0">
          <ConnectionPath pathResult={connectionPathResult} />
        </div>
      )}

      {/* Main 4-Pane Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* PANE 1: LEFT (3 COLS) - Entity Explorer */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 min-h-[300px]">
          <EntityExplorer />
        </div>

        {/* PANE 2: CENTER (6 COLS) - Network Graph */}
        <div className="col-span-12 md:col-span-8 lg:col-span-6 min-h-[350px]">
          <NetworkGraph height="100%" />
        </div>

        {/* PANE 3: RIGHT (3 COLS) - Intelligence Inspector */}
        <div className="col-span-12 md:col-span-12 lg:col-span-3 min-h-[300px]">
          <IntelligenceInspector />
        </div>
      </div>

      {/* PANE 4: BOTTOM (FULL WIDTH) - Investigation Timeline */}
      <div className="h-32 shrink-0">
        <InvestigationTimeline />
      </div>

      {/* Entity Profile Drawer */}
      {showProfileDrawer && selectedEntity && (
        <EntityProfile
          entity={selectedEntity}
          relationships={relationships}
          onClose={() => setShowProfileDrawer(false)}
        />
      )}
    </div>
  );
};
