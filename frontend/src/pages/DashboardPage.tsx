import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { apiService } from '../services/api';
import { Entity, Relationship, Alert, Investigation, NetworkGraphData } from '../types';
import { 
  Users, 
  Share2, 
  Briefcase, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const activityData = [
  { time: '08:00', alerts: 2, transfers: 14, calls: 32 },
  { time: '10:00', alerts: 5, transfers: 28, calls: 45 },
  { time: '12:00', alerts: 3, transfers: 22, calls: 60 },
  { time: '14:00', alerts: 8, transfers: 41, calls: 88 },
  { time: '16:00', alerts: 6, transfers: 35, calls: 70 },
  { time: '18:00', alerts: 9, transfers: 50, calls: 95 },
  { time: '20:00', alerts: 4, transfers: 19, calls: 40 },
];

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ents, rels, alrts, invs, graph] = await Promise.all([
          apiService.getEntities(),
          apiService.getRelationships(),
          apiService.getAlerts(),
          apiService.getInvestigations(),
          apiService.getNetworkGraph()
        ]);
        setEntities(ents);
        setRelationships(rels);
        setAlerts(alrts);
        setInvestigations(invs);
        setGraphData(graph);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Initializing Criminal Network Intelligence Engine..." />;

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

  return (
    <div className="space-y-6">
      {/* Synthetic Data Banner Notice */}
      <div className="p-3 bg-dark-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono text-cyan-400 font-semibold">MOCK DATA MODE:</span>
          <span>All entities, accounts, and relationships are 100% synthetic for investigative demonstration.</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 bg-dark-950 px-2 py-0.5 rounded border border-slate-800">
          Decision Support System v1.0
        </span>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entities */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400 tracking-wider">Total Entities</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono">{entities.length}</h3>
              <span className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> Tracked Persons, Orgs, Accounts
              </span>
            </div>
            <div className="p-3 bg-cyan-950/60 border border-cyan-800/80 rounded-xl text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Total Relationships */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400 tracking-wider">Total Connections</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono">{relationships.length}</h3>
              <span className="text-[11px] text-purple-400 flex items-center gap-1 mt-1">
                <Share2 className="w-3 h-3" /> Graph Edges & Links
              </span>
            </div>
            <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-xl text-purple-400">
              <Share2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Active Investigations */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400 tracking-wider">Active Cases</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono">{investigations.length}</h3>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                <Briefcase className="w-3 h-3" /> Priority Case Boards
              </span>
            </div>
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Suspicious Pattern Alerts */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase text-slate-400 tracking-wider">Pattern Alerts</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1 font-mono">{alerts.length}</h3>
              <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3 animate-pulse" /> High-Risk Anomalies
              </span>
            </div>
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Network Overview & High-Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Graph Visualizer Preview (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Knowledge Graph Overview"
            subtitle="Interactive network map of tracked synthetic criminal entities and cross-link relationships."
            action={
              <Link to="/network" className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1">
                Full Network Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {graphData ? (
              <CytoscapeGraph graphData={graphData} height="420px" />
            ) : (
              <div className="h-[420px] flex items-center justify-center text-slate-500">No graph payload available</div>
            )}
          </Card>

          {/* Activity Trend Chart */}
          <Card
            title="Intelligence Activity Telemetry"
            subtitle="Hourly pattern telemetry across encrypted wire transfers and call intercepts."
          >
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTransfers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="transfers" stroke="#00f0ff" fillOpacity={1} fill="url(#colorTransfers)" name="Wire Transfers" />
                  <Area type="monotone" dataKey="alerts" stroke="#f43f5e" fillOpacity={1} fill="url(#colorAlerts)" name="High-Risk Alerts" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* High Priority Alerts Side Feed (1 Column) */}
        <div className="space-y-4">
          <Card
            title="High-Priority Pattern Alerts"
            subtitle="Detected graph anomalies requiring investigator review."
            action={
              <Link to="/alerts" className="text-xs font-mono text-slate-400 hover:text-slate-200">
                View All ({alerts.length})
              </Link>
            }
          >
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-dark-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge label={alert.severity} variant="severity" typeValue={alert.severity} size="sm" />
                    <span className="text-[10px] font-mono text-slate-500">{alert.pattern_type}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100">{alert.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{alert.description}</p>
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Risk Score: {(alert.risk_score * 100).toFixed(0)}%</span>
                    <span className="text-cyan-400">Explain Pattern &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Investigations Quick List */}
          <Card title="Active Cases">
            <div className="space-y-3">
              {investigations.map((c) => (
                <div key={c.id} className="p-3 bg-dark-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-cyan-400">{c.case_number}</span>
                    <Badge label={c.priority} variant="severity" typeValue={c.priority} size="sm" />
                  </div>
                  <h5 className="text-xs font-medium text-slate-200 mt-1">{c.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-1">{c.summary}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
