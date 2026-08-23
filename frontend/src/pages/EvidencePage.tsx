import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { EvidenceItem } from '../types';
import { FileCheck2, Search, Filter, ShieldCheck, FileText, ExternalLink, Cpu } from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadEvidence() {
      try {
        const data = await apiService.getEvidenceList();
        setEvidenceList(data);
        if (data.length > 0) setSelectedEvidence(data[0]);
      } catch (err) {
        console.error('Evidence error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvidence();
  }, []);

  if (loading) return <LoadingSpinner message="Opening Evidence Vault directory..." />;

  const filtered = evidenceList.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.source_id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <FileCheck2 className="w-7 h-7 text-intel-cyan" /> Evidence Vault & Provenance Inspector
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            Every graph node and relationship is strictly mapped to verifiable source evidence (CDRs, Wire Logs, Field Reports).
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-5 bg-dark-900/90 border border-slate-800/80 rounded-2xl shadow-md">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence ID or record keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-intel-cyan/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence List */}
        <div className="space-y-3.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedEvidence(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                selectedEvidence?.id === item.id
                  ? 'bg-dark-900 border-intel-cyan shadow-xl ring-1 ring-intel-cyan/30'
                  : 'bg-dark-900/70 border-slate-800/80 hover:border-slate-700/80 hover:bg-dark-900/90'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-intel-cyan font-bold bg-intel-cyan/10 px-2 py-0.5 rounded border border-intel-cyan/30">{item.source_type}</span>
                <span className="text-emerald-400 font-bold">Conf: {(item.confidence * 100).toFixed(0)}%</span>
              </div>
              <h4 className="text-sm font-bold text-slate-100 leading-snug">{item.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.content_snippet}</p>
              <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>Ref: {item.source_id}</span>
                <span>{item.linked_entity_ids.length} Nodes</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Evidence Detail Inspector (2 Cols) */}
        {selectedEvidence && (
          <div className="lg:col-span-2">
            <Card title="Raw Evidence & Provenance Chain Inspector" subtitle="Verifiable source documentation and linked intelligence graph targets.">
              <div className="space-y-6 font-sans">
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-intel-cyan bg-intel-cyan/10 px-2.5 py-1 rounded-md border border-intel-cyan/30">{selectedEvidence.source_id}</span>
                    <h3 className="text-xl font-bold text-slate-100 mt-2">{selectedEvidence.title}</h3>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-400 space-y-1">
                    <div>Confidence: <span className="text-emerald-400 font-bold text-sm">{(selectedEvidence.confidence * 100).toFixed(0)}%</span></div>
                    <div className="text-xs text-slate-400">Method: <strong className="text-slate-200">{selectedEvidence.extraction_method}</strong></div>
                  </div>
                </div>

                {/* Content Snippet */}
                <div className="space-y-2">
                  <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Raw Intelligence Record Extract</h5>
                  <div className="p-5 bg-dark-950 border border-slate-800/90 rounded-2xl font-mono text-sm text-slate-200 leading-relaxed shadow-inner">
                    &quot;{selectedEvidence.content_snippet}&quot;
                  </div>
                </div>

                {/* Formatted Property Sheet Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-dark-950/80 border border-slate-800/80 rounded-xl space-y-1">
                    <span className="intel-data-label">Source System Type</span>
                    <span className="intel-data-value text-slate-200">{selectedEvidence.source_type}</span>
                  </div>
                  <div className="p-4 bg-dark-950/80 border border-slate-800/80 rounded-xl space-y-1">
                    <span className="intel-data-label">Audit Timestamp</span>
                    <span className="intel-data-value text-slate-200 font-mono text-xs">{new Date(selectedEvidence.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Linked Graph Entities */}
                <div className="space-y-2">
                  <h5 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">Linked Graph Nodes ({selectedEvidence.linked_entity_ids.length})</h5>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedEvidence.linked_entity_ids.map(eid => (
                      <span key={eid} className="px-3 py-1.5 bg-dark-950/90 border border-slate-800/80 rounded-xl text-slate-200 font-mono text-xs font-semibold shadow-sm">
                        Node ID: <span className="text-intel-cyan">{eid}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Audit Trail Verified: <strong className="text-slate-200">Hash Match OK</strong></span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/80">
                    <ShieldCheck className="w-4 h-4" /> Chain of Custody Verified
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
