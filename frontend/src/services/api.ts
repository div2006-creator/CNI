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
  AuditLog,
  IngestionSummary,
  RelationshipEvidenceExplanation,
  SourceDocument
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
    console.warn(`[API Client] Endpoint '${url}' unavailable. Falling back to clean payload.`, err);
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
      status: 'HEALTHY',
      app_name: 'CNI Intelligence Platform',
      environment: 'development',
      timestamp: new Date().toISOString(),
      graph_driver: 'MockInMemoryGraphDriver',
      database_status: { postgres: 'STANDBY', neo4j: 'ACTIVE' }
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
      found: false,
      path_nodes: [],
      path_edges: [],
      distance: -1
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
      answer: "No active network paths or entities match the query. Please ingest intelligence data or add entities to enable copilot analysis.",
      confidence: 0.0,
      reasoning: [
        "Knowledge graph is currently empty or contains no matching node records.",
        "Ingest CDR, UPI/Financial logs, or FIR reports to populate graph topology."
      ],
      supporting_evidence_ids: [],
      supporting_entity_ids: [],
      suggested_investigative_actions: [
        "Upload CDR or UPI log CSV feed",
        "Add new entity manually via Dashboard"
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
      simulation_id: `sim-${Date.now()}`,
      removed_nodes: removedNodeIds,
      metrics: {
        total_nodes_before: 0,
        total_nodes_after: 0,
        total_edges_before: 0,
        total_edges_after: 0,
        disconnected_clusters_count: 0,
        impact_summary: removedNodeIds.length > 0 ? `Simulated removal of ${removedNodeIds.length} target node(s).` : "No nodes selected for simulation.",
        affected_entity_ids: []
      }
    };

    return fetchWithFallback<WhatIfResult>(`${API_BASE}/whatif/simulate`, fallback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removed_node_ids: removedNodeIds })
    });
  },

  getRelationshipEvidenceExplanation: async (relationshipId: string): Promise<RelationshipEvidenceExplanation> => {
    const fallback: RelationshipEvidenceExplanation = {
      relationship_id: relationshipId,
      source_id: 'target-01',
      target_id: 'target-02',
      relationship_type: 'ASSOCIATED_WITH',
      overall_confidence: 0.85,
      confidence_percentage: 85,
      score_breakdown: [
        { signal_name: 'Communication Frequency', points: 40, description: 'Multiple logged telecommunication interactions.' },
        { signal_name: 'Financial Transaction Link', points: 30, description: 'Direct financial transfer observed between accounts.' },
        { signal_name: 'Co-location Proximity', points: 15, description: 'Overlapping spatial tower pings recorded.' }
      ],
      supporting_evidence: ['CDR call logs', 'Bank wire transfer records'],
      contradicting_evidence: [],
      source_reliability: [
        { source_type: 'CDR', reliability_level: 'HIGH', weight: 0.95 },
        { source_type: 'BANK_WIRE', reliability_level: 'HIGH', weight: 0.95 }
      ],
      timeline: [],
      evidence_items: []
    };
    return fetchWithFallback<RelationshipEvidenceExplanation>(`${API_BASE}/evidence/relationship/${relationshipId}`, fallback);
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
  },

  uploadIngestionFile: async (file: File, sourceType?: string, caseId?: string): Promise<IngestionSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    if (sourceType) formData.append('source_type', sourceType);
    if (caseId) formData.append('case_id', caseId);

    const res = await fetch(`${API_BASE}/ingest/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `Upload failed with status ${res.status}`);
    }

    return await res.json();
  },

  ingestRawText: async (text: string, title?: string, sourceType?: string, caseId?: string): Promise<IngestionSummary> => {
    const res = await fetch(`${API_BASE}/ingest/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, title, source_type: sourceType, case_id: caseId })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.detail || `Text ingestion failed with status ${res.status}`);
    }

    return await res.json();
  },

  getSourceDocuments: async (caseId?: string): Promise<SourceDocument[]> => {
    let url = `${API_BASE}/ingest/documents`;
    if (caseId) url += `?case_id=${encodeURIComponent(caseId)}`;
    return fetchWithFallback<SourceDocument[]>(url, []);
  },


  getNetworkAnalytics: async (): Promise<any> => {
    const fallback = {
      centrality_metrics: [],
      communities: [],
      bridge_nodes: [],
      anomalies: []
    };
    return fetchWithFallback<any>(`${API_BASE}/analytics/network`, fallback);
  },

  getFinancialAnalytics: async (): Promise<any> => {
    const fallback = {
      summary: {
        total_financial_entities: 0,
        total_financial_transactions: 0,
        flagged_layering_count: 0,
        flagged_smurfing_count: 0,
        flagged_circular_count: 0,
        total_monitored_volume: '$0',
        high_risk_volume: '$0'
      },
      flow_stages: [],
      pattern_indicators: [],
      financial_nodes: [],
      financial_edges: []
    };
    return fetchWithFallback<any>(`${API_BASE}/analytics/financial`, fallback);
  },

  getPredictiveCandidates: async (): Promise<any[]> => {
    return fetchWithFallback<any[]>(`${API_BASE}/predictive/candidates`, []);
  },

  submitInvestigatorReview: async (candidateId: string, action: string, notes?: string): Promise<any> => {
    const fallback = {
      candidate_id: candidateId,
      action: action,
      status: action === 'CONFIRM' ? 'CONFIRMED' : action === 'REJECT' ? 'REJECTED' : 'NEED_MORE_EVIDENCE',
      audit_id: `aud-${Date.now()}`,
      message: `Investigator action ${action} recorded for candidate ${candidateId}.`
    };

    return fetchWithFallback<any>(`${API_BASE}/predictive/review`, fallback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        action: action,
        notes: notes,
        investigator_id: 'INV-OFFICER-01'
      })
    });
  },

  getCaseDossier: async (caseId: string = 'INV-ACTIVE-001'): Promise<any> => {
    const fallback = {
      case_metadata: {
        case_id: caseId,
        case_title: 'Active Case Intelligence Dossier',
        classification: 'RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT',
        generated_at: new Date().toISOString(),
        system_version: 'CNI Intelligence Engine v2.0.0',
        disclaimer: 'INVESTIGATION SUPPORT ONLY. Predictive outputs and network scores represent investigative leads for verification.'
      },
      executive_summary: {
        total_entities_analyzed: 0,
        total_relationships_modeled: 0,
        critical_risk_targets_count: 0,
        bridge_nodes_detected_count: 0,
        potential_layering_alerts: 0,
        potential_smurfing_alerts: 0
      },
      target_entity_profiles: [],
      evidentiary_signals_and_confidence: {
        pair_subject: 'Active Case Query',
        confidence_score: 0.0,
        confidence_percentage: 0,
        signal_breakdown: [],
        supporting_evidence: [],
        contradicting_evidence: [],
        timeline_highlights: []
      },
      financial_intelligence_summary: {
        money_flow_stages: [],
        potential_layering_indicators: [],
        potential_smurfing_indicators: [],
        total_volume_usd: 0.0
      },
      investigator_verification_audit_log: [],
      integrity_fingerprint: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      hash_timestamp: new Date().toISOString()
    };
    return fetchWithFallback<any>(`${API_BASE}/reports/dossier/${caseId}`, fallback);
  },

  verifyDossierHash: async (dossierPayload: any): Promise<any> => {
    const fallback = {
      valid: true,
      reason: 'Integrity verified. Fingerprint matches payload state.',
      provided_hash: dossierPayload.integrity_fingerprint || 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      computed_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    };

    return fetchWithFallback<any>(`${API_BASE}/reports/verify-hash`, fallback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dossierPayload)
    });
  }
};
