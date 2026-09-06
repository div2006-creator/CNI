import React, { useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import { Entity } from '../../types';

interface SearchEntityProps {
  entities: Entity[];
  onSelectEntity: (entityId: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchEntity: React.FC<SearchEntityProps> = ({
  entities,
  onSelectEntity,
  placeholder = 'Search target entity by name, ID, or alias...',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const matches = query.trim()
    ? entities.filter(e => e.name.toLowerCase().includes(query.toLowerCase()) || e.id.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-[#f8f6f0] border border-[#e5dfd3] rounded-lg text-stone-900 pl-9 pr-8 py-2 text-xs font-mono focus:outline-none focus:border-saffron-500 placeholder-stone-400"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && matches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#fcfcf9] border border-[#e5dfd3] rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
          {matches.map((e) => (
            <div
              key={e.id}
              onClick={() => { onSelectEntity(e.id); setQuery(e.name); setIsOpen(false); }}
              className="p-2.5 hover:bg-[#f3efe6] cursor-pointer border-b border-[#e5dfd3] flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-semibold text-stone-900">{e.name}</div>
                <div className="text-[10px] font-mono text-stone-500">{e.id} | {e.type}</div>
              </div>
              <span className="text-[10px] font-mono text-saffron-700">Risk: {(e.risk_score * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
