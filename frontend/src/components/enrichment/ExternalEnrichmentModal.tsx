import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Newspaper, Cpu, AlertTriangle, ShieldCheck, X, Search, CheckCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';
import { GeocodingResult, PublicNewsResult, AIDocumentAnalysisResult, EnrichmentStatus } from '../../types';

interface ExternalEnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCaseId: string;
}

export const ExternalEnrichmentModal: React.FC<ExternalEnrichmentModalProps> = ({
  isOpen,
  onClose,
  currentCaseId
}) => {
  const [activeTab, setActiveTab] = useState<'geocoding' | 'news' | 'ai'>('geocoding');
  const [statuses, setStatuses] = useState<EnrichmentStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Geocoding state
  const [geoQuery, setGeoQuery] = useState<string>('Mumbai Police HQ');
  const [geoResult, setGeoResult] = useState<GeocodingResult | null>(null);

  // News state
  const [newsQuery, setNewsQuery] = useState<string>('Hawala Syndicate');
  const [newsResult, setNewsResult] = useState<PublicNewsResult | null>(null);

  // AI state
  const [aiText, setAiText] = useState<string>(
    'FIRST INFORMATION REPORT (FIR #402/2026).\n' +
    'Informant statement records that Rahul Sharma (Phone: +919876543210) transferred funds via UPI rahul@upi to Vikram Singh. ' +
    'Suspects were observed near Marine Drive, Mumbai.'
  );
  const [aiResult, setAiResult] = useState<AIDocumentAnalysisResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      apiService.getEnrichmentStatus()
        .then(res => setStatuses(res))
        .catch(err => console.warn('Could not fetch enrichment status', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunGeocoding = async () => {
    if (!geoQuery.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.geocodeLocation(geoQuery, currentCaseId);
      setGeoResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunNews = async () => {
    if (!newsQuery.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.searchPublicNews(newsQuery, currentCaseId);
      setNewsResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAI = async () => {
    if (!aiText.trim()) return;
    setLoading(true);
    try {
      const res = await apiService.analyzeDocumentAI(aiText, currentCaseId);
      setAiResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                External Intelligence & AI Enrichment
              </h2>
              <p className="text-xs text-slate-400">
                Case Attribution: <span className="font-mono text-indigo-300 font-semibold">{currentCaseId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Status Banner */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">Provider Statuses:</span>
          <div className="flex gap-4">
            {statuses.map(s => (
              <span key={s.provider} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-slate-300">{s.provider}:</span>
                <span className="font-mono text-slate-400">{s.status}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('geocoding')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'geocoding'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Geocoding (OSM)
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'news'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Public News Search
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Document Analysis
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: GEOCODING */}
          {activeTab === 'geocoding' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/60">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Location Query / Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={geoQuery}
                    onChange={(e) => setGeoQuery(e.target.value)}
                    placeholder="e.g. Marine Drive, Mumbai"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleRunGeocoding}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Geocode
                  </button>
                </div>
              </div>

              {geoResult && (
                <div className="bg-slate-950 p-4 rounded-lg border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                      {geoResult.source_type}
                    </span>
                    <span className="text-xs font-semibold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                      {geoResult.fact_type}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{geoResult.display_name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Coordinates: Lat {geoResult.lat}, Lon {geoResult.lon} | Confidence: {(geoResult.confidence * 100).toFixed(0)}%
                    </p>
                  </div>

                  {geoResult.provenance && (
                    <div className="text-xs text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="font-semibold text-slate-300">Provenance:</span> Source Doc ID: {geoResult.provenance.source_document_id}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 2: PUBLIC NEWS */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/60">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Keywords Search
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newsQuery}
                    onChange={(e) => setNewsQuery(e.target.value)}
                    placeholder="e.g. Hawala syndicate transaction"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleRunNews}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Search News
                  </button>
                </div>
              </div>

              {newsResult && (
                <div className="space-y-3">
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300">{newsResult.disclaimer}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                      {newsResult.source_type} ({newsResult.total_results} results)
                    </span>
                    <span className="text-xs font-semibold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                      {newsResult.fact_type}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {newsResult.articles.map((art, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                        <a href={art.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-300 hover:underline">
                          {art.title}
                        </a>
                        <p className="text-xs text-slate-400">{art.snippet}</p>
                        <div className="text-[11px] text-slate-500 font-mono pt-1">
                          Publisher: {art.publisher} {art.published_at && `| Date: ${art.published_at.substring(0, 10)}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI DOCUMENT ANALYSIS */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-lg border border-slate-700/60 space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Raw Case Text / FIR / Intelligence Note
                </label>
                <textarea
                  rows={4}
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={handleRunAI}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  Run AI Analytical Parser
                </button>
              </div>

              {aiResult && (
                <div className="bg-slate-950 p-4 rounded-lg border border-indigo-500/30 space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300">{aiResult.safety_disclaimer}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="text-xs font-bold uppercase text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                        {aiResult.source_type}
                      </span>
                      <span className="text-xs font-semibold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">
                        {aiResult.fact_type}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-rose-400 px-2 py-0.5 bg-rose-500/10 rounded border border-rose-500/20">
                      Risk Level: {aiResult.risk_level}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded border border-slate-800">
                    <p className="font-semibold text-slate-200">Analytical Summary:</p>
                    <p className="mt-1 text-slate-400">{aiResult.summary}</p>
                  </div>

                  {aiResult.extracted_entities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Inferred Entities ({aiResult.extracted_entities.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {aiResult.extracted_entities.map((e, idx) => (
                          <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-semibold text-slate-200">{e.entity_name}</span>
                              <span className="ml-2 text-[10px] text-indigo-400 font-mono">[{e.entity_type}]</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              offset:{e.start_char}-{e.end_char}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResult.extracted_relationships.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                        Inferred Relationships ({aiResult.extracted_relationships.length})
                      </h4>
                      <div className="space-y-1.5">
                        {aiResult.extracted_relationships.map((r, idx) => (
                          <div key={idx} className="bg-slate-900 p-2 rounded border border-slate-800 text-xs flex items-center justify-between">
                            <span className="text-slate-300 font-mono">
                              {r.source_entity} <span className="text-indigo-400">-[{r.relationship_type}]-&gt;</span> {r.target_entity}
                            </span>
                            <span className="text-amber-400 text-[10px] font-semibold">
                              {r.fact_type} ({(r.confidence * 100).toFixed(0)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 rounded-b-xl flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Investigator Provenance & Case Isolation Active
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition text-xs font-medium"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
