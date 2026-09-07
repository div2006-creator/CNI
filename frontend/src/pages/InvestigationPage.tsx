import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { Investigation, Entity } from '../types';
import { Briefcase, Plus, Tag, User } from 'lucide-react';

export const InvestigationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Investigation[]>([]);
  const [selectedCase, setSelectedCase] = useState<Investigation | null>(null);
  const [assignedEntities, setAssignedEntities] = useState<Entity[]>([]);

  useEffect(() => {
    async function loadCases() {
      try {
        const invs = await apiService.getInvestigations();
        setCases(invs);
        if (invs.length > 0) {
          setSelectedCase(invs[0]);
        }
      } catch (err) {
        console.error('Error loading cases:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  useEffect(() => {
    if (!selectedCase) return;
    const activeCase = selectedCase;
    async function loadAssigned() {
      const allEnts = await apiService.getEntities();
      const matched = allEnts.filter(e => activeCase.assigned_entity_ids.includes(e.id));
      setAssignedEntities(matched);
    }
    loadAssigned();
  }, [selectedCase]);

  if (loading) return <LoadingSpinner message="Fetching investigation case workspace..." />;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-saffron-600" /> Investigation Case Board Workspace
          </h2>
          <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
            Manage active criminal intelligence case boards, lead evidence, and entity assignments.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white text-xs font-mono font-bold rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Open New Case File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cases List */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">
            Active Case Boards ({cases.length})
          </h3>
          {cases.length > 0 ? (
            cases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  selectedCase?.id === c.id
                    ? 'bg-[#fcfcf9] border-saffron-500 shadow-md ring-1 ring-saffron-300'
                    : 'bg-[#f8f6f0] border-[#e5dfd3] hover:border-saffron-300 hover:bg-[#fcfcf9]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-saffron-700 bg-saffron-50 px-2.5 py-1 rounded-md border border-saffron-200">{c.case_number}</span>
                  <Badge label={c.priority} variant="severity" typeValue={c.priority} size="sm" />
                </div>
                <h4 className="text-base font-bold text-stone-900 leading-snug">{c.title}</h4>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{c.summary}</p>
                <div className="pt-2.5 border-t border-[#e5dfd3] flex items-center justify-between text-xs text-stone-600 font-mono">
                  <span className="flex items-center gap-1.5 font-semibold text-stone-800">
                    <User className="w-3.5 h-3.5 text-saffron-600" /> {c.lead_investigator}
                  </span>
                  <span className="font-semibold">{c.assigned_entity_ids.length} Entities</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl space-y-2">
              <Briefcase className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-xs font-mono text-stone-600">No active cases opened.</p>
              <p className="text-[11px] text-stone-500">Click &quot;Open New Case File&quot; to register a case file.</p>
            </div>
          )}
        </div>

        {/* Right: Detailed Case Board (2 Columns) */}
        {selectedCase ? (
          <div className="lg:col-span-2 space-y-6">
            <Card title="Active Case Detail Inspector" subtitle="Full case overview, linked suspects, and chronological lead notes." className="bg-[#fcfcf9] border-[#e5dfd3]">
              <div className="space-y-6 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5dfd3] pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-saffron-700 bg-saffron-50 px-2.5 py-1 rounded-md border border-saffron-200">{selectedCase.case_number}</span>
                      <Badge label={selectedCase.status} variant="status" typeValue={selectedCase.status} size="sm" />
                      <Badge label={selectedCase.priority} variant="severity" typeValue={selectedCase.priority} size="sm" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mt-2">{selectedCase.title}</h3>
                  </div>
                  <div className="text-right font-mono text-xs text-stone-600 space-y-1">
                    <div>Lead: <strong className="text-stone-900">{selectedCase.lead_investigator}</strong></div>
                    <div className="text-xs text-stone-500">Updated: {new Date(selectedCase.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600">Executive Briefing Summary</h5>
                  <p className="text-xs md:text-sm text-stone-800 leading-relaxed bg-[#f8f6f0] p-4 rounded-xl border border-[#e5dfd3] shadow-inner">
                    {selectedCase.summary}
                  </p>
                </div>

                {/* Case Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-saffron-600" />
                  {selectedCase.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 bg-[#f8f6f0] text-stone-800 text-xs font-mono font-semibold rounded-lg border border-[#e5dfd3]">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Assigned Key Entities */}
                <div className="space-y-3">
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 flex items-center justify-between">
                    <span>Target Entities Linked ({assignedEntities.length})</span>
                    <button className="text-xs font-mono text-saffron-700 hover:underline font-bold">+ Link Entity</button>
                  </h5>
                  {assignedEntities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {assignedEntities.map((ent) => (
                        <div key={ent.id} className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl flex items-center justify-between gap-2 shadow-sm">
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-stone-900">{ent.name}</div>
                            <div className="flex items-center gap-2">
                              <Badge label={ent.type} variant="entity" typeValue={ent.type} size="sm" />
                              <span className="text-xs font-mono text-stone-600">Risk: <strong className="text-rose-600">{(ent.risk_score * 100).toFixed(0)}%</strong></span>
                            </div>
                          </div>
                          <Badge label={ent.risk_level} variant="risk" typeValue={ent.risk_level} size="sm" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-stone-500">No entities linked to this case file yet.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="lg:col-span-2">
            <Card title="Case Inspector" className="bg-[#fcfcf9] border-[#e5dfd3]">
              <div className="p-8 text-center text-stone-500 font-mono text-xs">
                Select a case board to inspect detailed lead logs and entity links.
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
