import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { DataSource } from '../types';
import { Database, Plus, RefreshCw, CheckCircle, FileSpreadsheet, Radio, FileText } from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<DataSource[]>([]);

  useEffect(() => {
    async function loadSources() {
      try {
        const data = await apiService.getDataSources();
        setSources(data);
      } catch (err) {
        console.error('Data sources load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSources();
  }, []);

  if (loading) return <LoadingSpinner message="Querying intelligence data ingestion metrics..." />;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'STRUCTURED_LOGS':
        return <FileSpreadsheet className="w-5 h-5 text-cyan-400" />;
      case 'CALL_METADATA':
        return <Radio className="w-5 h-5 text-indigo-400" />;
      case 'UNSTRUCTURED_TEXT':
        return <FileText className="w-5 h-5 text-emerald-400" />;
      default:
        return <Database className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Database className="w-7 h-7 text-intel-cyan" /> Data Sources & Ingestion Feeds
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            Overview of structured financial logs, call telemetry metadata, and unstructured intelligence feeds.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-intel-cyan/10 hover:bg-intel-cyan/20 border border-intel-cyan/40 text-intel-cyan text-xs font-mono font-bold rounded-xl transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Connect Data Feed
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((src) => (
          <Card key={src.id} className="border-slate-800/80 hover:border-slate-700">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-dark-950/90 border border-slate-800/80 rounded-2xl shadow-inner">
                    {getSourceIcon(src.source_type)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-100">{src.name}</h3>
                    <span className="text-xs font-mono text-slate-400 bg-dark-950 px-2 py-0.5 rounded border border-slate-800/80">{src.source_type}</span>
                  </div>
                </div>
                <Badge label={src.status} variant="status" typeValue={src.status} size="sm" />
              </div>

              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{src.description}</p>

              {/* Confidence & Records Stats */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
                <div className="bg-dark-950/90 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="intel-data-label">Confidence Rating</span>
                  <span className="text-slate-100 font-bold text-base">{(src.confidence_score * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-dark-950/90 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="intel-data-label">Ingested Records</span>
                  <span className="text-intel-cyan font-bold text-base">{src.records_ingested.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-400 flex justify-between items-center pt-1">
                <span>Last Sync: <strong className="text-slate-200">{new Date(src.last_ingested_at).toLocaleTimeString()}</strong></span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/80">
                  <CheckCircle className="w-3.5 h-3.5" /> Pipeline Validated
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
