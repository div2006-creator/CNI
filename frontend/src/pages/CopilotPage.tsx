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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-intel-cyan" /> Graph-Aware Investigator Copilot
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Query the temporal graph, discover indirect links, and analyze evidence provenance using plain language.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat / Query Panel (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sample Prompts */}
          <div className="p-3 bg-dark-900 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-intel-cyan" /> Suggested Graph Queries
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="px-3 py-1.5 bg-dark-950 hover:bg-dark-850 border border-slate-800 hover:border-intel-cyan/40 text-xs font-sans text-slate-300 rounded-lg transition-all text-left"
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
                className="flex-1 bg-dark-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs font-sans text-slate-200 focus:border-intel-cyan/50"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-4 py-2.5 bg-intel-cyan text-dark-950 font-mono text-xs font-bold rounded-lg hover:bg-cyan-300 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {loading ? 'Analyzing...' : 'Ask Assistant'}
              </button>
            </form>
          </Card>

          {/* Assistant Responses Feed */}
          <div className="space-y-4">
            {copilotHistory.map((res, i) => (
              <Card key={i} className="border-intel-cyan/40">
                <div className="space-y-3 font-sans text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs font-bold text-intel-cyan">&quot;{res.query}&quot;</span>
                    <span className="font-mono text-[10px] text-slate-500">Confidence: {(res.confidence * 100).toFixed(0)}%</span>
                  </div>

                  <p className="text-slate-200 text-sm leading-relaxed bg-dark-950 p-3 rounded-lg border border-slate-800">
                    {res.answer}
                  </p>

                  {/* Reasoning Chain */}
                  <div>
                    <h5 className="font-mono text-[10px] uppercase text-slate-400 mb-1 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-intel-cyan" /> Graph Topology Reasoning Chain
                    </h5>
                    <ul className="space-y-1 bg-dark-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300">
                      {res.reasoning.map((r, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-intel-cyan font-bold">&bull;</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evidence Citations */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] font-mono">
                    <span className="text-slate-400">Supporting Evidence: <strong className="text-emerald-400">{res.supporting_evidence_ids.join(', ')}</strong></span>
                    <span className="text-intel-cyan font-semibold cursor-pointer">Inspect Citations &rarr;</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Side Panel: Copilot Guardrails */}
        <div className="space-y-4">
          <Card title="Copilot System Guardrails">
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-dark-950 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Grounded in Knowledge Graph
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  The assistant queries Neo4j/Mock temporal graph data and verified evidence records. It does not invent facts.
                </p>
              </div>

              <div className="p-3 bg-dark-950 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-intel-cyan">
                  <CheckCircle2 className="w-4 h-4" /> Decision Support Only
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  All Copilot outputs are leads requiring investigator verification before official filing.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
