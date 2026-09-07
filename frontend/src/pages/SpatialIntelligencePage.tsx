import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Globe, 
  Compass, 
  Radio, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  Search, 
  Sliders, 
  ArrowUpRight,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { GeoSpatialMap, GeoLocationPoint } from '../components/map/GeoSpatialMap';
import { apiService } from '../services/api';

export const SpatialIntelligencePage: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<GeoLocationPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 intel-glass-panel border-l-4 border-l-saffron-600 border-[#e5dfd3] glow-cyan">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-saffron-700 uppercase tracking-widest font-extrabold">
            <Globe className="w-4 h-4 text-saffron-600 animate-spin-slow" />
            Geospatial Intelligence & Movement Triangulation
          </div>
          <h1 className="text-2xl font-extrabold text-[#1c1917] tracking-tight flex items-center gap-3">
            Spatial Intelligence Map
            <span className="px-2 py-0.5 text-xs font-mono bg-saffron-600/10 text-saffron-700 border border-saffron-600/30 rounded-md font-bold">
              LIVE CARTO VOYAGER MAP
            </span>
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl">
            Real-time geolocation tracking of targets, safehouse locations, cell tower IMEI triangulation, and movement vectors across jurisdictions.
          </p>
        </div>

        {/* Telemetry Metrics */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="p-3 bg-white border border-[#e5dfd3] rounded-xl min-w-[130px] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Active Markers</span>
            <span className="text-lg font-bold text-saffron-700">7 Nodes</span>
          </div>
          <div className="p-3 bg-white border border-[#e5dfd3] rounded-xl min-w-[130px] shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase block font-bold">Co-Locations</span>
            <span className="text-lg font-bold text-purple-700">5 Events</span>
          </div>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl min-w-[130px] shadow-xs">
            <span className="text-[10px] text-rose-700 uppercase block font-bold">Mismatch Alert</span>
            <span className="text-lg font-bold text-rose-700 animate-pulse">Aug 17 Flag</span>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Map Visualization */}
        <div className="lg:col-span-3 space-y-4">
          <div className="intel-card p-2">
            <GeoSpatialMap
              height="620px"
              selectedLocationId={selectedPoint?.id}
              onSelectLocation={(loc) => setSelectedPoint(loc)}
            />
          </div>

          {/* Surveillance Log Footer Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 intel-card flex items-start gap-3">
              <div className="p-2 bg-rose-100 border border-rose-200 rounded-lg text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-mono text-[10px] font-bold text-rose-700 uppercase block">Location Mismatch Alert</span>
                <p className="text-slate-700">
                  Subject Alpha & Subject Delta cell tower mismatch logged on Aug 17 (Delhi Tower vs Offshore Roaming).
                </p>
              </div>
            </div>

            <div className="p-4 intel-card flex items-start gap-3">
              <div className="p-2 bg-purple-100 border border-purple-200 rounded-lg text-purple-700 shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-mono text-[10px] font-bold text-purple-700 uppercase block">Safehouse Delta Overlap</span>
                <p className="text-slate-700">
                  5 concurrent co-location events recorded at Warehouse Hub 7 within a 500m radius.
                </p>
              </div>
            </div>

            <div className="p-4 intel-card flex items-start gap-3">
              <div className="p-2 bg-saffron-600/10 border border-saffron-600/30 rounded-lg text-saffron-700 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <span className="font-mono text-[10px] font-bold text-saffron-700 uppercase block">Movement Vector Track</span>
                <p className="text-slate-700">
                  Subject Charlie courier transit route tracked from Connaught Hub to Noida Industrial Sector.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Geolocation Directory & Inspector */}
        <div className="space-y-4">
          <div className="intel-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5dfd3] pb-2">
              <h3 className="text-sm font-bold text-[#1c1917] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-saffron-600" />
                Spatial Target Index
              </h3>
              <span className="text-[10px] font-mono text-slate-500 font-bold">7 Tracked</span>
            </div>

            {/* Target List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {[
                { name: 'Warehouse Hub 7', type: 'SAFEHOUSE', risk: 'CRITICAL', coords: '28.6139° N, 77.2090° E', desc: 'Primary clandestine meeting hub' },
                { name: 'Subject Alpha (Broker)', type: 'PERSON', risk: 'CRITICAL', coords: '28.6280° N, 77.2189° E', desc: 'Connaught Hub, New Delhi' },
                { name: 'Subject Bravo (Apex)', type: 'PERSON', risk: 'HIGH', coords: '19.0760° N, 72.8777° E', desc: 'Bandra Complex, Mumbai' },
                { name: 'Safehouse Delta', type: 'LOCATION', risk: 'HIGH', coords: '25.2048° N, 55.2708° E', desc: 'Business Bay, Dubai' },
                { name: 'Vortex Trading HQ', type: 'LOCATION', risk: 'CRITICAL', coords: '51.5074° N, -0.1278° E', desc: 'Financial District, London' },
                { name: 'Subject Charlie Vehicle', type: 'VEHICLE', risk: 'MEDIUM', coords: '28.5355° N, 77.3910° E', desc: 'Expressway Sector 132' },
                { name: 'Cell Tower Sector 4', type: 'CELL_TOWER', risk: 'HIGH', coords: '28.6210° N, 77.2140° E', desc: 'Overlap Cell Sector' }
              ].map((target, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPoint({
                    id: `target-${i}`,
                    name: target.name,
                    type: target.type,
                    lat: parseFloat(target.coords.split(',')[0]),
                    lng: parseFloat(target.coords.split(',')[1]),
                    risk_level: target.risk as any,
                    risk_score: 0.9,
                    category: target.type as any,
                    details: target.desc,
                    address: target.coords
                  })}
                  className="p-3 bg-[#fcfcf9] border border-[#e5dfd3] hover:border-saffron-600/40 rounded-xl cursor-pointer transition-all hover:bg-white group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1c1917] group-hover:text-saffron-700 transition-colors">
                      {target.name}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      target.risk === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      target.risk === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {target.risk}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight mb-1.5">{target.desc}</p>
                  <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
                    <span>📍 {target.coords}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-saffron-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
