import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { apiService } from '../services/api';
import { Entity, ResolutionCandidate } from '../types';
import { Users, Search, Filter, Plus, GitMerge, Check, Eye } from 'lucide-react';

export const EntitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'resolution'>('directory');
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [candidates, setCandidates] = useState<ResolutionCandidate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [mergedId, setMergedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [ents, res] = await Promise.all([
          apiService.getEntities(selectedType || undefined, 0.0, search || undefined),
          apiService.getResolutionCandidates()
        ]);
        setEntities(ents);
        setCandidates(res);
      } catch (err) {
        console.error('Entities fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [search, selectedType]);

  const handleMerge = (candId: string) => {
    setMergedId(candId);
    setTimeout(() => setMergedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-intel-cyan" /> Tracked Entity Directory & Identity Resolution
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Searchable registry of extracted entities and candidate identity resolution matches for investigator review.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-dark-900 border border-slate-800 rounded-xl font-mono text-xs">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'directory' ? 'bg-intel-cyan text-dark-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entity Directory ({entities.length})
          </button>
          <button
            onClick={() => setActiveTab('resolution')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'resolution' ? 'bg-intel-cyan text-dark-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" /> Resolution Candidates ({candidates.length})
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Controls Bar */}
          <div className="p-4 bg-dark-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search entity name, alias, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-lg text-slate-200 pl-9 pr-4 py-2 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedType('')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                  selectedType === '' ? 'bg-intel-cyan/20 border-intel-cyan text-intel-cyan font-semibold' : 'bg-dark-950 border-slate-800 text-slate-400'
                }`}
              >
                All Types
              </button>
              {['PERSON', 'ORGANIZATION', 'ACCOUNT', 'PHONE', 'LOCATION', 'VEHICLE', 'DOCUMENT'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                    selectedType === t ? 'bg-intel-cyan/20 border-intel-cyan text-intel-cyan font-semibold' : 'bg-dark-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={selectedEntity ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <Card>
                {loading ? (
                  <LoadingSpinner message="Filtering entity directory..." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-dark-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Entity Identifier</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Risk Level</th>
                          <th className="py-3 px-4">Connections</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {entities.map((e) => (
                          <tr
                            key={e.id}
                            onClick={() => setSelectedEntity(e)}
                            className="hover:bg-dark-850/60 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 font-semibold text-slate-100">{e.name}</td>
                            <td className="py-3 px-4"><Badge label={e.type} variant="entity" typeValue={e.type} size="sm" /></td>
                            <td className="py-3 px-4"><Badge label={e.risk_level} variant="risk" typeValue={e.risk_level} size="sm" /></td>
                            <td className="py-3 px-4 font-mono text-slate-400">{e.connection_count || 0} links</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {selectedEntity && (
              <Card title="Entity Profile Inspector">
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <Badge label={selectedEntity.type} variant="entity" typeValue={selectedEntity.type} size="sm" />
                      <h3 className="text-sm font-bold text-slate-100 mt-2">{selectedEntity.name}</h3>
                    </div>
                    <Badge label={selectedEntity.risk_level} variant="risk" typeValue={selectedEntity.risk_level} size="sm" />
                  </div>
                  <button onClick={() => setSelectedEntity(null)} className="w-full py-2 bg-dark-850 text-xs font-mono text-slate-400 rounded-lg">
                    Close Inspector
                  </button>
                </div>
              </Card>
            )}
          </div>
        </>
      ) : (
        /* RESOLUTION TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((cand) => (
            <Card key={cand.id} className="border-slate-800/80">
              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-intel-cyan font-bold">Similarity: {(cand.similarity_score * 100).toFixed(0)}%</span>
                  <Badge label={cand.status} variant="status" typeValue={cand.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-dark-950 border border-slate-800 rounded-lg">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Candidate 1</span>
                    <span className="font-semibold text-slate-100 text-xs">{cand.name_1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Candidate 2</span>
                    <span className="font-semibold text-slate-100 text-xs">{cand.name_2}</span>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">{cand.explanation}</p>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">Matching: {cand.matching_attributes.join(', ')}</span>
                  <button
                    onClick={() => handleMerge(cand.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-intel-cyan/10 hover:bg-intel-cyan/20 border border-intel-cyan/40 text-intel-cyan text-xs font-mono font-semibold rounded-lg transition-all"
                  >
                    {mergedId === cand.id ? <><Check className="w-3.5 h-3.5" /> Merged</> : <><GitMerge className="w-3.5 h-3.5" /> Confirm Merge</>}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
