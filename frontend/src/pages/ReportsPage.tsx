import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { FileText, Download, Check, ShieldCheck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <FileText className="w-7 h-7 text-intel-cyan" /> Intelligence Reports & Summaries
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            Generate formal investigation summaries, relationship matrices, and evidentiary graph exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-intel-cyan text-dark-950 text-xs font-mono font-bold rounded-xl hover:bg-cyan-300 transition-all shadow-md"
          >
            {exported ? (
              <>
                <Check className="w-4 h-4" /> Export Generated
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Export Report (PDF / JSON)
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Report Templates & Options */}
        <div className="space-y-4">
          <Card title="Report Templates" subtitle="Select standard intelligence briefing templates.">
            <div className="space-y-3">
              {[
                { title: 'Full Case Investigation Brief', type: 'Comprehensive', desc: 'Complete breakdown of target nodes, money flows, and timeline.' },
                { title: 'Entity Relationship Matrix', type: 'Graph Topology', desc: 'Exportable node-edge tabular matrix for legal compliance.' },
                { title: 'Pattern Anomaly Briefing', type: 'Alert Summary', desc: 'Focuses on flagged high-velocity wire transfers and communication links.' },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    idx === 0
                      ? 'bg-dark-950 border-intel-cyan shadow-md ring-1 ring-intel-cyan/30'
                      : 'bg-dark-950/60 border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-100">{t.title}</span>
                    <span className="text-xs font-mono text-intel-cyan bg-intel-cyan/10 px-2 py-0.5 rounded border border-intel-cyan/30">{t.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Interactive Report Document Preview */}
        <div className="lg:col-span-2">
          <Card title="Document Preview: Active Case Summary">
            <div className="p-8 bg-dark-950/90 border border-slate-800/90 rounded-2xl space-y-6 font-sans text-sm shadow-2xl">
              {/* Document Header */}
              <div className="border-b border-slate-800/80 pb-5 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-100 uppercase tracking-tight">
                    RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT
                  </h3>
                  <p className="text-xs font-mono font-semibold text-intel-cyan mt-1">CASE REF: ACTIVE-CASE-001</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-md border border-emerald-800/80 font-bold shrink-0 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED LOGS
                </span>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="text-xs md:text-sm font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  1. Executive Network Summary
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Analysis of active intelligence data ingested into the system. All node records, risk metrics, and relationships are dynamically computed from active CDR logs, financial transactions, and field surveillance reports.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-3">
                <h4 className="text-xs md:text-sm font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  2. Primary Target Entities
                </h4>
                <div className="p-4 bg-dark-900/90 border border-slate-800/80 rounded-xl text-xs text-slate-400 font-mono text-center">
                  No critical entities currently flagged. Ingest new CDR, UPI logs, or FIR files to generate entity target profiles.
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="text-xs md:text-sm font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  3. Key Pattern Anomalies Flagged
                </h4>
                <p className="text-xs text-slate-400 font-mono">
                  Pattern anomaly detection runs continuously against active ingested feeds.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex justify-between items-center">
                <span>Report Generated: <strong className="text-slate-200">{new Date().toLocaleDateString()}</strong></span>
                <span>System ID: <strong className="text-intel-cyan">CNI-INTEL-REPORT-ACTIVE</strong></span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
