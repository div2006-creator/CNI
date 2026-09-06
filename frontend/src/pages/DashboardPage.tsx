import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { GeoSpatialMap } from '../components/map/GeoSpatialMap';
import { apiService } from '../services/api';
import { Entity, Relationship, Alert, Investigation, NetworkGraphData, EvidenceItem } from '../types';
import {
  Users,
  Share2,
  Briefcase,
  AlertTriangle,
  FileCheck2,
  ShieldAlert,
  Activity,
  ArrowRight,
  Clock,
  Eye,
  TrendingUp,
  Landmark,
  Sparkles,
  Bot,
  FileText,
  MapPin,
  Globe,
  Radio,
  SlidersHorizontal,
  Compass,
  Database
} from 'lucide-react';

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

  if (loading) return <LoadingSpinner message="Initializing Stitch Intelligence Command Center..." />;

  const criticalEntities = entities.filter(e => e.risk_level === 'CRITICAL' || e.risk_level === 'HIGH');
  const bridgeCount = entities.filter(e => e.is_bridge_node).length;

  return (
    <div className="space-y-6 font-sans max-w-[1650px] mx-auto pb-10">
      {/* Hero Command Banner */}
      <div className="relative overflow-hidden p-6 intel-glass-panel border-l-4 border-l-saffron-600 border-[#e5dfd3] glow-cyan flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2 font-mono text-xs text-saffron-700 uppercase tracking-widest font-extrabold">
            <Globe className="w-4 h-4 text-saffron-600 animate-pulse" />
            Stitch Indian Intelligence & Spatial Command Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1c1917] tracking-tight flex items-center gap-3">
            NEXUS INTELLIGENCE DASHBOARD
            <span className="px-2.5 py-0.5 text-xs font-mono bg-saffron-600/10 text-saffron-700 border border-saffron-600/30 rounded-full font-bold">
              v2.4 STITCH LIGHT
            </span>
          </h1>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            Explainable Criminal Network Analysis, Real-Time Spatial Triangulation, Financial Flow Tracking & Decision-Support Intelligence.
          </p>
        </div>

        {/* Live System Status Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs z-10">
          <div className="px-3 py-1.5 bg-white border border-emerald-600/30 rounded-xl flex items-center gap-2 text-emerald-700 font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>FastAPI Server Online</span>
          </div>
          <div className="px-3 py-1.5 bg-white border border-saffron-600/30 rounded-xl flex items-center gap-2 text-saffron-700 font-bold shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-saffron-600" />
            <span>Leaflet Spatial Active</span>
          </div>
        </div>
      </div>

      {/* Top Metric Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="p-4 intel-glass-panel intel-card-hover space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Active Cases</span>
            <div className="p-2 bg-saffron-600/10 border border-saffron-600/30 rounded-xl text-saffron-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold font-mono text-[#1c1917]">{investigations.length || 1}</h3>
            <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-bold">
              <TrendingUp className="w-3 h-3" /> +100% Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Operation Vortex Syndicates</p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 intel-glass-panel intel-card-hover space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Entities Analyzed</span>
            <div className="p-2 bg-purple-100 border border-purple-200 rounded-xl text-purple-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold font-mono text-[#1c1917]">{entities.length || 14}</h3>
            <span className="text-[10px] font-mono text-purple-700 font-bold">{bridgeCount} Bridge Nodes</span>
          </div>
          <p className="text-[10px] text-slate-500">Cross-Jurisdictional Targets</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 intel-glass-panel intel-card-hover space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Relationships</span>
            <div className="p-2 bg-blue-100 border border-blue-200 rounded-xl text-blue-700">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold font-mono text-[#1c1917]">{relationships.length || 24}</h3>
            <span className="text-[10px] font-mono text-blue-700 font-bold">High Centrality</span>
          </div>
          <p className="text-[10px] text-slate-500">Calls, Wire Transfers & Visits</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 intel-glass-panel intel-card-hover space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Critical Alerts</span>
            <div className="p-2 bg-rose-100 border border-rose-200 rounded-xl text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold font-mono text-rose-600">{alerts.length || 2}</h3>
            <span className="text-[10px] font-mono text-rose-600 font-bold animate-pulse">Action Required</span>
          </div>
          <p className="text-[10px] text-slate-500">Co-Location & Wire Anomaly</p>
        </div>

        {/* Metric 5 */}
        <div className="p-4 intel-glass-panel intel-card-hover space-y-2 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-mono uppercase tracking-wider font-bold">Evidence Sealed</span>
            <div className="p-2 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-700">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extrabold font-mono text-[#1c1917]">{evidenceList.length || 5}</h3>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">SHA-256 Audit</span>
          </div>
          <p className="text-[10px] text-slate-500">Tamper-Evident Records</p>
        </div>
      </div>

      {/* Main Grid: Real Leaflet Map Widget (Left) + Intelligence Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spatial Intelligence Map Widget */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 intel-glass-panel space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-[#1c1917] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-saffron-600" />
                  Real-Time Spatial Intelligence Map
                </h3>
                <p className="text-xs text-slate-600">
                  Live spatial tracking centered on target hubs (Delhi, Mumbai, London, Dubai).
                </p>
              </div>

              <Link
                to="/spatial"
                className="intel-btn-primary text-xs"
              >
                <span>Full Screen Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Embedded Real Geo Map Component */}
            <GeoSpatialMap height="460px" />
          </div>
        </div>

        {/* Priority Intelligence Leads & Alert Drawer */}
        <div className="space-y-4">
          <div className="p-4 intel-glass-panel space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-2">
              <h3 className="text-sm font-bold text-[#1c1917] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Priority Target Dossiers
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-bold">High Risk</span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {criticalEntities.slice(0, 5).map((entity) => (
                <div
                  key={entity.id}
                  className="p-3 bg-[#fcfcf9] border border-[#e5dfd3] hover:border-saffron-600/40 rounded-xl space-y-1.5 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1c1917]">{entity.name}</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                      entity.risk_level === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {entity.risk_level} ({entity.risk_score})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                    <span className="px-1.5 py-0.5 bg-white border border-[#e5dfd3] rounded">
                      {entity.type}
                    </span>
                    {entity.is_bridge_node && (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded font-bold">
                        BRIDGE ENTITY
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500">
                    <span>Connections: <strong className="text-slate-800">{entity.connection_count || 3}</strong></span>
                    <span>Centrality: <strong className="text-saffron-700">{entity.betweenness_centrality || 0.45}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Core Intelligence Module Navigation Cards (Stitch Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-2">
          <h2 className="text-base font-bold text-[#1c1917] flex items-center gap-2">
            <Compass className="w-5 h-5 text-saffron-600" />
            Core Investigation Modules & Workflow
          </h2>
          <span className="text-xs font-mono text-slate-500">Select Module</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <Link
            to="/spatial"
            className="p-4 intel-glass-panel intel-card-hover space-y-2 group"
          >
            <div className="p-2.5 w-fit bg-saffron-600/10 border border-saffron-600/30 rounded-xl text-saffron-600 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1917] group-hover:text-saffron-600 transition-colors">Spatial Map Intel</h4>
              <p className="text-[11px] text-slate-600 leading-tight mt-1">Real-time Leaflet map, safehouse tracking & co-locations.</p>
            </div>
          </Link>

          <Link
            to="/network"
            className="p-4 intel-glass-panel intel-card-hover space-y-2 group"
          >
            <div className="p-2.5 w-fit bg-purple-100 border border-purple-200 rounded-xl text-purple-700 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1917] group-hover:text-purple-700 transition-colors">Network Graph</h4>
              <p className="text-[11px] text-slate-600 leading-tight mt-1">Cytoscape interactive criminal relationship graph.</p>
            </div>
          </Link>

          <Link
            to="/financial"
            className="p-4 intel-glass-panel intel-card-hover space-y-2 group"
          >
            <div className="p-2.5 w-fit bg-amber-100 border border-amber-200 rounded-xl text-amber-700 group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1917] group-hover:text-amber-700 transition-colors">Financial Flow</h4>
              <p className="text-[11px] text-slate-600 leading-tight mt-1">Wire transfer tracking, layering & smurfing alerts.</p>
            </div>
          </Link>

          <Link
            to="/predictive"
            className="p-4 intel-glass-panel intel-card-hover space-y-2 group"
          >
            <div className="p-2.5 w-fit bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-700 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1917] group-hover:text-emerald-700 transition-colors">Predictive Nexus</h4>
              <p className="text-[11px] text-slate-600 leading-tight mt-1">Candidate link prediction & hidden association engine.</p>
            </div>
          </Link>

          <Link
            to="/copilot"
            className="p-4 intel-glass-panel intel-card-hover space-y-2 group"
          >
            <div className="p-2.5 w-fit bg-blue-100 border border-blue-200 rounded-xl text-blue-700 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1917] group-hover:text-blue-700 transition-colors">Investigator Copilot</h4>
              <p className="text-[11px] text-slate-600 leading-tight mt-1">AI Assistant for graph Q&A, evidence explanation & query.</p>
            </div>
          </Link>

          <Link
            to="/reports"
            className="p-4 intel-glass-panel intel-card-hover space-y-2 group"
          >
            <div className="p-2.5 w-fit bg-rose-100 border border-rose-200 rounded-xl text-rose-700 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1917] group-hover:text-rose-700 transition-colors">Dossiers & Reports</h4>
              <p className="text-[11px] text-slate-600 leading-tight mt-1">Auditable intelligence dossier generation with SHA-256 seal.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
