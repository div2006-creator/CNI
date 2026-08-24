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
    <div className="space-y-8 font-sans">
      {/* Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-intel-cyan" /> Investigation Case Board Workspace
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            Manage active criminal intelligence case boards, lead evidence, and entity assignments.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-intel-cyan/10 hover:bg-intel-cyan/20 border border-intel-cyan/40 text-intel-cyan text-xs font-mono font-bold rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Open New Case File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cases List */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Active Case Boards ({cases.length})
          </h3>
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedCase?.id === c.id
                  ? 'bg-dark-900 border-intel-cyan shadow-xl ring-1 ring-intel-cyan/30'
                  : 'bg-dark-900/70 border-slate-800/80 hover:border-slate-700/80 hover:bg-dark-900/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-intel-cyan bg-intel-cyan/10 px-2.5 py-1 rounded-md border border-intel-cyan/30">{c.case_number}</span>
                <Badge label={c.priority} variant="severity" typeValue={c.priority} size="sm" />
              </div>
              <h4 className="text-base font-bold text-slate-100 leading-snug">{c.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.summary}</p>
              <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <User className="w-3.5 h-3.5 text-intel-cyan" /> {c.lead_investigator}
                </span>
                <span className="font-semibold">{c.assigned_entity_ids.length} Entities</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed Case Board (2 Columns) */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-6">
            <Card title="Active Case Detail Inspector" subtitle="Full case overview, linked suspects, and chronological lead notes.">
              <div className="space-y-6 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-intel-cyan bg-intel-cyan/10 px-2.5 py-1 rounded-md border border-intel-cyan/30">{selectedCase.case_number}</span>
                      <Badge label={selectedCase.status} variant="status" typeValue={selectedCase.status} size="sm" />
                      <Badge label={selectedCase.priority} variant="severity" typeValue={selectedCase.priority} size="sm" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100 mt-2">{selectedCase.title}</h3>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-400 space-y-1">
                    <div>Lead: <strong className="text-slate-200">{selectedCase.lead_investigator}</strong></div>
                    <div className="text-xs text-slate-400">Updated: {new Date(selectedCase.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Executive Briefing Summary</h5>
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed bg-dark-950/90 p-4 rounded-xl border border-slate-800/90 shadow-inner">
                    {selectedCase.summary}
                  </p>
                </div>

                {/* Case Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-intel-cyan" />
                  {selectedCase.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 bg-dark-950 text-slate-300 text-xs font-mono font-semibold rounded-lg border border-slate-800/80">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Assigned Key Entities */}
                <div className="space-y-3">
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Target Entities Linked ({assignedEntities.length})</span>
                    <button className="text-xs font-mono text-intel-cyan hover:underline font-bold">+ Link Entity</button>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {assignedEntities.map((ent) => (
                      <div key={ent.id} className="p-4 bg-dark-950/90 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-100">{ent.name}</div>
                          <div className="flex items-center gap-2">
                            <Badge label={ent.type} variant="entity" typeValue={ent.type} size="sm" />
                            <span className="text-xs font-mono text-slate-400">Risk: <strong className="text-rose-400">{(ent.risk_score * 100).toFixed(0)}%</strong></span>
                          </div>
                        </div>
                        <Badge label={ent.risk_level} variant="risk" typeValue={ent.risk_level} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence & Lead Notes Stream */}
                <div className="space-y-3">
                  <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Investigative Lead Log</span>
                    <span className="text-xs font-mono text-slate-400">{selectedCase.notes_count} entries recorded</span>
                  </h5>
                  <div className="space-y-3">
                    <div className="p-4 bg-dark-950/90 border border-slate-800/90 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-intel-cyan font-bold bg-intel-cyan/10 px-2 py-0.5 rounded border border-intel-cyan/30">Lead Note #14 - Financial Intercept</span>
                        <span className="text-slate-400">Today 14:22 GMT</span>
                      </div>
                      <p className="text-slate-200 text-xs md:text-sm leading-relaxed pt-1">
                        Cross-matched $500k wire transfer with offshore registry SYN-882910. Confirming beneficial owner connection to Subject Alpha.
                      </p>
                    </div>
                    <div className="p-4 bg-dark-950/90 border border-slate-800/90 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-intel-cyan font-bold bg-intel-cyan/10 px-2 py-0.5 rounded border border-intel-cyan/30">Lead Note #13 - Cell Telemetry</span>
                        <span className="text-slate-400">Yesterday 09:15 GMT</span>
                      </div>
                      <p className="text-slate-200 text-xs md:text-sm leading-relaxed pt-1">
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
