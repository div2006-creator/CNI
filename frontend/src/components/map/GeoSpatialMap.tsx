import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  Eye, 
  Radio, 
  AlertTriangle, 
  Shield, 
  Navigation,
  RefreshCw,
  Sliders,
  Filter
} from 'lucide-react';
import { Entity, RiskLevel } from '../../types';

export interface GeoLocationPoint {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  risk_level: RiskLevel;
  risk_score: number;
  category: 'PERSON' | 'LOCATION' | 'VEHICLE' | 'SAFEHOUSE' | 'CELL_TOWER';
  details: string;
  address?: string;
  last_active?: string;
  co_location_count?: number;
}

export interface GeoSpatialMapProps {
  locations?: GeoLocationPoint[];
  selectedLocationId?: string | null;
  onSelectLocation?: (location: GeoLocationPoint) => void;
  height?: string;
}

// High-precision synthetic spatial intelligence dataset
const SPATIAL_INTELLIGENCE_NODES: GeoLocationPoint[] = [
  {
    id: 'loc-501',
    name: 'Warehouse Hub 7 (Safehouse)',
    type: 'SAFEHOUSE',
    lat: 28.6139,
    lng: 77.2090,
    risk_level: 'CRITICAL',
    risk_score: 0.95,
    category: 'SAFEHOUSE',
    details: 'Primary clandestine meeting hub & contraband stash site.',
    address: 'Sector 4, Industrial Area, New Delhi',
    last_active: '10 mins ago',
    co_location_count: 5
  },
  {
    id: 'person-101',
    name: 'Subject Alpha (The Broker)',
    type: 'PERSON',
    lat: 28.6280,
    lng: 77.2189,
    risk_level: 'CRITICAL',
    risk_score: 0.92,
    category: 'PERSON',
    details: 'Primary Target observed via cellular triangulation.',
    address: 'Connaught Hub, New Delhi',
    last_active: 'Active Now',
    co_location_count: 4
  },
  {
    id: 'person-102',
    name: 'Subject Bravo (Apex Intermediary)',
    type: 'PERSON',
    lat: 19.0760,
    lng: 72.8777,
    risk_level: 'HIGH',
    risk_score: 0.85,
    category: 'PERSON',
    details: 'Logistics coordinator logged near shipping terminal.',
    address: 'Bandra-Kurla Complex, Mumbai',
    last_active: '1 hour ago',
    co_location_count: 3
  },
  {
    id: 'loc-502',
    name: 'Safehouse Delta (Offshore Roaming Node)',
    type: 'LOCATION',
    lat: 25.2048,
    lng: 55.2708,
    risk_level: 'HIGH',
    risk_score: 0.88,
    category: 'SAFEHOUSE',
    details: 'Encrypted satellite gateway & financial staging ground.',
    address: 'Business Bay, Dubai, UAE',
    last_active: '3 hours ago',
    co_location_count: 2
  },
  {
    id: 'org-201',
    name: 'Vortex Trading Corp HQ',
    type: 'LOCATION',
    lat: 51.5074,
    lng: -0.1278,
    risk_level: 'CRITICAL',
    risk_score: 0.90,
    category: 'LOCATION',
    details: 'Registered shell company office address linked to wire transfers.',
    address: 'Financial District, London, UK',
    last_active: '5 hours ago',
    co_location_count: 6
  },
  {
    id: 'veh-301',
    name: 'Subject Charlie Courier Vehicle (Transit)',
    type: 'VEHICLE',
    lat: 28.5355,
    lng: 77.3910,
    risk_level: 'MEDIUM',
    risk_score: 0.65,
    category: 'VEHICLE',
    details: 'Armored transport vehicle tracked via ANPR cameras.',
    address: 'Expressway Sector 132, Noida',
    last_active: '15 mins ago',
    co_location_count: 1
  },
  {
    id: 'tower-901',
    name: 'Cell Tower Sector 4 (Overlap Zone)',
    type: 'CELL_TOWER',
    lat: 28.6210,
    lng: 77.2140,
    risk_level: 'HIGH',
    risk_score: 0.82,
    category: 'CELL_TOWER',
    details: 'Multiple concurrent IMEI hits recorded during Aug 17 window.',
    address: 'Tower #402, Central Telecommunications Complex',
    last_active: 'Live Telemetry',
    co_location_count: 8
  }
];

export const GeoSpatialMap: React.FC<GeoSpatialMapProps> = ({
  locations = SPATIAL_INTELLIGENCE_NODES,
  selectedLocationId,
  onSelectLocation,
  height = '560px'
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [showCoLocationRadius, setShowCoLocationRadius] = useState<boolean>(true);
  const [showMovementVectors, setShowMovementVectors] = useState<boolean>(true);
  const [tileStyle, setTileStyle] = useState<'VOYAGER' | 'OPENSTREETMAP'>('VOYAGER');
  const [selectedNode, setSelectedNode] = useState<GeoLocationPoint | null>(null);

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL': return '#e11d48';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#0284c7';
      default: return '#059669';
    }
  };

  // Create custom DOM Marker HTML
  const createCustomIcon = (point: GeoLocationPoint, isSelected: boolean) => {
    const color = getRiskColor(point.risk_level);
    const pulseGlow = point.risk_level === 'CRITICAL' ? 'animate-ping' : '';

    const html = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full opacity-30 ${pulseGlow}" style="background-color: ${color}"></div>
        <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-md transition-all duration-300 ${
          isSelected ? 'scale-125 ring-4 ring-orange-400' : 'hover:scale-110'
        }" style="background-color: #ffffff; border-color: ${color}">
          <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
        </div>
        <div class="absolute -bottom-5 whitespace-nowrap text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/95 border border-[#d8cfbe] text-slate-800 shadow-sm">
          ${point.name.split(' ')[0]}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      // Initialize Leaflet Map centered on Delhi/India hub
      const map = L.map(mapRef.current, {
        center: [28.6139, 77.2090],
        zoom: 11,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;

    // Tile Layer Setup
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = tileStyle === 'VOYAGER'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = tileStyle === 'VOYAGER'
      ? '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    L.tileLayer(tileUrl, { attribution, maxZoom: 18 }).addTo(map);

    // Clear existing markers & overlays
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Filter nodes
    const filteredPoints = activeCategory === 'ALL'
      ? locations
      : locations.filter(p => p.category === activeCategory);

    // Render Markers
    filteredPoints.forEach((point) => {
      const isSelected = selectedLocationId === point.id || selectedNode?.id === point.id;
      const icon = createCustomIcon(point, isSelected);

      const marker = L.marker([point.lat, point.lng], { icon }).addTo(map);
      markersRef.current[point.id] = marker;

      // Popup html
      const popupHtml = `
        <div class="p-2 space-y-1.5 font-sans min-w-[200px]">
          <div class="flex items-center justify-between gap-2 border-b border-[#e5dfd3] pb-1.5">
            <span class="text-xs font-bold text-slate-900">${point.name}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold text-white" style="background-color: ${getRiskColor(point.risk_level)}">
              ${point.risk_level}
            </span>
          </div>
          <p class="text-xs text-slate-700 leading-snug">${point.details}</p>
          ${point.address ? `<div class="text-[10px] text-slate-500 font-mono">📍 ${point.address}</div>` : ''}
          <div class="flex items-center justify-between text-[10px] text-slate-600 font-mono pt-1">
            <span>Last Active: <strong class="text-slate-900">${point.last_active || 'N/A'}</strong></span>
            <span>Co-locations: <strong class="text-orange-600">${point.co_location_count || 0}</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedNode(point);
        if (onSelectLocation) onSelectLocation(point);
      });
    });

    // Draw Co-location radius circles
    if (showCoLocationRadius) {
      filteredPoints.forEach((point) => {
        if (point.category === 'SAFEHOUSE' || point.category === 'CELL_TOWER') {
          L.circle([point.lat, point.lng], {
            radius: point.category === 'CELL_TOWER' ? 2500 : 1500,
            color: getRiskColor(point.risk_level),
            fillColor: getRiskColor(point.risk_level),
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '4, 6'
          }).addTo(map);
        }
      });
    }

    // Draw Movement Vectors between related points
    if (showMovementVectors && filteredPoints.length >= 2) {
      const DelhiNodes = filteredPoints.filter(p => Math.abs(p.lat - 28.6) < 1.0);
      if (DelhiNodes.length >= 2) {
        const latlngs = DelhiNodes.map(n => [n.lat, n.lng] as [number, number]);
        L.polyline(latlngs, {
          color: '#ea580c',
          weight: 2.5,
          opacity: 0.8,
          dashArray: '6, 8'
        }).addTo(map);
      }
    }

  }, [locations, activeCategory, showCoLocationRadius, showMovementVectors, tileStyle, selectedLocationId, selectedNode]);

  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([28.6139, 77.2090], 11);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#e5dfd3] bg-[#f8f6f0] shadow-sm">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2 p-2 bg-white/95 border border-[#e0d8c8] rounded-xl backdrop-blur-md shadow-md text-xs">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#f0ebd9] border border-[#e2dacd] rounded-lg text-slate-700 font-mono text-[11px]">
          <Layers className="w-3.5 h-3.5 text-saffron-600" />
          <span>Category:</span>
        </div>

        {['ALL', 'PERSON', 'SAFEHOUSE', 'CELL_TOWER', 'VEHICLE'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
              activeCategory === cat
                ? 'bg-saffron-600/15 text-saffron-700 border border-saffron-600/50 font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-[#d8cfbe]'
            }`}
          >
            {cat}
          </button>
        ))}

        <div className="h-4 w-px bg-[#e5dfd3] mx-1" />

        <button
          onClick={() => setShowCoLocationRadius(!showCoLocationRadius)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all ${
            showCoLocationRadius
              ? 'bg-purple-100 border-purple-300 text-purple-800 font-bold'
              : 'bg-white border-[#d8cfbe] text-slate-600'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-purple-600" />
          <span>Radius</span>
        </button>

        <button
          onClick={() => setShowMovementVectors(!showMovementVectors)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all ${
            showMovementVectors
              ? 'bg-saffron-600/15 border-saffron-600/40 text-saffron-700 font-bold'
              : 'bg-white border-[#d8cfbe] text-slate-600'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-saffron-600" />
          <span>Vectors</span>
        </button>

        <button
          onClick={() => setTileStyle(tileStyle === 'VOYAGER' ? 'OPENSTREETMAP' : 'VOYAGER')}
          className="px-2.5 py-1 bg-white border border-[#d8cfbe] hover:border-slate-400 text-slate-800 rounded-lg font-mono text-[11px] transition-all shadow-xs"
        >
          Tile: <strong className="text-saffron-700">{tileStyle}</strong>
        </button>

        <button
          onClick={handleRecenter}
          className="p-1 bg-white hover:bg-[#f5f0e6] border border-[#d8cfbe] text-slate-700 rounded-lg transition-all shadow-xs"
          title="Recenter Map"
        >
          <RefreshCw className="w-3.5 h-3.5 text-saffron-600" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[400] p-3 bg-white/95 border border-[#e0d8c8] rounded-xl backdrop-blur-md shadow-md text-xs space-y-1.5 min-w-[170px]">
        <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-saffron-600" />
          Risk Indicators
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            Critical Target
          </span>
          <span className="font-mono text-[10px] text-rose-700 font-bold">&gt; 0.90</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            High Suspicion
          </span>
          <span className="font-mono text-[10px] text-orange-700 font-bold">0.75-0.89</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Medium Track
          </span>
          <span className="font-mono text-[10px] text-blue-700 font-bold">&lt; 0.75</span>
        </div>
      </div>

      {/* Map Element */}
      <div ref={mapRef} style={{ height, width: '100%' }} className="z-10" />

      {/* Node Detail Drawer overlay when a node is selected */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-[400] p-4 bg-white/95 border border-saffron-600/40 rounded-2xl backdrop-blur-xl shadow-xl max-w-sm w-full space-y-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-saffron-600" />
              <h4 className="text-sm font-bold text-slate-900">{selectedNode.name}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-500 hover:text-slate-800 text-xs font-mono px-1.5 py-0.5 rounded bg-[#f0ebd9] border border-[#e2dacd]"
            >
              ✕
            </button>
          </div>

          <div className="text-xs text-slate-700 leading-snug">{selectedNode.details}</div>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2 bg-[#fcfcf9] border border-[#e5dfd3] rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Risk Level</span>
              <span className="font-bold text-rose-600">{selectedNode.risk_level} ({selectedNode.risk_score})</span>
            </div>
            <div className="p-2 bg-[#fcfcf9] border border-[#e5dfd3] rounded-lg">
              <span className="text-slate-500 block text-[10px] uppercase">Co-Locations</span>
              <span className="font-bold text-saffron-700">{selectedNode.co_location_count || 0} Events</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
