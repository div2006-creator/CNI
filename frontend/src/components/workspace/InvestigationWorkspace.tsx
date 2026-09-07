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
  caseTitle = 'Active Case Investigation',
  caseNumber = 'INV-ACTIVE-001'
}) => {
  const { selectedEntity, selectEntity, relationships, connectionPathResult } = useInvestigation();
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showPathFinder, setShowPathFinder] = useState(false);

  return (
    <div className="space-y-4 h-[calc(100vh-90px)] flex flex-col font-sans">
      {/* Workspace Bar */}
      <div className="bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-saffron-700 bg-saffron-50 px-2.5 py-1 rounded border border-saffron-200">
            {caseNumber}
          </span>
          <h2 className="text-sm font-bold text-stone-900">{caseTitle} — Coordinated Investigation Workspace</h2>
        </div>

        <div className="flex items-center gap-2">
          {selectedEntity && (
            <button
              onClick={() => setShowProfileDrawer(true)}
              className="px-3 py-1.5 bg-[#f8f6f0] hover:bg-[#f0ebd9] border border-[#e5dfd3] text-xs font-mono text-stone-800 rounded-lg transition-all flex items-center gap-1.5"
            >
              Entity Centrality Metrics
            </button>
          )}

          <button
            onClick={() => setShowPathFinder(!showPathFinder)}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all border flex items-center gap-1.5 ${
              showPathFinder
                ? 'bg-saffron-500 text-white border-saffron-600'
                : 'bg-[#f8f6f0] border-[#e5dfd3] text-saffron-700 hover:bg-saffron-50'
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
