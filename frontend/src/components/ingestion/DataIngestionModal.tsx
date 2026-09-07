import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  Database,
  FileCode
} from 'lucide-react';
import { apiService } from '../../services/api';
import { IngestionSummary } from '../../types';
import { useInvestigation } from '../../context/InvestigationContext';

interface DataIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({ isOpen, onClose }) => {
  const { refreshData } = useInvestigation();

  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<string>('AUTO');
  const [rawText, setRawText] = useState<string>('');
  const [reportTitle, setReportTitle] = useState<string>('FIR Surveillance Field Report');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<IngestionSummary | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setSummary(null);
    }
  };

  const loadPresetCDR = () => {
    const csvContent = 
`calling_number,called_number,duration,timestamp,cell_tower
+15550199999,+15550188888,180,2026-09-02T10:15:00Z,Sector-7-Tower
+15550188888,+15550177777,45,2026-09-02T10:25:00Z,Sector-7-Tower
+15550199999,+15550144444,320,2026-09-02T11:00:00Z,Safehouse-Hub`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'sample_cdr_feed.csv', { type: 'text/csv' });
    setSelectedFile(file);
    setSourceType('CDR');
    setActiveTab('upload');
    setError(null);
    setSummary(null);
  };

  const loadPresetUPI = () => {
    const csvContent = 
`sender_acc,receiver_acc,amount,txn_id,timestamp,channel
vortex_shell@upi,crypto_mixer_0x89a,750000,TXN-UPI-99412,2026-09-02T09:30:00Z,UPI Instant
apex_trading@bank,account_offshore_301,1250000,TXN-WIRE-88401,2026-09-02T09:45:00Z,SWIFT Wire`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'sample_upi_transfers.csv', { type: 'text/csv' });
    setSelectedFile(file);
    setSourceType('UPI_FINANCIAL');
    setActiveTab('upload');
    setError(null);
    setSummary(null);
  };

  const loadPresetFIR = () => {
    setRawText(
`CONFIDENTIAL POLICE SURVEILLANCE REPORT (FIR #SURV-2026-001)
On September 2, 2026, surveillance teams observed Target Person-1 meeting Target Person-2 at Safehouse Sector 4.
Target Person-1 authorized a high-value wire transfer to Bank Account #994012 registered under Shell Logistics Corp.
Calls recorded between Burner #1 (+91 98765 43210) and Burner #2 (+91 98765 43211) near Sector Industrial Hub.`
    );
    setReportTitle("FIR Field Intercept Report SURV-2026-001");
    setSourceType('FIR_REPORT');
    setActiveTab('text');
    setError(null);
    setSummary(null);
  };

  const handleIngest = async () => {
    setError(null);
    setLoading(true);

    try {
      let result: IngestionSummary;
      if (activeTab === 'upload') {
        if (!selectedFile) {
          throw new Error('Please select or drag a valid file to upload.');
        }
        result = await apiService.uploadIngestionFile(selectedFile, sourceType === 'AUTO' ? undefined : sourceType);
      } else {
        if (!rawText.trim()) {
          throw new Error('Please enter text content to ingest.');
        }
        result = await apiService.ingestRawText(rawText, reportTitle, sourceType === 'AUTO' ? undefined : sourceType);
      }

      setSummary(result);
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Ingestion failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-dark-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-intel-cyan/10 border border-intel-cyan/30 rounded-xl">
              <Database className="w-5 h-5 text-intel-cyan" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Live Data Ingestion Engine
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-intel-cyan/20 border border-intel-cyan/40 text-intel-cyan rounded">PART 1</span>
              </h3>
              <p className="text-xs text-slate-400">Upload CDR, UPI transfers, or FIR text to expand the graph in real-time.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="intel-data-label flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-intel-cyan" /> Quick Sample Presets (Click to Test Live Ingestion)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={loadPresetCDR}
                className="flex items-center justify-center gap-2 p-2.5 bg-dark-950 hover:bg-dark-800 border border-indigo-900/40 hover:border-indigo-500/60 rounded-xl text-xs font-medium transition-all text-indigo-300"
              >
                <Radio className="w-4 h-4 text-indigo-400" /> Sample CDR Log
              </button>
              <button 
                onClick={loadPresetUPI}
                className="flex items-center justify-center gap-2 p-2.5 bg-dark-950 hover:bg-dark-800 border border-cyan-900/40 hover:border-cyan-500/60 rounded-xl text-xs font-medium transition-all text-cyan-300"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" /> Sample UPI Wire
              </button>
              <button 
                onClick={loadPresetFIR}
                className="flex items-center justify-center gap-2 p-2.5 bg-dark-950 hover:bg-dark-800 border border-emerald-900/40 hover:border-emerald-500/60 rounded-xl text-xs font-medium transition-all text-emerald-300"
              >
                <FileText className="w-4 h-4 text-emerald-400" /> Sample FIR Text
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-800 font-mono text-xs">
            <button 
              onClick={() => { setActiveTab('upload'); setError(null); }}
              className={`pb-2.5 px-4 font-bold transition-all border-b-2 ${activeTab === 'upload' ? 'border-intel-cyan text-intel-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              📁 File Upload (CSV / TXT)
            </button>
            <button 
              onClick={() => { setActiveTab('text'); setError(null); }}
              className={`pb-2.5 px-4 font-bold transition-all border-b-2 ${activeTab === 'text' ? 'border-intel-cyan text-intel-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
            >
              📝 Raw FIR Text Snippet
            </button>
          </div>

          {/* Controls Form */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Source Type Parser</label>
              <select 
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-intel-cyan font-mono"
              >
                <option value="AUTO">✨ Auto-Detect Format</option>
                <option value="CDR">📞 CDR Call Telemetry (CSV)</option>
                <option value="UPI_FINANCIAL">💸 UPI / Bank Wire (CSV)</option>
                <option value="FIR_REPORT">📄 FIR / Police Text Report</option>
              </select>
            </div>

            {activeTab === 'text' && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Report Title / Identifier</label>
                <input 
                  type="text" 
                  value={reportTitle} 
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-intel-cyan font-mono"
                  placeholder="e.g. Field Surveillance Report #04"
                />
              </div>
            )}
          </div>

          {/* Upload Dropzone */}
          {activeTab === 'upload' ? (
            <div className="relative border-2 border-dashed border-slate-800 hover:border-intel-cyan/60 rounded-2xl p-6 text-center bg-dark-950/50 transition-all cursor-pointer group">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".csv,.txt,.json,.log"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-dark-900 border border-slate-800 rounded-2xl group-hover:border-intel-cyan/40 group-hover:text-intel-cyan transition-all">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-intel-cyan" />
                </div>
                {selectedFile ? (
                  <div>
                    <span className="text-sm font-bold text-intel-cyan flex items-center gap-2 justify-center">
                      <FileCode className="w-4 h-4" /> {selectedFile.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click to change file
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-slate-200">Drag & drop your intelligence file or <span className="text-intel-cyan font-bold">browse</span></p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">Supports CDR CSV, UPI Financial CSV, or FIR Text reports</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Unstructured Intelligence Report / Intercept Text</label>
              <textarea 
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste police FIR, surveillance log notes, or wiretap transcript..."
                className="w-full bg-dark-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-intel-cyan resize-none"
              />
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs font-mono flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Summary Preview after Successful Ingestion */}
          {summary && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800/80 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ingestion Completed & Graph Updated
                </span>
                <span className="text-[11px] font-mono text-slate-400">Evidence ID: {summary.evidence_id}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-2.5 bg-dark-950/80 border border-slate-800 rounded-xl space-y-0.5">
                  <span className="intel-data-label">Source Feed</span>
                  <span className="text-slate-100 font-bold block">{summary.source_type}</span>
                </div>
                <div className="p-2.5 bg-dark-950/80 border border-slate-800 rounded-xl space-y-0.5">
                  <span className="intel-data-label">Extracted Entities</span>
                  <span className="text-emerald-400 font-bold text-sm block">+{summary.entities_created_count}</span>
                </div>
                <div className="p-2.5 bg-dark-950/80 border border-slate-800 rounded-xl space-y-0.5">
                  <span className="intel-data-label">Extracted Edges</span>
                  <span className="text-intel-cyan font-bold text-sm block">+{summary.relationships_created_count}</span>
                </div>
              </div>

              {/* Sample New Entities Pills */}
              {summary.new_entities.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="intel-data-label text-[10px]">Newly Discovered Graph Nodes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.new_entities.slice(0, 6).map(ent => (
                      <span key={ent.id} className="px-2 py-0.5 bg-dark-950 border border-slate-800 rounded text-[11px] font-mono text-slate-200">
                        {ent.type}: <strong>{ent.name}</strong>
                      </span>
                    ))}
                    {summary.new_entities.length > 6 && (
                      <span className="px-2 py-0.5 bg-dark-950 text-slate-400 text-[11px] font-mono rounded">
                        +{summary.new_entities.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-dark-950/80">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-all"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleIngest}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-intel-cyan hover:bg-cyan-400 text-dark-950 font-bold text-xs font-mono rounded-xl transition-all shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting & Extracting Graph...
              </>
            ) : (
              <>
                Ingest & Update Graph <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
