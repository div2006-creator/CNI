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
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-saffron-600" /> Tracked Entity Directory & Identity Resolution
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Searchable registry of extracted entities and candidate identity resolution matches for investigator review.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-[#f3efe6] border border-[#e5dfd3] rounded-xl font-mono text-xs">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'directory' ? 'bg-saffron-500 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Entity Directory ({entities.length})
          </button>
          <button
            onClick={() => setActiveTab('resolution')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'resolution' ? 'bg-saffron-500 text-white font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GitMerge className="w-3.5 h-3.5" /> Resolution Candidates ({candidates.length})
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          {/* Controls Bar */}
          <div className="p-5 bg-[#fcfcf9] border border-[#e5dfd3] rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search entity name, alias, tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl text-stone-900 pl-10 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:border-saffron-500 placeholder-stone-400"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedType('')}
                className={`px-3.5 py-2 text-xs font-mono rounded-xl border transition-all ${
                  selectedType === '' ? 'bg-saffron-50 border-saffron-300 text-saffron-800 font-bold shadow-sm' : 'bg-[#f8f6f0] border-[#e5dfd3] text-stone-600 hover:text-stone-900'
                }`}
              >
                All Types
              </button>
              {['PERSON', 'ORGANIZATION', 'ACCOUNT', 'PHONE', 'LOCATION', 'VEHICLE', 'DOCUMENT'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-2 text-xs font-mono rounded-xl border transition-all ${
                    selectedType === t ? 'bg-saffron-50 border-saffron-300 text-saffron-800 font-bold shadow-sm' : 'bg-[#f8f6f0] border-[#e5dfd3] text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={selectedEntity ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <Card title="Entity Directory Registry" subtitle="Click any entity row to inspect full property details." className="bg-[#fcfcf9] border-[#e5dfd3]">
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
                            className={`hover:bg-[#f3efe6]/80 transition-colors cursor-pointer ${selectedEntity?.id === e.id ? 'bg-[#f0ebd9] border-l-4 border-l-saffron-500' : ''}`}
                          >
                            <td className="font-semibold text-stone-900">
                              <div className="flex items-center gap-2">
                                <span>{e.name}</span>
                                {e.is_bridge_node && (
                                  <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold">
                                    BRIDGE NODE
                                  </span>
                                )}
                              </div>
                            </td>
                            <td><Badge label={e.type} variant="entity" typeValue={e.type} size="sm" /></td>
                            <td><Badge label={e.risk_level} variant="risk" typeValue={e.risk_level} size="sm" /></td>
                            <td className="font-mono text-xs text-stone-600">{e.role || 'Subject'}</td>
                            <td className="font-mono text-stone-800 font-semibold">{e.connection_count || 0} links</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {selectedEntity && (
              <Card title="Entity Inspector Sheet" subtitle="Detailed extracted metadata & relationship status." className="bg-[#fcfcf9] border-[#e5dfd3]">
                <div className="space-y-5">
                  <div className="flex items-start justify-between border-b border-[#e5dfd3] pb-4">
                    <div className="space-y-1">
                      <Badge label={selectedEntity.type} variant="entity" typeValue={selectedEntity.type} size="sm" />
                      <h3 className="text-lg font-bold text-stone-900 mt-2">{selectedEntity.name}</h3>
                      <p className="text-xs font-mono text-stone-600">ID: {selectedEntity.id}</p>
                    </div>
                    <Badge label={selectedEntity.risk_level} variant="risk" typeValue={selectedEntity.risk_level} size="sm" />
                  </div>

                  {/* Formatted Key-Value Grid */}
                  <div className="space-y-3 font-sans text-xs">
                    <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-3">
                      <div>
                        <span className="intel-data-label">Primary Role</span>
                        <span className="intel-data-value text-stone-800">{selectedEntity.role || 'Unspecified Subject'}</span>
                      </div>
                      <div>
                        <span className="intel-data-label">Centrality Score</span>
                        <span className="intel-data-value font-mono text-saffron-700">{((selectedEntity.centrality || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="intel-data-label">Extracted Attributes</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {selectedEntity.aliases?.map((a: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 text-[11px] font-mono bg-[#f3efe6] text-stone-800 border border-[#e5dfd3] rounded">
                              Alias: {a}
                            </span>
                          )) || <span className="text-stone-400">None recorded</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="w-full py-2.5 bg-[#f3efe6] hover:bg-[#f0ebd9] text-xs font-mono font-semibold text-stone-700 rounded-xl border border-[#e5dfd3] transition-all"
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
            <Card key={cand.id} className="border-[#e5dfd3] bg-[#fcfcf9]">
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-saffron-700 font-bold bg-saffron-50 px-2.5 py-1 rounded-md border border-saffron-200">
                    Similarity Match: {(cand.similarity_score * 100).toFixed(0)}%
                  </span>
                  <Badge label={cand.status} variant="status" typeValue={cand.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl">
                  <div>
                    <span className="intel-data-label">Candidate A</span>
                    <span className="font-semibold text-stone-900 text-sm">{cand.name_1}</span>
                  </div>
                  <div>
                    <span className="intel-data-label">Candidate B</span>
                    <span className="font-semibold text-stone-900 text-sm">{cand.name_2}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl text-xs space-y-1">
                  <span className="intel-data-label">AI Disambiguation Analysis</span>
                  <p className="text-stone-700 leading-relaxed text-xs">{cand.explanation}</p>
                </div>

                <div className="pt-3 border-t border-[#e5dfd3] flex items-center justify-between gap-3 text-xs font-mono">
                  <span className="text-stone-600">Matches: <strong className="text-stone-900">{cand.matching_attributes.join(', ')}</strong></span>
                  <button
                    onClick={() => handleMerge(cand.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-saffron-50 hover:bg-saffron-100 border border-saffron-300 text-saffron-700 text-xs font-mono font-bold rounded-xl transition-all shrink-0"
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
