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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-intel-cyan" /> Investigator Audit Trail Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident log of all investigative searches, evidence inspections, what-if executions, and report generations.
          </p>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-dark-950 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Investigator ID</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-dark-850/60 transition-colors">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-intel-cyan">
                    {log.investigator_id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-dark-950 border border-slate-800 rounded text-slate-200 text-[10px]">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    {log.target_resource}
                  </td>
                  <td className="py-3 px-4 text-[10px] text-slate-400">
                    {JSON.stringify(log.details)}
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
