import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { FinancialAnalyticsData } from '../types';
import { 
  Landmark, 
  ArrowRight, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Clock, 
  Search, 
  DollarSign,
  Info
} from 'lucide-react';

export const FinancialIntelligencePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinancialAnalyticsData | null>(null);

  useEffect(() => {
    async function loadFinancialAnalytics() {
      try {
        const res = await apiService.getFinancialAnalytics();
        setData(res);
      } catch (err) {
        console.error('Financial analytics error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinancialAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Extracting Financial Intelligence & Flow Patterns..." />;

  if (!data) return null;

  return (
    <div className="space-y-8 font-sans max-w-[1650px] mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 intel-glass-panel p-5 rounded-2xl shadow-sm border-l-4 border-l-saffron-600 border-[#e5dfd3]">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1c1917] flex items-center gap-3">
            <Landmark className="w-7 h-7 text-saffron-600" /> Financial Intelligence & Money Flow Analysis
          </h2>
          <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed">
            Multi-stage transaction graph analysis for candidate layering indicators, smurfing patterns, and money flow trails.
          </p>
        </div>

        <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-mono text-xs flex items-center gap-2 font-bold shadow-2xs">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Decision Support Mode — Analytical leads require investigator verification.</span>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#e5dfd3] rounded-2xl space-y-2 shadow-xs">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">Total Financial Entities</span>
          <div className="text-2xl font-extrabold text-[#1c1917] font-mono">{data.summary.total_financial_entities || 4} Tracked</div>
          <p className="text-xs text-slate-600">Accounts, Wallets & Shell Companies</p>
        </div>

        <div className="p-5 bg-white border border-[#e5dfd3] rounded-2xl space-y-2 shadow-xs">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">Flagged Layering Leads</span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono">{data.summary.flagged_layering_count || 1} Pattern</div>
          <p className="text-xs text-slate-600">Rapid high-velocity transfers</p>
        </div>

        <div className="p-5 bg-white border border-[#e5dfd3] rounded-2xl space-y-2 shadow-xs">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">Flagged Smurfing Leads</span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">{data.summary.flagged_smurfing_count || 1} Structuring</div>
          <p className="text-xs text-slate-600">Sub-threshold aggregator deposits</p>
        </div>

        <div className="p-5 bg-white border border-[#e5dfd3] rounded-2xl space-y-2 shadow-xs">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">Monitored Volume</span>
          <div className="text-2xl font-extrabold text-saffron-700 font-mono">{data.summary.total_monitored_volume || "$2.45M USD"}</div>
          <p className="text-xs text-slate-600">High-risk flow: {data.summary.high_risk_volume || "$1.11M"}</p>
        </div>
      </div>

      {/* Money Flow Visualizer (Stage Flow Sequence) */}
      <Card title="Money Flow Trail & Intermediary Pipeline" subtitle="Stage-by-stage money transfer trail from originator to withdrawal off-ramp.">
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {data.flow_stages.map((st, idx) => (
              <div key={idx} className="relative p-5 bg-[#fcfcf9] border border-[#e5dfd3] rounded-2xl space-y-3 shadow-2xs hover:border-saffron-600/50 transition-all">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 bg-saffron-600/10 text-saffron-700 border border-saffron-600/30 rounded font-bold">STAGE {st.stage}</span>
                  <span className="text-slate-500 font-bold">{new Date(st.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">{st.stage_name}</span>
                  <h4 className="text-sm font-bold text-[#1c1917] line-clamp-1">{st.entity_name}</h4>
                </div>
                <div className="pt-2 border-t border-[#e5dfd3] flex items-center justify-between font-mono">
                  <span className="text-xs text-slate-500">Transfer:</span>
                  <span className="text-sm font-bold text-emerald-700">{st.amount}</span>
                </div>

                {idx < data.flow_stages.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-saffron-600/50 text-saffron-700 items-center justify-center shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#fcfcf9] border border-[#e5dfd3] rounded-xl text-xs font-mono text-slate-700 flex items-center justify-between">
            <span>Pipeline Summary: <strong className="text-slate-900">4 Intermediary Hops Logged</strong></span>
            <span>Estimated Velocity: <strong className="text-saffron-700 font-bold">120 seconds between Stage 2 & 4</strong></span>
          </div>
        </div>
      </Card>

      {/* Candidate Suspicious Pattern Indicators Grid */}
      <Card title="Candidate Suspicious Financial Transaction Patterns" subtitle="Automated pattern detection for potential layering, smurfing, and circular flows.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {data.pattern_indicators.map((pat) => (
            <div key={pat.id} className="p-5 bg-[#fcfcf9] border border-[#e5dfd3] rounded-2xl space-y-4 shadow-2xs hover:border-slate-400 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    pat.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {pat.pattern_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-600">Risk: {(pat.risk_score * 100).toFixed(0)}%</span>
                </div>

                <h3 className="text-sm font-bold text-[#1c1917] leading-snug">{pat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{pat.description}</p>

                <div className="space-y-2 pt-2 border-t border-[#e5dfd3] text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-bold">Source:</span>
                    <span className="text-saffron-700 font-bold">{pat.source_account}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-bold">Target:</span>
                    <span className="text-saffron-700 font-bold">{pat.target_account}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-bold">Amount:</span>
                    <span className="text-emerald-700 font-extrabold">{pat.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-bold">Velocity:</span>
                    <span className="text-amber-700 font-bold">{pat.velocity_seconds}s ({pat.intermediary_count} intermediaries)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e5dfd3] space-y-2">
                <div className="p-3 bg-white border border-[#e5dfd3] rounded-xl text-xs font-mono text-slate-800 space-y-1">
                  <span className="text-[10px] text-saffron-700 uppercase font-bold tracking-wider">Investigative Lead:</span>
                  <p className="text-[11px] leading-relaxed text-slate-700 font-medium">{pat.investigative_lead}</p>
                </div>
                <div className="text-[10px] font-mono text-slate-500 italic">
                  {pat.disclaimer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
