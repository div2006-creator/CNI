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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-intel-cyan" /> Intelligence Reports & Summaries
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal investigation summaries, relationship matrices, and evidentiary graph exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-intel-cyan text-dark-950 text-xs font-mono font-bold rounded-lg hover:bg-cyan-300 transition-colors"
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
          <Card title="Report Templates">
            <div className="space-y-2">
              {[
                { title: 'Full Case Investigation Brief', type: 'Comprehensive', desc: 'Complete breakdown of target nodes, money flows, and timeline.' },
                { title: 'Entity Relationship Matrix', type: 'Graph Topology', desc: 'Exportable node-edge tabular matrix for legal compliance.' },
                { title: 'Pattern Anomaly Briefing', type: 'Alert Summary', desc: 'Focuses on flagged high-velocity wire transfers and burner phone links.' },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    idx === 0 ? 'bg-dark-950 border-intel-cyan/60' : 'bg-dark-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{t.title}</span>
                    <span className="text-[10px] font-mono text-intel-cyan bg-intel-cyan/10 px-2 py-0.5 rounded">{t.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Interactive Report Document Preview */}
        <div className="lg:col-span-2">
          <Card title="Document Preview: Operation NorthStar Briefing">
            <div className="p-6 bg-dark-950 border border-slate-800 rounded-xl space-y-6 font-sans text-xs">
              {/* Document Header */}
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight">
                    RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT
                  </h3>
                  <p className="text-xs font-mono text-intel-cyan mt-1">CASE REF: INV-2026-0891 (OPERATION NORTHSTAR)</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  CONFIDENTIAL DEMO
                </span>
              </div>

              {/* Section 1 */}
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 border-b border-slate-900 pb-1">
                  1. Executive Network Summary
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Analysis of synthetic intelligence data indicates an active multi-tiered network revolving around Subject Alpha (&quot;The Broker&quot;) and Vortex Trading Corp. Graph node extraction identified 15 interconnected entities, including 5 high-risk bank accounts, 2 burner communication lines, and 2 front logistics businesses.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 border-b border-slate-900 pb-1">
                  2. Primary Target Entities
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-dark-900 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Subject Alpha (Alias: The Broker)</div>
                      <div className="text-[10px] font-mono text-slate-400">Target Role: Financial Orchestrator | Risk Score: 92%</div>
                    </div>
                    <span className="text-rose-400 font-mono font-bold">CRITICAL</span>
                  </div>
                  <div className="p-3 bg-dark-900 border border-slate-800 rounded flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Vortex Trading Corp (Shell Co)</div>
                      <div className="text-[10px] font-mono text-slate-400">Target Role: Offshore Layering Vehicle | Risk Score: 90%</div>
                    </div>
                    <span className="text-rose-400 font-mono font-bold">CRITICAL</span>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 border-b border-slate-900 pb-1">
                  3. Key Pattern Anomalies
                </h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li><strong>Layered Wire Transfer:</strong> $500,000 transferred within 2 mins to Crypto Mixer Wallet.</li>
                  <li><strong>Burner Call Burst:</strong> 47 encrypted VOIP contacts logged within 72 hours.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Report Generated: {new Date().toLocaleDateString()}</span>
                <span>System ID: NEXUS-INTEL-REPORT-001</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
