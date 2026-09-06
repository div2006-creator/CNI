import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { EvidenceItem, RelationshipEvidenceExplanation } from '../types';
import { 
  FileCheck2, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Clock, 
  Activity,
  FileText
} from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [explanation, setExplanation] = useState<RelationshipEvidenceExplanation | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'explanation' | 'raw'>('explanation');

  useEffect(() => {
    async function loadEvidenceData() {
      try {
        const [eList, expData] = await Promise.all([
          apiService.getEvidenceList(),
          apiService.getRelationshipEvidenceExplanation('rel-14') // Subject Alpha to Subject Delta default demo
        ]);
        setEvidenceList(eList);
        if (eList.length > 0) setSelectedEvidence(eList[0]);
        setExplanation(expData);
      } catch (err) {
        console.error('Evidence error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvidenceData();
  }, []);

  if (loading) return <LoadingSpinner message="Opening Evidence Vault & Confidence Engine..." />;

  const filtered = evidenceList.filter(
    e => e.title.toLowerCase().includes(search.toLowerCase()) || 
         e.source_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <FileCheck2 className="w-7 h-7 text-saffron-600" /> Evidence Vault & Confidence Engine
          </h2>
          <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
            Every graph node and relationship is backed by explainable confidence scores, source reliability ratings, supporting vs. contradicting evidence, and audit provenance.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-[#f3efe6] border border-[#e5dfd3] rounded-xl">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'explanation'
                ? 'bg-saffron-500 text-white font-bold shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Activity className="w-4 h-4" /> Explainable Confidence Dossier
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'raw'
                ? 'bg-saffron-500 text-white font-bold shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Raw Evidence Vault ({evidenceList.length})
          </button>
        </div>
      </div>

      {activeTab === 'explanation' && explanation && (
        <div className="space-y-6">
          {/* Main Relationship Headline Banner */}
          <div className="p-6 bg-[#fcfcf9] border border-[#e5dfd3] rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-saffron-700">
                <span className="bg-saffron-50 px-2.5 py-0.5 rounded border border-saffron-200 font-bold">RELATIONSHIP ANALYSIS</span>
                <span>ID: {explanation.relationship_id}</span>
              </div>
              <div className="flex items-center gap-4 text-xl font-bold text-stone-900">
                <span>Alpha (Broker)</span>
                <span className="text-saffron-600 font-mono">────── {explanation.relationship_type} ──────</span>
                <span>Delta (Accountant)</span>
              </div>
              <p className="text-xs text-stone-600 font-mono">
                Source: Primary Cell Towers & Offshore Incorporation Filing (Provenanced)
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl">
              <div className="text-right">
                <div className="text-xs font-mono uppercase tracking-wider text-stone-600">Relationship Confidence</div>
                <div className="text-2xl font-bold font-mono text-emerald-700">{explanation.confidence_percentage}%</div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/40 flex items-center justify-center font-bold text-emerald-800 font-mono bg-emerald-50 text-sm">
                {explanation.confidence_percentage}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Explainable Confidence Breakdown Signals */}
            <Card title="Explainable Confidence Score Signals" subtitle="Additive signals contributing to relationship confidence assessment." className="bg-[#fcfcf9] border-[#e5dfd3]">
              <div className="space-y-4">
                {explanation.score_breakdown.map((sig, idx) => (
                  <div key={idx} className="p-3.5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-stone-900">{sig.signal_name}</span>
                      <span className={`font-bold ${sig.points >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {sig.points >= 0 ? `+${sig.points}%` : `${sig.points}%`}
                      </span>
                    </div>
                    <div className="w-full bg-[#e5dfd3] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${sig.points >= 0 ? 'bg-saffron-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, Math.abs(sig.points) * 4)}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-600 leading-snug">{sig.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Supporting & Contradicting Evidence Panel */}
            <div className="space-y-6">
              {/* Supporting Evidence */}
              <Card title="Supporting Evidence" subtitle="Corroborating indicators backing this candidate relationship." className="bg-[#fcfcf9] border-[#e5dfd3]">
                <div className="space-y-2.5">
                  {explanation.supporting_evidence.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Contradicting Evidence */}
              <Card title="Contradicting Evidence & Mismatches" subtitle="Observations requiring investigator review or field verification." className="bg-[#fcfcf9] border-[#e5dfd3]">
                <div className="space-y-2.5">
                  {explanation.contradicting_evidence.length > 0 ? (
                    explanation.contradicting_evidence.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-mono text-rose-900">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">{item}</div>
                          <div className="text-[11px] text-stone-500 mt-1">Requires investigator verification per SIH guidelines.</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3.5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl text-xs text-stone-600 font-mono">
                      No contradicting spatial or temporal evidence flagged.
                    </div>
                  )}
                </div>
              </Card>

              {/* Source Reliability Matrix */}
              <Card title="Source Reliability Matrix" subtitle="Categorized system source reliability ratings." className="bg-[#fcfcf9] border-[#e5dfd3]">
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  {explanation.source_reliability.map((sr, idx) => (
                    <div key={idx} className="p-3 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl flex items-center justify-between">
                      <span className="text-stone-800 font-bold">{sr.source_type}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sr.reliability_level === 'HIGH' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        sr.reliability_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-[#f3efe6] text-stone-700'
                      }`}>
                        {sr.reliability_level}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Timeline Sequence Visualizer */}
          <Card title="Evidence Timeline Sequence" subtitle="Chronological sequence of logged intelligence events and transactions." className="bg-[#fcfcf9] border-[#e5dfd3]">
            <div className="relative pl-6 border-l-2 border-[#e5dfd3] space-y-6">
              {explanation.timeline.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-saffron-500 ring-4 ring-[#fcfcf9]" />
                  <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-saffron-700 font-bold">{evt.label} — {new Date(evt.timestamp).toLocaleDateString()}</span>
                      <span className="text-stone-600 px-2 py-0.5 bg-[#f3efe6] rounded border border-[#e5dfd3]">{evt.source_type}</span>
                    </div>
                    <p className="text-xs text-stone-800 font-sans leading-relaxed">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Raw Evidence List & Detail Inspector */}
      {activeTab === 'raw' && (
        <div className="space-y-6">
          <div className="p-5 bg-[#fcfcf9] border border-[#e5dfd3] rounded-2xl shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search evidence ID or record keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-stone-900 focus:outline-none focus:border-saffron-500 placeholder-stone-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3.5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedEvidence(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedEvidence?.id === item.id
                      ? 'bg-[#fcfcf9] border-saffron-500 shadow-md ring-1 ring-saffron-300'
                      : 'bg-[#f8f6f0] border-[#e5dfd3] hover:border-saffron-300 hover:bg-[#fcfcf9]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-saffron-700 font-bold bg-saffron-50 px-2 py-0.5 rounded border border-saffron-200">{item.source_type}</span>
                    <span className="text-emerald-700 font-bold">Conf: {(item.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 leading-snug">{item.title}</h4>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{item.content_snippet}</p>
                  <div className="pt-2 border-t border-[#e5dfd3] flex items-center justify-between text-xs font-mono text-stone-500">
                    <span>Ref: {item.source_id}</span>
                    <span>{item.linked_entity_ids.length} Nodes</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedEvidence && (
              <div className="lg:col-span-2">
                <Card title="Raw Evidence & Provenance Chain Inspector" subtitle="Verifiable source documentation and linked intelligence graph targets." className="bg-[#fcfcf9] border-[#e5dfd3]">
                  <div className="space-y-6 font-sans">
                    <div className="flex items-start justify-between border-b border-[#e5dfd3] pb-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-saffron-700 bg-saffron-50 px-2.5 py-1 rounded-md border border-saffron-200">{selectedEvidence.source_id}</span>
                        <h3 className="text-xl font-bold text-stone-900 mt-2">{selectedEvidence.title}</h3>
                      </div>
                      <div className="text-right font-mono text-xs text-stone-600 space-y-1">
                        <div>Confidence: <span className="text-emerald-700 font-bold text-sm">{(selectedEvidence.confidence * 100).toFixed(0)}%</span></div>
                        <div className="text-xs text-stone-600">Method: <strong className="text-stone-900">{selectedEvidence.extraction_method}</strong></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-stone-600">Raw Intelligence Record Extract</h5>
                      <div className="p-5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl font-mono text-sm text-stone-800 leading-relaxed shadow-inner">
                        &quot;{selectedEvidence.content_snippet}&quot;
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1">
                        <span className="intel-data-label">Source System Type</span>
                        <span className="intel-data-value text-stone-900">{selectedEvidence.source_type}</span>
                      </div>
                      <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1">
                        <span className="intel-data-label">Audit Timestamp</span>
                        <span className="intel-data-value text-stone-900 font-mono text-xs">{new Date(selectedEvidence.timestamp).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-stone-600">Linked Graph Nodes ({selectedEvidence.linked_entity_ids.length})</h5>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedEvidence.linked_entity_ids.map(eid => (
                          <span key={eid} className="px-3 py-1.5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl text-stone-800 font-mono text-xs font-semibold shadow-sm">
                            Node ID: <span className="text-saffron-700">{eid}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#e5dfd3] flex items-center justify-between text-xs font-mono text-stone-600">
                      <span>Audit Trail Verified: <strong className="text-stone-900">Hash Match OK</strong></span>
                      <span className="text-emerald-800 flex items-center gap-1.5 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Chain of Custody Verified
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
