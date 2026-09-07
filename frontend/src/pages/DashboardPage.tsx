import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { AddEntityModal } from '../components/common/AddEntityModal';
import { apiService } from '../services/api';
import { Entity, Relationship, Alert, Investigation, NetworkGraphData, EvidenceItem, AuditLog } from '../types';
import { 
  Users, 
  Share2, 
  Briefcase, 
  Waypoints, 
  FileCheck2, 
  ShieldAlert, 
  ArrowRight,
  Plus,
  Activity,
  FolderPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [showAddRecord, setShowAddRecord] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ents, rels, alrts, invs, evs, audits, graph] = await Promise.all([
          apiService.getEntities(),
          apiService.getRelationships(),
          apiService.getAlerts(),
          apiService.getInvestigations(),
          apiService.getEvidenceList(),
          apiService.getAuditTrail(),
          apiService.getNetworkGraph()
        ]);
        setEntities(ents);
        setRelationships(rels);
        setAlerts(alrts);
        setInvestigations(invs);
        setEvidenceList(evs);
        setAuditLogs(audits);
        setGraphData(graph);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Initializing Intelligence Dashboard..." />;

  const bridgeEntitiesCount = entities.filter(e => e.is_bridge_node).length;

  return (
    <div className="space-y-8 font-sans">
      {/* Active Workspace Banner Notice */}
      <div className="p-4 bg-dark-900/90 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm shadow-md">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono text-intel-cyan font-bold uppercase tracking-wider">INVESTIGATION WORKSPACE:</span>
          <span className="text-slate-300">Investigator decision-support intelligence platform. Ready for live ingestion.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400 bg-dark-950 px-3 py-1 rounded-lg border border-slate-800/80 font-semibold">
            v2.0 Active Architecture
          </span>
          <button onClick={() => setShowAddRecord(true)} className="flex items-center gap-1.5 rounded-lg bg-intel-cyan px-3 py-2 text-xs font-bold text-dark-950 shadow-sm hover:bg-cyan-300 transition-all">
            <Plus className="h-4 w-4" /> Add Intelligence
          </button>
        </div>
      </div>

      {/* SECTION A: INVESTIGATION OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Active Cases</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{investigations.length}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Entities</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{entities.length}</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-intel-cyan shadow-sm">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Relationships</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{relationships.length}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400 shadow-sm">
              <Share2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Bridge Nodes</p>
              <h3 className="text-2xl font-bold text-intel-cyan font-mono">{bridgeEntitiesCount}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-sm">
              <Waypoints className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Anomalies</p>
              <h3 className="text-2xl font-bold text-rose-400 font-mono">{alerts.length}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Evidence Vault</p>
              <h3 className="text-2xl font-bold text-emerald-400 font-mono">{evidenceList.length}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION B: NETWORK INTELLIGENCE GRAPH & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Graph Interactive Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Network Intelligence Topology Map"
            subtitle="Cytoscape.js visualization showing active knowledge graph entities and relationship links."
            action={
              <Link to="/network" className="text-xs font-mono text-intel-cyan hover:underline flex items-center gap-1.5 font-semibold bg-intel-cyan/10 px-3 py-1.5 rounded-lg border border-intel-cyan/30">
                Full Network View <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {graphData && graphData.nodes.length > 0 ? (
              <CytoscapeGraph graphData={graphData} height="480px" />
            ) : (
              <div className="h-[480px] bg-dark-950/80 border border-slate-800/80 rounded-xl flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Activity className="w-12 h-12 text-slate-600 animate-pulse" />
                <h4 className="text-base font-bold text-slate-200">No Graph Data Currently Loaded</h4>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  Ingest CDR telemetry CSV, financial wire logs, or FIR report files to automatically build entity nodes and relationship edges.
                </p>
                <button
                  onClick={() => setShowAddRecord(true)}
                  className="px-4 py-2 bg-intel-cyan text-dark-950 text-xs font-mono font-bold rounded-lg hover:bg-cyan-300 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add First Entity Record
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* SECTION D: RECENT INVESTIGATION ACTIVITY FEED */}
        <div className="space-y-4">
          <Card title="Recent Activity Feed" subtitle="Audit log stream of investigator actions & system events.">
            {auditLogs.length > 0 ? (
              <div className="space-y-3.5">
                {auditLogs.slice(0, 5).map((act, i) => (
                  <div key={i} className="p-4 bg-dark-950/80 border border-slate-800/80 rounded-xl space-y-1.5 transition-all hover:border-slate-700/80">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-intel-cyan font-bold bg-intel-cyan/10 px-2 py-0.5 rounded border border-intel-cyan/30">{act.action_type}</span>
                      <span className="text-slate-400">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h5 className="font-semibold text-slate-100 text-sm leading-snug">{act.target_resource}</h5>
                    <p className="text-xs font-mono text-slate-400">Investigator: <span className="text-slate-300 font-semibold">{act.investigator_id}</span></p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-dark-950/60 border border-slate-800/80 rounded-xl space-y-2">
                <p className="text-xs font-mono text-slate-400">No activity logged yet.</p>
                <p className="text-[11px] text-slate-500">Actions taken in the system will automatically appear in this audit feed.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* SECTION C: INVESTIGATION ALERTS */}
      <Card
        title="Investigation Alerts & Pattern Findings"
        subtitle="Pattern anomalies flagged for investigator decision support."
      >
        {alerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {alerts.map((alr) => (
              <div key={alr.id} className="p-5 bg-dark-950/80 border border-slate-800/80 rounded-2xl space-y-4 hover:border-slate-700/80 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <Badge label={alr.severity} variant="severity" typeValue={alr.severity} size="sm" />
                  <span className="font-mono text-xs text-slate-400 bg-dark-900 px-2.5 py-1 rounded-md border border-slate-800/80 font-semibold">{alr.pattern_type}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-base mb-1.5">{alr.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{alr.description}</p>
                </div>
                
                {/* Explainable Why */}
                <div className="p-3.5 bg-dark-900/90 border border-slate-800/80 rounded-xl space-y-1.5 font-sans text-xs">
                  <span className="text-intel-cyan font-mono font-bold uppercase tracking-wider block text-[11px]">Explainability Reason:</span>
                  <p className="text-slate-300 leading-relaxed">{alr.explanation}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Confidence Score: <strong className="text-emerald-400 font-bold text-sm">{(alr.risk_score * 100).toFixed(0)}%</strong></span>
                  <Link to="/alerts" className="text-intel-cyan hover:underline font-bold flex items-center gap-1 bg-intel-cyan/10 px-3 py-1.5 rounded-lg border border-intel-cyan/30">
                    Inspect Alert &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-dark-950/60 border border-slate-800/80 rounded-xl space-y-2">
            <p className="text-xs font-mono text-slate-400">No active pattern anomalies flagged.</p>
            <p className="text-[11px] text-slate-500">Automated pattern detection monitors live ingested feeds for rapid transactions and CDR anomalies.</p>
          </div>
        )}
      </Card>
      {showAddRecord && (
        <AddEntityModal
          onClose={() => setShowAddRecord(false)}
          onCreated={(entity) => {
            setEntities(current => [entity, ...current]);
            apiService.getNetworkGraph().then(setGraphData).catch(console.error);
          }}
        />
      )}
    </div>
  );
};
