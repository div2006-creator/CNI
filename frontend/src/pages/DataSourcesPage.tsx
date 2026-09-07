import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { DataSource } from '../types';
import { Database, Plus, CheckCircle, FileSpreadsheet, Radio, FileText, Upload } from 'lucide-react';
import { DataIngestionModal } from '../components/ingestion/DataIngestionModal';

export const DataSourcesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        return <FileSpreadsheet className="w-5 h-5 text-indigo-700" />;
      case 'CALL_METADATA':
        return <Radio className="w-5 h-5 text-saffron-600" />;
      case 'UNSTRUCTURED_TEXT':
        return <FileText className="w-5 h-5 text-emerald-700" />;
      default:
        return <Database className="w-5 h-5 text-purple-700" />;
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <Database className="w-7 h-7 text-saffron-600" /> Data Sources & Ingestion Feeds
          </h2>
          <p className="text-xs md:text-sm text-stone-600 mt-1 leading-relaxed">
            Overview of structured financial logs, call telemetry metadata, and unstructured intelligence feeds.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-saffron-600 hover:bg-saffron-700 text-white font-bold text-xs font-mono rounded-xl transition-all shadow-sm"
        >
          <Upload className="w-4 h-4" /> Upload & Ingest File
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((src) => (
          <Card key={src.id} className="border-[#e5dfd3] bg-[#fcfcf9] hover:border-saffron-300">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-[#f8f6f0] border border-[#e5dfd3] rounded-2xl shadow-inner">
                    {getSourceIcon(src.source_type)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-stone-900">{src.name}</h3>
                    <span className="text-xs font-mono text-stone-700 bg-[#f3efe6] px-2 py-0.5 rounded border border-[#e5dfd3]">{src.source_type}</span>
                  </div>
                </div>
                <Badge label={src.status} variant="status" typeValue={src.status} size="sm" />
              </div>

              <p className="text-xs md:text-sm text-stone-600 leading-relaxed">{src.description}</p>

              {/* Confidence & Records Stats */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e5dfd3] font-mono text-xs">
                <div className="bg-[#f8f6f0] p-3.5 rounded-xl border border-[#e5dfd3] space-y-1">
                  <span className="intel-data-label">Confidence Rating</span>
                  <span className="text-stone-900 font-bold text-base">{(src.confidence_score * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-[#f8f6f0] p-3.5 rounded-xl border border-[#e5dfd3] space-y-1">
                  <span className="intel-data-label">Ingested Records</span>
                  <span className="text-saffron-700 font-bold text-base">{src.records_ingested.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-xs font-mono text-stone-600 flex justify-between items-center pt-1">
                <span>Last Sync: <strong className="text-stone-900">{new Date(src.last_ingested_at).toLocaleTimeString()}</strong></span>
                <span className="text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Pipeline Validated
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Live Ingestion Modal */}
      <DataIngestionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
