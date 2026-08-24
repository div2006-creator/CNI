import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { apiService } from '../services/api';
import { CopilotResponse } from '../types';
import { Bot, Send, Cpu, FileCheck2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const CopilotPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState<CopilotResponse[]>([]);

  const sampleQuestions = [
    "Find indirect connections between Subject Alpha and Subject Charlie.",
    "Show relationships that appeared after the offshore incorporation.",
    "Why was the $500,000 wire transfer flagged?",
    "Which entities act as bridge nodes connecting the logistics group?"
  ];

  const handleAsk = async (userQ: string) => {
    if (!userQ.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.queryCopilot(userQ);
      setCopilotHistory([res, ...copilotHistory]);
      setQuery('');
    } catch (err) {
      console.error('Copilot error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Bot className="w-7 h-7 text-intel-cyan" /> Investigator Copilot
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            Query the temporal graph, discover indirect links, and analyze evidence provenance using plain language.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat / Query Panel (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Sample Prompts */}
          <div className="p-5 bg-dark-900/90 border border-slate-800/80 rounded-2xl space-y-3 shadow-md">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-intel-cyan" /> Suggested Graph Queries
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="px-4 py-2 bg-dark-950/90 hover:bg-dark-850 border border-slate-800/80 hover:border-intel-cyan/50 text-xs font-sans font-semibold text-slate-200 rounded-xl transition-all text-left shadow-sm"
                >
                  &quot;{q}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Query Box */}
          <Card>
            <form
              onSubmit={(e) => { e.preventDefault(); handleAsk(query); }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Ask Copilot about graph paths, evidence, or bridge entities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-dark-950/90 border border-slate-800 rounded-xl px-4 py-3 text-sm font-sans text-slate-200 focus:outline-none focus:border-intel-cyan/50"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-5 py-3 bg-intel-cyan text-dark-950 font-mono text-xs font-bold rounded-xl hover:bg-cyan-300 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shrink-0"
              >
                <Send className="w-4 h-4" /> {loading ? 'Analyzing...' : 'Ask Assistant'}
              </button>
            </form>
          </Card>

          {/* Assistant Responses Feed */}
          <div className="space-y-5">
            {copilotHistory.map((res, i) => (
              <Card key={i} className="border-intel-cyan/40">
                <div className="space-y-4 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <span className="font-mono text-sm font-bold text-intel-cyan bg-intel-cyan/10 px-3 py-1 rounded-lg border border-intel-cyan/30">&quot;{res.query}&quot;</span>
                    <span className="font-mono text-xs text-slate-400">Confidence Score: <strong className="text-emerald-400 font-bold">{(res.confidence * 100).toFixed(0)}%</strong></span>
                  </div>

                  <div className="p-5 bg-dark-950/90 border border-slate-800/90 rounded-xl text-sm md:text-base text-slate-100 leading-relaxed shadow-inner">
                    {res.answer}
                  </div>

                  {/* Reasoning Chain */}
                  <div className="space-y-2">
                    <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-intel-cyan" /> Graph Topology Reasoning Chain
                    </h5>
                    <ul className="space-y-2 bg-dark-950/90 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-200">
                      {res.reasoning.map((r, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <span className="text-intel-cyan font-bold">&bull;</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evidence Citations */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono">
                    <span className="text-slate-400">Supporting Evidence: <strong className="text-emerald-400 font-bold">{res.supporting_evidence_ids.join(', ')}</strong></span>
                    <span className="text-intel-cyan font-bold cursor-pointer hover:underline bg-intel-cyan/10 px-3 py-1 rounded-lg border border-intel-cyan/30">Inspect Citations &rarr;</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Side Panel: Copilot Guardrails */}
        <div className="space-y-4">
          <Card title="Copilot System Guardrails" subtitle="Architectural decision boundaries.">
            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 bg-dark-950/90 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Grounded in Knowledge Graph
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The assistant queries Neo4j/Mock temporal graph data and verified evidence records. It strictly refrains from hallucinating unbacked facts.
                </p>
              </div>

              <div className="p-4 bg-dark-950/90 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-intel-cyan text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Decision Support Only
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  All Copilot outputs are leads requiring human-in-the-loop investigator verification before official filing or action.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
