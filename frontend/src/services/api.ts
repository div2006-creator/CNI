import { 
  Entity, 
  Relationship, 
  NetworkGraphData, 
  ShortestPathResult, 
  Alert, 
  Investigation, 
  DataSource, 
  SystemHealth,
  EvidenceItem,
  ResolutionCandidate,
  WhatIfResult,
  CopilotResponse,
  AuditLog
} from '../types';

import { 
  MOCK_ENTITIES, 
  MOCK_RELATIONSHIPS, 
  MOCK_GRAPH_DATA, 
  MOCK_ALERTS, 
  MOCK_INVESTIGATIONS, 
  MOCK_DATA_SOURCES,
  MOCK_EVIDENCE,
  MOCK_RESOLUTIONS,
  MOCK_AUDITS
} from '../mock/mockData';

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
const API_BASE = configuredApiUrl ? `${configuredApiUrl}/api` : '/api';

async function fetchWithFallback<T>(url: string, fallbackData: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API Client] Endpoint '${url}' unavailable. Falling back to synthetic mock payload.`, err);
    return fallbackData;
  }
}

export const apiService = {
  createEntity: async (entity: Omit<Entity, 'id' | 'created_at' | 'updated_at' | 'connection_count' | 'is_bridge_node' | 'betweenness_centrality'>): Promise<Entity> => {
    const fallback: Entity = {
      ...entity,
      id: `entity-local-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      connection_count: 0,
      is_bridge_node: false,
      betweenness_centrality: 0
    };
    return fetchWithFallback<Entity>(`${API_BASE}/entities`, fallback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entity)
    });
  },

  getHealth: async (): Promise<SystemHealth> => {
    return fetchWithFallback<SystemHealth>(`${API_BASE}/health`, {
      status: 'HEALTHY (MOCK MODE)',
      app_name: 'CNI Intelligence Platform',
      environment: 'development',
      timestamp: new Date().toISOString(),
      graph_driver: 'MockInMemoryGraphDriver',
      database_status: { postgres: 'MOCK_STANDBY', neo4j: 'MOCK_ACTIVE' }
    });
  },

  getEntities: async (type?: string, minRisk: number = 0.0, search?: string): Promise<Entity[]> => {
    let url = `${API_BASE}/entities?min_risk=${minRisk}`;
    if (type) url += `&type=${type}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    let fallback = MOCK_ENTITIES.filter(e => e.risk_score >= minRisk);
    if (type) fallback = fallback.filter(e => e.type === type);
    if (search) {
      const s = search.toLowerCase();
      fallback = fallback.filter(e => e.name.toLowerCase().includes(s) || e.tags.some(t => t.toLowerCase().includes(s)));
    }
    return fetchWithFallback<Entity[]>(url, fallback);
  },

  getEntityById: async (id: string): Promise<Entity | null> => {
    const fallback = MOCK_ENTITIES.find(e => e.id === id) || null;
    return fetchWithFallback<Entity | null>(`${API_BASE}/entities/${id}`, fallback);
  },

  getRelationships: async (sourceId?: string, targetId?: string): Promise<Relationship[]> => {
    let url = `${API_BASE}/relationships`;
    const params = new URLSearchParams();
    if (sourceId) params.append('source_id', sourceId);
    if (targetId) params.append('target_id', targetId);
    if (params.toString()) url += `?${params.toString()}`;

    let fallback = [...MOCK_RELATIONSHIPS];
    if (sourceId) fallback = fallback.filter(r => r.source_id === sourceId);
    if (targetId) fallback = fallback.filter(r => r.target_id === targetId);

    return fetchWithFallback<Relationship[]>(url, fallback);
  },

  getNetworkGraph: async (minRisk: number = 0.0, entityTypes?: string[]): Promise<NetworkGraphData> => {
    let url = `${API_BASE}/network?min_risk=${minRisk}`;
    if (entityTypes && entityTypes.length > 0) {
      entityTypes.forEach(t => url += `&entity_types=${t}`);
    }

    let filteredNodes = MOCK_GRAPH_DATA.nodes.filter(n => n.risk_score >= minRisk);
    if (entityTypes && entityTypes.length > 0) {
      filteredNodes = filteredNodes.filter(n => entityTypes.includes(n.type));
    }
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = MOCK_GRAPH_DATA.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));

    const fallback: NetworkGraphData = {
      nodes: filteredNodes,
      edges: filteredEdges,
      total_nodes: filteredNodes.length,
      total_edges: filteredEdges.length
    };

    return fetchWithFallback<NetworkGraphData>(url, fallback);
  },

  getTemporalGraph: async (startDate?: string, endDate?: string): Promise<NetworkGraphData> => {
    let url = `${API_BASE}/timeline`;
    if (startDate || endDate) {
      const p = new URLSearchParams();
      if (startDate) p.append('start_date', startDate);
      if (endDate) p.append('end_date', endDate);
      url += `?${p.toString()}`;
    }
    return fetchWithFallback<NetworkGraphData>(url, MOCK_GRAPH_DATA);
  },

  getShortestPath: async (sourceId: string, targetId: string): Promise<ShortestPathResult> => {
    const url = `${API_BASE}/network/shortest-path?source_id=${sourceId}&target_id=${targetId}`;
    const fallback: ShortestPathResult = {
      found: true,
      path_nodes: MOCK_GRAPH_DATA.nodes.filter(n => n.id === sourceId || n.id === targetId),
      path_edges: MOCK_GRAPH_DATA.edges.filter(e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId)),
      distance: 1
    };
    return fetchWithFallback<ShortestPathResult>(url, fallback);
  },

  getEvidenceList: async (): Promise<EvidenceItem[]> => {
    return fetchWithFallback<EvidenceItem[]>(`${API_BASE}/evidence`, MOCK_EVIDENCE);
  },

  getEvidenceById: async (id: string): Promise<EvidenceItem | null> => {
    const fallback = MOCK_EVIDENCE.find(e => e.id === id || e.source_id === id) || null;
    return fetchWithFallback<EvidenceItem | null>(`${API_BASE}/evidence/${id}`, fallback);
  },

  getResolutionCandidates: async (): Promise<ResolutionCandidate[]> => {
    return fetchWithFallback<ResolutionCandidate[]>(`${API_BASE}/resolution/candidates`, MOCK_RESOLUTIONS);
  },

  queryCopilot: async (query: string, caseId?: string): Promise<CopilotResponse> => {
    const fallback: CopilotResponse = {
      query,
      answer: "Analysis of graph topology indicates Subject Alpha connects to Subject Charlie via Subject Bravo (Alias: Apex), who acts as a critical bridge entity.",
      confidence: 0.94,
      reasoning: [
        "1-hop link: Subject Alpha (person-101) KNOWS Subject Bravo (person-102)",
        "2-hop link: Subject Bravo (person-102) ASSOCIATED_WITH Subject Charlie (person-103)",
        "Bridge entity identified: Subject Bravo (betweenness centrality = 0.89)"
      ],
      supporting_evidence_ids: ["ev-001", "ev-004"],
      supporting_entity_ids: ["person-101", "person-102", "person-103"],
      suggested_investigative_actions: [
        "Request CDR expansion for Burner #2",
        "Execute What-If simulation removing Subject Bravo"
      ]
    };

    return fetchWithFallback<CopilotResponse>(`${API_BASE}/copilot/query`, fallback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, case_id: caseId })
    });
  },

  runWhatIfSim: async (removedNodeIds: string[]): Promise<WhatIfResult> => {
    const fallback: WhatIfResult = {
      simulation_id: `sim-mock-${Date.now()}`,
      removed_nodes: removedNodeIds,
      metrics: {
        total_nodes_before: MOCK_GRAPH_DATA.nodes.length,
        total_nodes_after: MOCK_GRAPH_DATA.nodes.length - removedNodeIds.length,
        total_edges_before: MOCK_GRAPH_DATA.edges.length,
        total_edges_after: MOCK_GRAPH_DATA.edges.length - (removedNodeIds.length * 3),
        disconnected_clusters_count: 2,
        impact_summary: `Removal of ${removedNodeIds.length} bridge node(s) fragmented logistics clusters and disconnected Subject Alpha from field operatives.`,
        affected_entity_ids: MOCK_GRAPH_DATA.nodes.filter(n => !removedNodeIds.includes(n.id)).map(n => n.id)
      }
    };

    return fetchWithFallback<WhatIfResult>(`${API_BASE}/whatif/simulate`, fallback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removed_node_ids: removedNodeIds })
    });
  },

  getAuditTrail: async (): Promise<AuditLog[]> => {
    return fetchWithFallback<AuditLog[]>(`${API_BASE}/audit`, MOCK_AUDITS);
  },

  getAlerts: async (): Promise<Alert[]> => {
    return fetchWithFallback<Alert[]>(`${API_BASE}/alerts`, MOCK_ALERTS);
  },

  getInvestigations: async (): Promise<Investigation[]> => {
    return fetchWithFallback<Investigation[]>(`${API_BASE}/investigations`, MOCK_INVESTIGATIONS);
  },

  getDataSources: async (): Promise<DataSource[]> => {
    return fetchWithFallback<DataSource[]>(`${API_BASE}/data-sources`, MOCK_DATA_SOURCES);
  }
};
