import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { CandidateLinkPair } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ShieldAlert, 
  Info,
  ArrowRight,
  History,
  FileCheck2
} from 'lucide-react';

export const PredictiveNexusPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<CandidateLinkPair[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadCandidates() {
      try {
        const res = await apiService.getPredictiveCandidates();
        setCandidates(res);
      } catch (err) {
        console.error('Predictive Nexus error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCandidates();
  }, []);

  const handleReviewAction = async (candidateId: string, action: 'CONFIRM' | 'REJECT' | 'NEED_MORE_EVIDENCE') => {
    try {
      const res = await apiService.submitInvestigatorReview(candidateId, action);
      setActionFeedback(res.message || `Action ${action} submitted successfully.`);

      // Update local state
      setCandidates(prev => prev.map(c => {
        if (c.candidate_id === candidateId) {
          return { ...c, status: res.status as any };
        }
        return c;
      }));
    } catch (err) {
      console.error('Review submission error:', err);
    }
  };

  if (loading) return <LoadingSpinner message="Scanning Knowledge Graph for Candidate Hidden Associations..." />;

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-saffron-600" /> Predictive Nexus & Candidate Link Discovery
          </h2>
          <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
            Identifies candidate hidden relationships across graph entities using multi-signal scoring. Requires human-in-the-loop investigator verification.
          </p>
        </div>

        <div className="px-3.5 py-2 bg-[#f3efe6] border border-[#e5dfd3] rounded-xl text-stone-700 font-mono text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-saffron-600 shrink-0" />
          <span>Decision Support Mode — Non-definitive predictive outputs.</span>
        </div>
      </div>

      {/* Investigator Action Feedback Alert */}
      {actionFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-mono text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-stone-500 hover:text-stone-900">Dismiss</button>
        </div>
      )}

      {/* Candidate Relationship Cards Grid */}
      <div className="space-y-6">
        {candidates.map((cand) => (
          <Card key={cand.candidate_id} className="border-[#e5dfd3] bg-[#fcfcf9] shadow-sm">
            <div className="space-y-6">
              {/* Entity Pair Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5dfd3] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-saffron-50 text-saffron-700 border border-saffron-200 rounded font-mono text-xs font-bold uppercase tracking-wider">
                      {cand.classification_label}
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded font-mono text-[10px] font-bold">
                      REQUIRES VERIFICATION
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-lg md:text-xl font-bold text-stone-900 mt-2">
                    <span>{cand.source_entity_name}</span>
                    <span className="text-saffron-600 font-mono text-sm">────── {cand.suggested_relationship_type} ──────</span>
                    <span>{cand.target_entity_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl">
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-stone-600 block">Candidate Score</span>
                    <span className="text-xl font-bold font-mono text-emerald-700">{cand.score_percentage}%</span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-500/40 flex items-center justify-center font-bold text-emerald-800 font-mono bg-emerald-50 text-xs">
                    {cand.score_percentage}%
                  </div>
                </div>
              </div>

              {/* Explainable Signals Progress Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-600">Explainable Link Scoring Signals</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {cand.signals.map((sig, idx) => (
                    <div key={idx} className="p-3.5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-900 font-bold">{sig.signal_name}</span>
                        <span className="text-saffron-700 font-bold">{sig.contribution_percentage}%</span>
                      </div>
                      <div className="w-full bg-[#e5dfd3] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-saffron-500 h-full rounded-full" style={{ width: `${sig.contribution_percentage * 3.5}%` }} />
                      </div>
                      <p className="text-[11px] text-stone-600 font-sans leading-snug line-clamp-2">{sig.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investigative Lead & Disclaimer */}
              <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1 font-mono text-xs">
                <span className="text-saffron-700 uppercase font-bold tracking-wider text-[10px]">Investigative Lead:</span>
                <p className="text-stone-800 font-sans text-xs">{cand.investigative_lead}</p>
                <div className="text-[10px] text-stone-500 pt-1 italic">{cand.disclaimer}</div>
              </div>

              {/* Investigator Action Bar */}
              <div className="pt-4 border-t border-[#e5dfd3] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-stone-600">Status:</span>
                  <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                    cand.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    cand.status === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    cand.status === 'NEED_MORE_EVIDENCE' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-[#f3efe6] text-stone-700'
                  }`}>
                    {cand.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReviewAction(cand.candidate_id, 'CONFIRM')}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> [ CONFIRM ]
                  </button>

                  <button
                    onClick={() => handleReviewAction(cand.candidate_id, 'REJECT')}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" /> [ REJECT ]
                  </button>

                  <button
                    onClick={() => handleReviewAction(cand.candidate_id, 'NEED_MORE_EVIDENCE')}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600" /> [ NEED MORE EVIDENCE ]
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
