import React from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { EntityType, RelationshipType } from '../../types';
import { Filter, Sliders, RotateCcw, CheckSquare, Square, Layers } from 'lucide-react';

const ENTITY_TYPES_LIST: EntityType[] = [
  'PERSON', 'ORGANIZATION', 'LOCATION', 'VEHICLE', 'PHONE', 'ACCOUNT', 'EVENT', 'CASE', 'DOCUMENT'
];

const REL_TYPES_LIST: RelationshipType[] = [
  'KNOWS', 'CALLS', 'MESSAGED', 'TRANSFERRED_TO', 'OWNS', 'VISITED', 'WORKS_FOR', 'ASSOCIATED_WITH', 'PARTICIPATED_IN', 'LOCATED_AT', 'USES', 'CONNECTED_TO', 'MENTIONED_IN'
];

export const FilterBar: React.FC = () => {
  const { filterState, updateFilters, resetFilters } = useInvestigation();

  const toggleEntityType = (t: EntityType) => {
    const current = filterState.entityTypes;
    if (current.includes(t)) {
      if (current.length > 1) {
        updateFilters({ entityTypes: current.filter(x => x !== t) });
      }
    } else {
      updateFilters({ entityTypes: [...current, t] });
    }
  };

  const toggleRelType = (r: RelationshipType) => {
    const current = filterState.relationshipTypes;
    if (current.includes(r)) {
      if (current.length > 1) {
        updateFilters({ relationshipTypes: current.filter(x => x !== r) });
      }
    } else {
      updateFilters({ relationshipTypes: [...current, r] });
    }
  };

  return (
    <div className="p-3.5 bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl space-y-3 font-sans text-xs shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5dfd3] pb-2.5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-saffron-600" />
          <span className="font-mono font-bold text-stone-900 uppercase tracking-wider text-xs">
            Advanced Network Filter Bar
          </span>
        </div>

        {/* Network Depth Hops (1-4+) */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-stone-600">Network Depth:</span>
          {[1, 2, 3, 4].map(hop => (
            <button
              key={hop}
              onClick={() => updateFilters({ networkDepth: hop })}
              className={`px-2.5 py-1 rounded border font-bold transition-all ${
                filterState.networkDepth === hop
                  ? 'bg-saffron-500 text-white border-saffron-600'
                  : 'bg-[#f8f6f0] border-[#e5dfd3] text-stone-600 hover:text-stone-900'
              }`}
            >
              {hop === 4 ? '4+ Hops' : `${hop} Hop${hop > 1 ? 's' : ''}`}
            </button>
          ))}
        </div>

        {/* Confidence & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-stone-600">Min Confidence:</span>
            <input
              type="range"
              min="0.0"
              max="0.9"
              step="0.1"
              value={filterState.minConfidence}
              onChange={(e) => updateFilters({ minConfidence: parseFloat(e.target.value) })}
              className="w-24 accent-saffron-600 cursor-pointer"
            />
            <span className="text-saffron-700 font-bold w-8">{(filterState.minConfidence * 100).toFixed(0)}%</span>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#f8f6f0] hover:bg-[#f0ebd9] border border-[#e5dfd3] text-stone-600 hover:text-stone-900 rounded font-mono text-[11px] transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-stone-500" /> Reset
          </button>
        </div>
      </div>

      {/* Toggles Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Entity Type Filter Pills */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-mono text-[10px] uppercase text-stone-500 mr-1">Entities:</span>
          {ENTITY_TYPES_LIST.map(t => {
            const active = filterState.entityTypes.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleEntityType(t)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-all ${
                  active
                    ? 'bg-[#f3efe6] border-saffron-300 text-stone-900 font-semibold'
                    : 'bg-[#f8f6f0] border-[#e5dfd3] text-stone-400 opacity-60'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Evidence Required Toggle */}
        <button
          onClick={() => updateFilters({ requireEvidence: !filterState.requireEvidence })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] transition-all ${
            filterState.requireEvidence
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
              : 'bg-[#f8f6f0] border-[#e5dfd3] text-stone-600'
          }`}
        >
          {filterState.requireEvidence ? <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Square className="w-3.5 h-3.5" />}
          Must Have Evidence Link
        </button>
      </div>
    </div>
  );
};
