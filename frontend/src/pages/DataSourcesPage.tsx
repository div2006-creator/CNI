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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-intel-cyan" /> Data Sources & Ingestion Feeds
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Overview of structured financial logs, call telemetry metadata, and unstructured intelligence feeds.
          </p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 bg-intel-cyan/10 hover:bg-intel-cyan/20 border border-intel-cyan/40 text-intel-cyan text-xs font-mono font-semibold rounded-lg transition-all">
          <Plus className="w-4 h-4" /> Connect Data Feed
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <Card key={src.id} className="border-slate-800/80">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-dark-950 border border-slate-800 rounded-xl">
                    {getSourceIcon(src.source_type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{src.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500">{src.source_type}</span>
                  </div>
                </div>
                <Badge label={src.status} variant="status" typeValue={src.status} size="sm" />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{src.description}</p>

              {/* Confidence & Records Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 font-mono text-xs">
                <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Confidence Rating</span>
                  <span className="text-slate-200 font-bold">{(src.confidence_score * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-dark-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Ingested Records</span>
                  <span className="text-intel-cyan font-bold">{src.records_ingested.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-500 flex justify-between items-center">
                <span>Last Ingested: {new Date(src.last_ingested_at).toLocaleTimeString()}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Validated
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
