import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { Investigation, Entity } from '../types';
import { Briefcase, UserCheck, Plus, FileText, Tag, Calendar, User } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-intel-cyan" /> Investigation Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage active criminal intelligence case boards, lead evidence, and entity assignments.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 bg-intel-cyan/10 hover:bg-intel-cyan/20 border border-intel-cyan/40 text-intel-cyan text-xs font-mono font-semibold rounded-lg transition-all">
          <Plus className="w-4 h-4" /> Open New Case File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cases List */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Active Case Boards ({cases.length})
          </h3>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedCase?.id === c.id
                  ? 'bg-dark-900 border-intel-cyan/60 shadow-lg shadow-cyan-950/20'
                  : 'bg-dark-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-intel-cyan">{c.case_number}</span>
                <Badge label={c.priority} variant="severity" typeValue={c.priority} size="sm" />
              </div>
              <h4 className="text-sm font-semibold text-slate-100 mt-2">{c.title}</h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.summary}</p>
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> {c.lead_investigator}
                </span>
                <span>{c.assigned_entity_ids.length} Entities</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed Case Board (2 Columns) */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-intel-cyan">{selectedCase.case_number}</span>
                      <Badge label={selectedCase.status} variant="status" typeValue={selectedCase.status} size="sm" />
                      <Badge label={selectedCase.priority} variant="severity" typeValue={selectedCase.priority} size="sm" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mt-1">{selectedCase.title}</h3>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-400">
                    <div>Lead: <span className="text-slate-200">{selectedCase.lead_investigator}</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Updated: {new Date(selectedCase.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-mono font-semibold uppercase text-slate-400 mb-1">Executive Summary</h5>
                  <p className="text-xs text-slate-300 leading-relaxed bg-dark-950 p-3 rounded-lg border border-slate-800">
                    {selectedCase.summary}
                  </p>
                </div>

                {/* Case Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {selectedCase.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Assigned Key Entities */}
                <div>
                  <h5 className="text-xs font-mono font-semibold uppercase text-slate-400 mb-2 flex items-center justify-between">
                    <span>Target Entities Linked ({assignedEntities.length})</span>
                    <button className="text-[11px] text-intel-cyan hover:underline font-normal">+ Link Entity</button>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedEntities.map((ent) => (
                      <div key={ent.id} className="p-3 bg-dark-950 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{ent.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge label={ent.type} variant="entity" typeValue={ent.type} size="sm" />
                            <span className="text-[10px] font-mono text-slate-400">Risk: {(ent.risk_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <Badge label={ent.risk_level} variant="risk" typeValue={ent.risk_level} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence & Lead Notes Stream */}
                <div>
                  <h5 className="text-xs font-mono font-semibold uppercase text-slate-400 mb-2 flex items-center justify-between">
                    <span>Investigative Lead Log</span>
                    <span className="text-[10px] font-mono text-slate-500">{selectedCase.notes_count} entries recorded</span>
                  </h5>
                  <div className="space-y-2">
                    <div className="p-3 bg-dark-950 border border-slate-800/80 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-intel-cyan font-semibold">Lead Note #14 - Financial Intercept</span>
                        <span>Today 14:22 GMT</span>
                      </div>
                      <p className="text-slate-300">
                        Cross-matched $500k wire transfer with offshore registry SYN-882910. Confirming beneficial owner connection to Subject Alpha.
                      </p>
                    </div>
                    <div className="p-3 bg-dark-950 border border-slate-800/80 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-intel-cyan font-semibold">Lead Note #13 - Cell Telemetry</span>
                        <span>Yesterday 09:15 GMT</span>
                      </div>
                      <p className="text-slate-300">
                        Surveillance team confirmed co-location of Subject Bravo at Warehouse Hub 7. Recommending physical surveillance extension.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
