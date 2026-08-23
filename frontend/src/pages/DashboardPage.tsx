import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CytoscapeGraph } from '../components/graph/CytoscapeGraph';
import { apiService } from '../services/api';
import { Entity, Relationship, Alert, Investigation, NetworkGraphData, EvidenceItem } from '../types';
import { 
  Users, 
  Share2, 
  Briefcase, 
  AlertTriangle, 
  Waypoints, 
  FileCheck2, 
  ShieldAlert, 
  Activity, 
  ArrowRight,
  Clock,
  Eye,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [ents, rels, alrts, invs, evs, graph] = await Promise.all([
          apiService.getEntities(),
          apiService.getRelationships(),
          apiService.getAlerts(),
          apiService.getInvestigations(),
          apiService.getEvidenceList(),
          apiService.getNetworkGraph()
        ]);
        setEntities(ents);
        setRelationships(rels);
        setAlerts(alrts);
        setInvestigations(invs);
        setEvidenceList(evs);
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
      {/* Synthetic Demo Banner Notice */}
      <div className="p-4 bg-dark-900/90 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm shadow-md">
        <div className="flex items-center gap-3 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono text-intel-cyan font-bold uppercase tracking-wider">SIH 2026 DEMO MODE:</span>
          <span className="text-slate-300">Investigator decision-support intelligence platform. All network data is synthetic and non-verdict.</span>
        </div>
        <span className="font-mono text-xs text-slate-400 bg-dark-950 px-3 py-1 rounded-lg border border-slate-800/80 font-semibold">
          v2.0 Coordinated Architecture
        </span>
      </div>

      {/* SECTION A: INVESTIGATION OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Active Cases</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{investigations.length}</h3>
            </div>
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-400 shadow-inner">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Entities Analyzed</p>
              <h3 className="text-2xl font-bold text-slate-100 font-mono">{entities.length}</h3>
            </div>
            <div className="p-3 bg-cyan-950/60 border border-cyan-800/80 rounded-xl text-cyan-400 shadow-inner">
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
            <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-xl text-purple-400 shadow-inner">
              <Share2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-1">
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Hidden Paths</p>
              <h3 className="text-2xl font-bold text-intel-cyan font-mono">3</h3>
            </div>
            <div className="p-3 bg-indigo-950/60 border border-indigo-800/80 rounded-xl text-intel-cyan shadow-inner">
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
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-400 shadow-inner">
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
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-400 shadow-inner">
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
            subtitle="Interactive Cytoscape.js visualization showing bridge entities (gold glow) and cross-group links."
            action={
              <Link to="/investigations/case-801" className="text-xs font-mono text-intel-cyan hover:underline flex items-center gap-1.5 font-semibold bg-intel-cyan/10 px-3 py-1.5 rounded-lg border border-intel-cyan/30">
                Open 4-Pane Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {graphData && <CytoscapeGraph graphData={graphData} height="480px" />}
          </Card>
        </div>

        {/* SECTION D: RECENT INVESTIGATION ACTIVITY FEED */}
        <div className="space-y-4">
          <Card title="Recent Activity Feed" subtitle="Real-time audit log of investigator actions & AI inferences.">
            <div className="space-y-3.5">
              {[
                { time: '10 mins ago', action: 'Entity Reviewed', target: 'Subject Alpha (person-101)', investigator: 'Senior Investigator Miller' },
                { time: '25 mins ago', action: 'Relationship Inspected', target: 'Bank Account #SYN-994021 → Crypto Wallet', investigator: 'Senior Investigator Miller' },
                { time: '1 hour ago', action: 'Evidence Opened', target: 'Surveillance Field Intelligence SURV-2026-004', investigator: 'Agent R. Vance' },
                { time: '2 hours ago', action: 'What-If Executed', target: 'Simulated Removal of Subject Bravo (person-102)', investigator: 'Senior Investigator Miller' },
                { time: '3 hours ago', action: 'Report Generated', target: 'Operation NorthStar Briefing PDF', investigator: 'Senior Investigator Miller' },
              ].map((act, i) => (
                <div key={i} className="p-4 bg-dark-950/80 border border-slate-800/80 rounded-xl space-y-1.5 transition-all hover:border-slate-700/80">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-intel-cyan font-bold bg-intel-cyan/10 px-2 py-0.5 rounded border border-intel-cyan/30">{act.action}</span>
                    <span className="text-slate-400">{act.time}</span>
                  </div>
                  <h5 className="font-semibold text-slate-100 text-sm leading-snug">{act.target}</h5>
                  <p className="text-xs font-mono text-slate-400">Investigator: <span className="text-slate-300 font-semibold">{act.investigator}</span></p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION C: INVESTIGATION ALERTS */}
      <Card
        title="Investigation Alerts & Pattern Findings"
        subtitle="Non-verdict pattern anomalies flagged for investigator decision support."
      >
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
                <Link to="/investigations/case-801" className="text-intel-cyan hover:underline font-bold flex items-center gap-1 bg-intel-cyan/10 px-3 py-1.5 rounded-lg border border-intel-cyan/30">
                  Inspect in Workspace &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
