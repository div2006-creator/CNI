import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { FileText, Download, Printer, Share2, Check } from 'lucide-react';

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
                { title: 'Pattern Anomaly Briefing', type: 'Alert Summary', desc: 'Focuses on flagged high-velocity wire transfers and burner phone links.' },
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
          <Card title="Document Preview: Operation NorthStar Briefing">
            <div className="p-8 bg-dark-950/90 border border-slate-800/90 rounded-2xl space-y-6 font-sans text-sm shadow-2xl">
              {/* Document Header */}
              <div className="border-b border-slate-800/80 pb-5 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-100 uppercase tracking-tight">
                    RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT
                  </h3>
                  <p className="text-xs font-mono font-semibold text-intel-cyan mt-1">CASE REF: INV-2026-0891 (OPERATION NORTHSTAR)</p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-md border border-slate-700 font-bold shrink-0">
                  CONFIDENTIAL DEMO
                </span>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="text-xs md:text-sm font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  1. Executive Network Summary
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Analysis of synthetic intelligence data indicates an active multi-tiered network revolving around Subject Alpha (&quot;The Broker&quot;) and Vortex Trading Corp. Graph node extraction identified 15 interconnected entities, including 5 high-risk bank accounts, 2 burner communication lines, and 2 front logistics businesses.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-3">
                <h4 className="text-xs md:text-sm font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  2. Primary Target Entities
                </h4>
                <div className="space-y-3">
                  <div className="p-4 bg-dark-900/90 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-100 text-sm">Subject Alpha (Alias: The Broker)</div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">Target Role: Financial Orchestrator | Centrality: 92%</div>
                    </div>
                    <span className="text-rose-400 font-mono font-bold text-xs bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800/80">CRITICAL</span>
                  </div>
                  <div className="p-4 bg-dark-900/90 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-100 text-sm">Vortex Trading Corp (Shell Co)</div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">Target Role: Offshore Layering Vehicle | Centrality: 90%</div>
                    </div>
                    <span className="text-rose-400 font-mono font-bold text-xs bg-rose-950/80 px-2.5 py-1 rounded border border-rose-800/80">CRITICAL</span>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="text-xs md:text-sm font-mono font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
                  3. Key Pattern Anomalies Flagged
                </h4>
                <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm leading-relaxed">
                  <li><strong>Layered Wire Transfer:</strong> $500,000 transferred within 2 mins to Crypto Mixer Wallet.</li>
                  <li><strong>Burner Call Burst:</strong> 47 encrypted VOIP contacts logged within 72 hours.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-400 flex justify-between items-center">
                <span>Report Generated: <strong className="text-slate-200">{new Date().toLocaleDateString()}</strong></span>
                <span>System ID: <strong className="text-intel-cyan">CNI-INTEL-REPORT-001</strong></span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
