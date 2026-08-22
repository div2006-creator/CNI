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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-intel-cyan" /> Evidence Vault & Provenance Inspector
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every graph node and relationship is strictly mapped to verifiable source evidence (CDRs, Wire Logs, Field Reports).
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-dark-900 border border-slate-800 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence ID or record keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evidence List */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedEvidence(item)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedEvidence?.id === item.id
                  ? 'bg-dark-900 border-intel-cyan shadow-lg'
                  : 'bg-dark-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-intel-cyan font-bold">{item.source_type}</span>
                <span className="text-slate-500">Conf: {(item.confidence * 100).toFixed(0)}%</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-100 mt-1">{item.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.content_snippet}</p>
              <div className="mt-2 text-[10px] font-mono text-slate-500">Ref ID: {item.source_id}</div>
            </div>
          ))}
        </div>

        {/* Selected Evidence Detail Inspector (2 Cols) */}
        {selectedEvidence && (
          <div className="lg:col-span-2">
            <Card title="Raw Evidence & Provenance Chain Inspector">
              <div className="space-y-4 text-xs font-sans">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-intel-cyan">{selectedEvidence.source_id}</span>
                    <h3 className="text-base font-bold text-slate-100 mt-1">{selectedEvidence.title}</h3>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-400">
                    <div>Confidence: <span className="text-emerald-400 font-bold">{(selectedEvidence.confidence * 100).toFixed(0)}%</span></div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Method: {selectedEvidence.extraction_method}</div>
                  </div>
                </div>

                {/* Content Snippet */}
                <div>
                  <h5 className="font-mono text-[11px] uppercase text-slate-400 mb-1">Raw Intelligence Record Extract</h5>
                  <div className="p-4 bg-dark-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 leading-relaxed">
                    &quot;{selectedEvidence.content_snippet}&quot;
                  </div>
                </div>

                {/* Linked Graph Entities */}
                <div>
                  <h5 className="font-mono text-[11px] uppercase text-slate-400 mb-2">Linked Graph Nodes ({selectedEvidence.linked_entity_ids.length})</h5>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedEvidence.linked_entity_ids.map(eid => (
                      <span key={eid} className="px-2.5 py-1 bg-dark-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs">
                        Node ID: {eid}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Audit Timestamp: {new Date(selectedEvidence.timestamp).toLocaleString()}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Provenance Verified
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
