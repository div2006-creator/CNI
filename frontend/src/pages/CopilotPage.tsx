import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { apiService } from '../services/api';
import { CopilotResponse } from '../types';
import { 
  Bot, 
  Send, 
  Cpu, 
  FileCheck2, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Mic, 
  MicOff, 
  Volume2, 
  AlertTriangle,
  Compass
} from 'lucide-react';

export const CopilotPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState<CopilotResponse[]>([]);

  const sampleQuestions = [
    "Why are Alpha and Delta connected?",
    "Alpha aur Delta ka connection batao",
    "Find indirect connections between Subject Alpha and Subject Charlie.",
    "Show financial flow for Vortex Trading Corp."
  ];

  // Voice Recognition setup
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Browser Speech Recognition API is not supported in this browser. Please type your query.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Voice input error:', err);
      setIsListening(false);
    }
  };

  // Text-to-Speech playback
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

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
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <Bot className="w-7 h-7 text-saffron-600" /> Graph-Aware Investigator Copilot & Voice Assistant
          </h2>
          <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
            Query the temporal graph, discover indirect links, and analyze evidence provenance using English or Hinglish natural language and speech commands.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Query & Chat Panel (2 Cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Sample Prompts & Multilingual Chips */}
          <div className="p-5 bg-[#fcfcf9] border border-[#e5dfd3] rounded-2xl space-y-3 shadow-sm">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-600 font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron-600" /> Suggested Graph Queries (English & Hinglish)
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  className="px-4 py-2 bg-[#f8f6f0] hover:bg-[#f0ebd9] border border-[#e5dfd3] text-xs font-sans font-semibold text-stone-800 rounded-xl transition-all text-left shadow-sm hover:border-saffron-400"
                >
                  &quot;{q}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Query Box & Voice Microphone Control */}
          <Card className="bg-[#fcfcf9] border-[#e5dfd3]">
            <form
              onSubmit={(e) => { e.preventDefault(); handleAsk(query); }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ask Copilot about graph paths, why Alpha and Delta are connected, or speak via mic..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl pl-4 pr-12 py-3 text-sm font-sans text-stone-900 focus:outline-none focus:border-saffron-500 placeholder-stone-400"
                />

                {/* Microphone Speech Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  title="Voice Input (Speech to Text)"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'text-stone-500 hover:text-saffron-600 hover:bg-[#f3efe6]'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-5 py-3 bg-saffron-500 text-white font-mono text-xs font-bold rounded-xl hover:bg-saffron-600 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shrink-0"
              >
                <Send className="w-4 h-4" /> {loading ? 'Analyzing Graph...' : 'Ask Assistant'}
              </button>
            </form>
          </Card>

          {/* Assistant Responses Feed */}
          <div className="space-y-5">
            {copilotHistory.map((res, i) => (
              <Card key={i} className="border-saffron-300 bg-[#fcfcf9] shadow-md">
                <div className="space-y-5 font-sans">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between border-b border-[#e5dfd3] pb-3 gap-2">
                    <span className="font-mono text-xs md:text-sm font-bold text-saffron-700 bg-saffron-50 px-3 py-1 rounded-lg border border-saffron-200">
                      &quot;{res.query}&quot;
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSpeak(res.answer)}
                        title="Read answer aloud"
                        className="p-1.5 text-stone-600 hover:text-saffron-700 hover:bg-[#f3efe6] rounded-lg transition-all flex items-center gap-1 font-mono text-xs"
                      >
                        <Volume2 className="w-4 h-4" /> Listen
                      </button>
                      <span className="font-mono text-xs text-stone-600">
                        Confidence: <strong className="text-emerald-700 font-bold">{(res.confidence * 100).toFixed(0)}%</strong>
                      </span>
                    </div>
                  </div>

                  {/* Main Grounded Answer */}
                  <div className="p-5 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl text-sm md:text-base text-stone-900 leading-relaxed shadow-inner whitespace-pre-line font-sans">
                    {res.answer}
                  </div>

                  {/* Contradicting Evidence Warning (If Present) */}
                  {res.contradicting_evidence && res.contradicting_evidence.length > 0 && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs font-mono text-rose-800">
                      <div className="flex items-center gap-2 font-bold text-rose-700">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> Contradicting Evidence Flagged
                      </div>
                      <ul className="list-disc list-inside space-y-1 pl-1 text-rose-900">
                        {res.contradicting_evidence.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Action Banner */}
                  {res.recommended_action && (
                    <div className="p-4 bg-saffron-50 border border-saffron-200 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-saffron-700 font-bold uppercase tracking-wider">Recommended Investigator Action:</span>
                        <p className="text-stone-900 font-semibold">{res.recommended_action}</p>
                      </div>
                      <span className="px-3 py-1.5 bg-saffron-500 text-white font-bold rounded-lg shrink-0">Execute Lead</span>
                    </div>
                  )}

                  {/* Reasoning Chain */}
                  {res.reasoning && res.reasoning.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-saffron-600" /> Graph Topology Reasoning Chain
                      </h5>
                      <ul className="space-y-2 bg-[#f8f6f0] p-4 rounded-xl border border-[#e5dfd3] font-mono text-xs text-stone-800">
                        {res.reasoning.map((r, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="text-saffron-600 font-bold mt-0.5">&bull;</span>
                            <span className="leading-snug">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidence Citations */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#e5dfd3] text-xs font-mono">
                    <span className="text-stone-600">Supporting Evidence Citations: <strong className="text-emerald-700 font-bold">{res.supporting_evidence_ids.join(', ')}</strong></span>
                    <span className="text-saffron-700 font-bold cursor-pointer hover:underline bg-saffron-50 px-3 py-1 rounded-lg border border-saffron-200">Inspect Citations &rarr;</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Side Panel: Copilot Guardrails */}
        <div className="space-y-4 font-sans">
          <Card title="Copilot Architectural Guardrails" subtitle="Safety and grounding constraints." className="bg-[#fcfcf9] border-[#e5dfd3]">
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Grounded in Knowledge Graph
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Queries active graph topology and evidence records. Refrains from hallucinating unbacked facts or legal claims.
                </p>
              </div>

              <div className="p-4 bg-[#f8f6f0] border border-[#e5dfd3] rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-saffron-700 text-sm">
                  <Compass className="w-4 h-4 text-saffron-600" /> Voice & Multilingual Intent Parser
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Supports browser Speech-to-Text, audio synthesis readout, and English/Hinglish investigative intents.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
