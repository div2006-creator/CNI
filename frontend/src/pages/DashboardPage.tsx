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
    <div className="space-y-6 font-sans">
      {/* Synthetic Demo Banner Notice */}
      <div className="p-3 bg-dark-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono text-intel-cyan font-bold uppercase">SIH 2026 DEMO MODE:</span>
          <span>Investigator decision-support software. All data is synthetic and non-verdict.</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 bg-dark-950 px-2 py-0.5 rounded border border-slate-800">
          v2.0 Coordinated Architecture
        </span>
      </div>

      {/* SECTION A: INVESTIGATION OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Active Cases</p>
              <h3 className="text-xl font-bold text-slate-100 font-mono mt-0.5">{investigations.length}</h3>
            </div>
            <div className="p-2 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Entities Analyzed</p>
              <h3 className="text-xl font-bold text-slate-100 font-mono mt-0.5">{entities.length}</h3>
            </div>
            <div className="p-2 bg-cyan-950/60 border border-cyan-800 rounded-lg text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Relationships</p>
              <h3 className="text-xl font-bold text-slate-100 font-mono mt-0.5">{relationships.length}</h3>
            </div>
            <div className="p-2 bg-purple-950/60 border border-purple-800 rounded-lg text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Hidden Paths</p>
              <h3 className="text-xl font-bold text-intel-cyan font-mono mt-0.5">3</h3>
            </div>
            <div className="p-2 bg-indigo-950/60 border border-indigo-800 rounded-lg text-intel-cyan">
              <Waypoints className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Anomalies</p>
              <h3 className="text-xl font-bold text-rose-400 font-mono mt-0.5">{alerts.length}</h3>
            </div>
            <div className="p-2 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Evidence Items</p>
              <h3 className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{evidenceList.length}</h3>
            </div>
            <div className="p-2 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
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
              <Link to="/investigations/case-801" className="text-xs font-mono text-intel-cyan hover:underline flex items-center gap-1">
                Open 4-Pane Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {graphData && <CytoscapeGraph graphData={graphData} height="440px" />}
          </Card>
        </div>

        {/* SECTION D: RECENT INVESTIGATION ACTIVITY FEED */}
        <div className="space-y-4">
          <Card title="Recent Investigation Activity">
            <div className="space-y-3">
              {[
                { time: '10 mins ago', action: 'Entity Reviewed', target: 'Subject Alpha (person-101)', investigator: 'Senior Investigator Miller' },
                { time: '25 mins ago', action: 'Relationship Inspected', target: 'Bank Account #SYN-994021 → Crypto Wallet', investigator: 'Senior Investigator Miller' },
                { time: '1 hour ago', action: 'Evidence Opened', target: 'Surveillance Field Intelligence SURV-2026-004', investigator: 'Agent R. Vance' },
                { time: '2 hours ago', action: 'What-If Executed', target: 'Simulated Removal of Subject Bravo (person-102)', investigator: 'Senior Investigator Miller' },
                { time: '3 hours ago', action: 'Report Generated', target: 'Operation NorthStar Briefing PDF', investigator: 'Senior Investigator Miller' },
              ].map((act, i) => (
                <div key={i} className="p-3 bg-dark-950 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-intel-cyan font-bold">{act.action}</span>
                    <span className="text-slate-500">{act.time}</span>
                  </div>
                  <h5 className="font-semibold text-slate-200">{act.target}</h5>
                  <p className="text-[10px] font-mono text-slate-400">By: {act.investigator}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alr) => (
            <div key={alr.id} className="p-4 bg-dark-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <Badge label={alr.severity} variant="severity" typeValue={alr.severity} size="sm" />
                <span className="font-mono text-[10px] text-slate-400">{alr.pattern_type}</span>
              </div>
              <h4 className="font-bold text-slate-100 text-sm">{alr.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{alr.description}</p>
              
              {/* Explainable Why */}
              <div className="p-2.5 bg-dark-900 border border-slate-800 rounded-lg text-xs space-y-1 font-mono text-[11px]">
                <span className="text-intel-cyan font-semibold block">Explainability Reason:</span>
                <span className="text-slate-400">{alr.explanation}</span>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Confidence: <strong className="text-emerald-400">{(alr.risk_score * 100).toFixed(0)}%</strong></span>
                <Link to="/investigations/case-801" className="text-intel-cyan hover:underline font-semibold">
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
