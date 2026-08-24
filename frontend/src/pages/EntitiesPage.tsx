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
          <div className="p-5 bg-dark-900/90 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search entity name, alias, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-dark-950/90 border border-slate-800 rounded-xl text-slate-200 pl-10 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:border-intel-cyan/50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedType('')}
                className={`px-3.5 py-2 text-xs font-mono rounded-xl border transition-all ${
                  selectedType === '' ? 'bg-intel-cyan/20 border-intel-cyan text-intel-cyan font-bold shadow-sm' : 'bg-dark-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Types
              </button>
              {['PERSON', 'ORGANIZATION', 'ACCOUNT', 'PHONE', 'LOCATION', 'VEHICLE', 'DOCUMENT'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-2 text-xs font-mono rounded-xl border transition-all ${
                    selectedType === t ? 'bg-intel-cyan/20 border-intel-cyan text-intel-cyan font-bold shadow-sm' : 'bg-dark-950 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={selectedEntity ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <Card title="Entity Directory Registry" subtitle="Click any entity row to inspect full property details.">
                {loading ? (
                  <LoadingSpinner message="Filtering entity directory..." />
                ) : (
                  <div className="intel-table-container">
                    <table className="intel-table">
                      <thead>
                        <tr>
                          <th>Entity Identifier</th>
                          <th>Type</th>
                          <th>Risk Level</th>
                          <th>Role</th>
                          <th>Connections</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entities.map((e) => (
                          <tr
                            key={e.id}
                            onClick={() => setSelectedEntity(e)}
                            className={`hover:bg-dark-850/80 transition-colors cursor-pointer ${selectedEntity?.id === e.id ? 'bg-dark-850/90 border-l-4 border-l-intel-cyan' : ''}`}
                          >
                            <td className="font-semibold text-slate-100">
                              <div className="flex items-center gap-2">
                                <span>{e.name}</span>
                                {e.is_bridge_node && (
                                  <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/80 rounded-md font-bold">
                                    BRIDGE NODE
                                  </span>
                                )}
                              </div>
                            </td>
                            <td><Badge label={e.type} variant="entity" typeValue={e.type} size="sm" /></td>
                            <td><Badge label={e.risk_level} variant="risk" typeValue={e.risk_level} size="sm" /></td>
                            <td className="font-mono text-xs text-slate-400">{e.role || 'Subject'}</td>
                            <td className="font-mono text-slate-300 font-semibold">{e.connection_count || 0} links</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {selectedEntity && (
              <Card title="Entity Inspector Sheet" subtitle="Detailed extracted metadata & relationship status.">
                <div className="space-y-5">
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <Badge label={selectedEntity.type} variant="entity" typeValue={selectedEntity.type} size="sm" />
                      <h3 className="text-lg font-bold text-slate-100 mt-2">{selectedEntity.name}</h3>
                      <p className="text-xs font-mono text-slate-400">ID: {selectedEntity.id}</p>
                    </div>
                    <Badge label={selectedEntity.risk_level} variant="risk" typeValue={selectedEntity.risk_level} size="sm" />
                  </div>

                  {/* Formatted Key-Value Grid */}
                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-4 bg-dark-950/90 border border-slate-800/80 rounded-xl space-y-3">
                      <div>
                        <span className="intel-data-label">Primary Role</span>
                        <span className="intel-data-value text-slate-200">{selectedEntity.role || 'Unspecified Subject'}</span>
                      </div>
                      <div>
                        <span className="intel-data-label">Centrality Score</span>
                        <span className="intel-data-value font-mono text-intel-cyan">{((selectedEntity.centrality || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="intel-data-label">Extracted Attributes</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedEntity.aliases?.map((a: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 text-[11px] font-mono bg-dark-900 text-slate-300 border border-slate-800 rounded">
                              Alias: {a}
                            </span>
                          )) || <span className="text-slate-500">None recorded</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="w-full py-2.5 bg-dark-850 hover:bg-dark-800 text-xs font-mono font-semibold text-slate-300 rounded-xl border border-slate-800/80 transition-all"
                  >
                    Close Inspector Sheet
                  </button>
                </div>
              </Card>
            )}
          </div>
        </>
      ) : (
        /* RESOLUTION TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {candidates.map((cand) => (
            <Card key={cand.id} className="border-slate-800/80">
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-intel-cyan font-bold bg-intel-cyan/10 px-2.5 py-1 rounded-md border border-intel-cyan/30">
                    Similarity Match: {(cand.similarity_score * 100).toFixed(0)}%
                  </span>
                  <Badge label={cand.status} variant="status" typeValue={cand.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 bg-dark-950/90 border border-slate-800/80 rounded-xl">
                  <div>
                    <span className="intel-data-label">Candidate A</span>
                    <span className="font-semibold text-slate-100 text-sm">{cand.name_1}</span>
                  </div>
                  <div>
                    <span className="intel-data-label">Candidate B</span>
                    <span className="font-semibold text-slate-100 text-sm">{cand.name_2}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-dark-950/70 border border-slate-800/60 rounded-xl text-xs space-y-1">
                  <span className="intel-data-label">AI Disambiguation Analysis</span>
                  <p className="text-slate-300 leading-relaxed text-xs">{cand.explanation}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs font-mono">
                  <span className="text-slate-400">Matches: <strong className="text-slate-200">{cand.matching_attributes.join(', ')}</strong></span>
                  <button
                    onClick={() => handleMerge(cand.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-intel-cyan/10 hover:bg-intel-cyan/20 border border-intel-cyan/40 text-intel-cyan text-xs font-mono font-bold rounded-xl transition-all shrink-0"
                  >
                    {mergedId === cand.id ? <><Check className="w-4 h-4" /> Merged</> : <><GitMerge className="w-4 h-4" /> Confirm Merge</>}
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
