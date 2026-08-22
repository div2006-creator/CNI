import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { Alert } from '../types';
import { AlertTriangle, ShieldAlert, Cpu, CheckCircle2, Eye, Filter } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await apiService.getAlerts();
        setAlerts(data);
      } catch (err) {
        console.error('Alerts load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const filtered = selectedSeverity ? alerts.filter(a => a.severity === selectedSeverity) : alerts;

  if (loading) return <LoadingSpinner message="Fetching suspicious pattern alerts..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500" /> Suspicious Pattern Alerts Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explainable AI & graph rule anomalies automatically flagged across financial transfers and communications.
          </p>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-dark-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setSelectedSeverity('')}
          className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
            selectedSeverity === '' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Severities ({alerts.length})
        </button>
        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => {
          const count = alerts.filter(a => a.severity === s).length;
          return (
            <button
              key={s}
              onClick={() => setSelectedSeverity(s)}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                selectedSeverity === s ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((alert) => (
          <Card key={alert.id} className="border-slate-800/80 hover:border-slate-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Badge label={alert.severity} variant="severity" typeValue={alert.severity} size="sm" />
                <Badge label={alert.status} variant="status" typeValue={alert.status} size="sm" />
              </div>

              <div>
                <span className="text-[10px] font-mono text-intel-cyan uppercase tracking-wider">{alert.pattern_type}</span>
                <h3 className="text-sm font-bold text-slate-100 mt-0.5">{alert.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.description}</p>
              </div>

              {/* Explainable Insight Box */}
              <div className="p-3 bg-dark-950 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-intel-cyan font-mono text-[10px] font-semibold">
                  <Cpu className="w-3.5 h-3.5" /> Explainable Graph Pattern Rule
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">{alert.explanation}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">Risk Score: <strong className="text-rose-400">{(alert.risk_score * 100).toFixed(0)}%</strong></span>
                <button className="flex items-center gap-1 text-xs font-mono text-intel-cyan hover:underline">
                  Inspect Linked Entities &rarr;
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
