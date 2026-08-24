import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { EntityType } from '../../types';
import { Badge } from '../common/Badge';
import { Search, Filter, Users, ChevronRight } from 'lucide-react';

const ENTITY_TYPES_FILTER: (EntityType | 'ALL')[] = [
  'ALL', 'PERSON', 'ORGANIZATION', 'LOCATION', 'VEHICLE', 'PHONE', 'ACCOUNT', 'EVENT', 'DOCUMENT'
];

export const EntityExplorer: React.FC = () => {
  const { entities, selectedEntityId, selectEntity } = useInvestigation();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<EntityType | 'ALL'>('ALL');

  const filtered = entities.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType === 'ALL' || e.type === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full bg-dark-900 border border-slate-800 rounded-xl p-3 flex flex-col min-h-0 font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-intel-cyan" />
          <h3 className="font-mono font-bold text-slate-100 uppercase text-xs">
            Entity Explorer
          </h3>
        </div>
        <span className="font-mono text-[10px] text-intel-cyan bg-intel-cyan/10 px-2 py-0.5 rounded border border-intel-cyan/30">
          {filtered.length} / {entities.length}
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-2.5">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search entity, alias, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 focus:border-intel-cyan/50"
        />
      </div>

      {/* Entity Type Filter Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none">
        {ENTITY_TYPES_FILTER.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-2 py-0.5 text-[10px] font-mono rounded shrink-0 border transition-all ${
              activeType === t
                ? 'bg-intel-cyan/20 border-intel-cyan text-intel-cyan font-bold'
                : 'bg-dark-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Scrollable Entity List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.map((e) => {
          const isSelected = selectedEntityId === e.id;
          return (
            <div
              key={e.id}
              onClick={() => selectEntity(e.id)}
              className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                isSelected
                  ? 'bg-dark-850 border-intel-cyan text-slate-100 font-medium shadow-md shadow-cyan-950/20'
                  : 'bg-dark-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100 truncate max-w-[130px]">{e.name}</span>
                <Badge label={e.type} variant="entity" typeValue={e.type} size="sm" />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-slate-500">
                <span>{e.connection_count || 0} links</span>
                <span className="text-intel-cyan">Risk: {(e.risk_score * 100).toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
