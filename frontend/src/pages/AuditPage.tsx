import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiService } from '../services/api';
import { AuditLog } from '../types';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';

export const AuditPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    async function loadAudit() {
      try {
        const data = await apiService.getAuditTrail();
        setLogs(data);
      } catch (err) {
        console.error('Audit trail error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAudit();
  }, []);

  if (loading) return <LoadingSpinner message="Querying immutable audit log trail..." />;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <History className="w-7 h-7 text-intel-cyan" /> Investigator Audit Trail Log
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 leading-relaxed">
            Tamper-evident log of all investigative searches, evidence inspections, what-if executions, and report generations.
          </p>
        </div>
      </div>

      <Card title="Immutable Audit Event Ledger" subtitle="Tamper-proof chronological records for chain-of-custody compliance.">
        <div className="intel-table-container">
          <table className="intel-table">
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Investigator ID</th>
                <th>Action Type</th>
                <th>Target Resource</th>
                <th>Audit Context Details</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-850/80 transition-colors">
                  <td className="text-slate-400 font-semibold">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="font-bold text-intel-cyan">
                    {log.investigator_id}
                  </td>
                  <td>
                    <span className="px-2.5 py-1 bg-intel-cyan/10 border border-intel-cyan/30 rounded-md text-intel-cyan text-xs font-bold">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="font-semibold text-slate-100 font-sans">
                    {log.target_resource}
                  </td>
                  <td className="text-slate-400 text-xs font-sans">
                    {typeof log.details === 'object' ? (
                      <span className="px-2 py-1 bg-dark-950 border border-slate-800/80 rounded-md inline-block font-mono text-[11px] text-slate-300">
                        {JSON.stringify(log.details)}
                      </span>
                    ) : log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
