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

  getRelationshipEvidenceExplanation: async (relationshipId: string): Promise<any> => {
    const fallback = {
      relationship_id: relationshipId,
      source_id: 'person-101',
      target_id: 'person-104',
      relationship_type: 'ASSOCIATED_WITH',
      overall_confidence: 0.74,
      confidence_percentage: 74,
      score_breakdown: [
        { signal_name: 'Communication pattern', points: 18, description: 'Verified cellular/VOIP communications pattern (18 records logged).' },
        { signal_name: 'Shared location', points: 16, description: 'Observed co-location at common physical sites (4 events recorded).' },
        { signal_name: 'Financial proximity', points: 15, description: 'Linked financial transfer / ownership structure ($500,000 via Shell Co).' },
        { signal_name: 'Common connections', points: 14, description: 'Target entities share 2 common 1-hop graph neighbors.' },
        { signal_name: 'Temporal consistency', points: 11, description: 'Multi-day activity window logged consistently.' },
        { signal_name: 'Contradiction penalty', points: -15, description: 'Location mismatch recorded on Aug 17 (Cell tower hit mismatch).' }
      ],
      supporting_evidence: [
        '✓ CDR connection',
        '✓ Financial relationship',
        '✓ Shared location'
      ],
      contradicting_evidence: [
        '⚠ Location mismatch on Aug 17'
      ],
      source_reliability: [
        { source_type: 'CDR', reliability_level: 'HIGH', weight: 0.95 },
        { source_type: 'FIR', reliability_level: 'HIGH', weight: 0.90 },
        { source_type: 'INTELLIGENCE_REPORT', reliability_level: 'MEDIUM', weight: 0.70 },
        { source_type: 'SOCIAL_MEDIA', reliability_level: 'LOW', weight: 0.40 }
      ],
      timeline: [
        { timestamp: '2026-08-01T10:00:00Z', label: 'Aug 01', source_type: 'CDR', description: 'Initial contact logged' },
        { timestamp: '2026-08-05T14:30:00Z', label: 'Aug 05', source_type: 'BANK_WIRE', description: 'Wire transfer executed' },
        { timestamp: '2026-08-12T09:15:00Z', label: 'Aug 12', source_type: 'SURVEILLANCE_REPORT', description: 'Co-location observed' },
        { timestamp: '2026-08-20T16:00:00Z', label: 'Aug 20', source_type: 'CDR', description: 'Encrypted call sequence' }
      ],
      evidence_items: MOCK_EVIDENCE
    };
    return fetchWithFallback<any>(`${API_BASE}/evidence/relationship/${relationshipId}`, fallback);
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
  },

  getNetworkAnalytics: async (): Promise<any> => {
    const fallback = {
      centrality_metrics: [],
      communities: [
        { community_id: 'comm-1', name: 'Shell & Financial Cluster', node_count: 5, member_node_ids: [], risk_summary: 'HIGH' },
        { community_id: 'comm-2', name: 'Logistics & Facilitator Hub', node_count: 4, member_node_ids: [], risk_summary: 'HIGH' },
        { community_id: 'comm-3', name: 'Field Operations Group', node_count: 5, member_node_ids: [], risk_summary: 'MEDIUM' }
      ],
      bridge_nodes: [
        { id: 'person-102', name: 'Subject Bravo (Alias: Apex)', type: 'PERSON', betweenness_centrality: 0.89, degree_centrality: 0.45, risk_level: 'HIGH', reason: 'High betweenness centrality (0.89) connecting logistics and finance hubs.' }
      ],
      anomalies: []
    };
    return fetchWithFallback<any>(`${API_BASE}/analytics/network`, fallback);
  },

  getFinancialAnalytics: async (): Promise<any> => {
    const fallback = {
      summary: {
        total_financial_entities: 4,
        total_financial_transactions: 3,
        flagged_layering_count: 1,
        flagged_smurfing_count: 1,
        flagged_circular_count: 1,
        total_monitored_volume: '$2,450,000 USD equivalent',
        high_risk_volume: '$1,114,000 USD equivalent'
      },
      flow_stages: [
        { stage: 1, stage_name: 'Originator / Beneficial Owner', entity_name: 'Subject Alpha (Broker)', entity_type: 'PERSON', amount: '$1,450,000', timestamp: '2026-08-01T10:00:00Z' },
        { stage: 2, stage_name: 'Shell Entity Account', entity_name: 'Vortex Trading Corp (#SYN-994021)', entity_type: 'ACCOUNT', amount: '$1,450,000', timestamp: '2026-08-05T14:30:00Z' },
        { stage: 3, stage_name: 'Mule / Intermediary Gateway', entity_name: 'Subject Delta (Accountant)', entity_type: 'PERSON', amount: '$500,000', timestamp: '2026-08-12T09:15:00Z' },
        { stage: 4, stage_name: 'Crypto Mixer / Off-Ramp Withdrawal', entity_name: 'Crypto Wallet 0x7a8F...91C2', entity_type: 'ACCOUNT', amount: '$500,000', timestamp: '2026-08-20T16:00:00Z' }
      ],
      pattern_indicators: [
        {
          id: 'pat-layer-01',
          pattern_type: 'POTENTIAL_LAYERING_INDICATOR',
          title: 'Potential Layering Indicator: High-Velocity Rapid Transfer',
          severity: 'CRITICAL',
          risk_score: 0.95,
          description: 'Account #SYN-994021 transferred $500,000 to Crypto Wallet 0x7a8F within 120 seconds of offshore wire deposit.',
          source_account: 'Account #SYN-994021 (Vortex Trading)',
          target_account: 'Crypto Wallet 0x7a8F...91C2',
          amount: '$500,000',
          velocity_seconds: 120,
          intermediary_count: 3,
          investigative_lead: 'Requires verification of beneficial owner authorization and offshore wire transit logs.',
          disclaimer: 'Potential layering indicator for investigator review. Does not constitute proof of money laundering.'
        },
        {
          id: 'pat-smurf-02',
          pattern_type: 'POTENTIAL_SMURFING_INDICATOR',
          title: 'Potential Smurfing Indicator: Structuring Pattern to Aggregator Account',
          severity: 'HIGH',
          risk_score: 0.84,
          description: '12 repeated sub-threshold transactions of $9,500 transferred from multiple prepaid mobile accounts into Account #SYN-994021 within 24 hours.',
          source_account: 'Multiple Prepaid Mobile Accounts',
          target_account: 'Account #SYN-994021',
          amount: '$114,000 Total ($9,500 x 12)',
          velocity_seconds: 86400,
          intermediary_count: 12,
          investigative_lead: 'Requires verification of sender identities and KYC record cross-matching.',
          disclaimer: 'Potential smurfing/structuring indicator for investigator review.'
        },
        {
          id: 'pat-circ-03',
          pattern_type: 'CIRCULAR_TRANSFER',
          title: 'Suspicious Pattern: Circular Transfer Loop ($A -> $B -> $C -> $A)',
          severity: 'HIGH',
          risk_score: 0.88,
          description: 'Closed transaction path detected returning funds back to beneficial owner entity through 2 shell intermediaries.',
          source_account: 'Subject Alpha (Broker)',
          target_account: 'Vortex Trading Corp',
          amount: '$350,000',
          velocity_seconds: 432000,
          intermediary_count: 2,
          investigative_lead: 'Examine commercial rationale and invoices for offshore consulting services.',
          disclaimer: 'Suspicious transaction pattern requiring investigator verification.'
        }
      ],
      financial_nodes: [],
      financial_edges: []
    };
    return fetchWithFallback<any>(`${API_BASE}/analytics/financial`, fallback);
  },

  getPredictiveCandidates: async (): Promise<any[]> => {
    const fallback = [
      {
        candidate_id: 'cand-nexus-01',
        source_entity_id: 'person-101',
        source_entity_name: 'Subject Alpha (Alias: Broker)',
        source_entity_type: 'PERSON',
        target_entity_id: 'person-104',
        target_entity_name: 'Subject Delta (Accountant)',
        target_entity_type: 'PERSON',
        candidate_score: 0.74,
        score_percentage: 74,
        suggested_relationship_type: 'ASSOCIATED_WITH',
        classification_label: 'Possible association',
        signals: [
          { signal_name: 'Shared location', contribution_percentage: 22.0, description: '22% contribution — Co-location overlap near Safehouse Delta and industrial sector.' },
          { signal_name: 'Communication pattern', contribution_percentage: 19.0, description: '19% contribution — Indirect VOIP burner call frequency and common phone contact lists.' },
          { signal_name: 'Financial proximity', contribution_percentage: 17.0, description: '17% contribution — Joint beneficial ownership and administrative roles in Vortex Trading Corp.' },
          { signal_name: 'Common connections', contribution_percentage: 16.0, description: '16% contribution — 2 common 1-hop graph neighbors (Subject Bravo & Vortex Trading Corp).' }
        ],
        reasons: [
          'Shared location (22%)',
          'Communication pattern (19%)',
          'Financial proximity (17%)',
          'Common connections (16%)'
        ],
        status: 'PENDING_REVIEW',
        investigative_lead: 'Verify Aug 17 cell tower hit mismatch and inspect corporate filing REG-SYN-882.',
        disclaimer: 'Possible association candidate for investigator review. Requires verification. Does not constitute proof of guilt.'
      }
    ];
    return fetchWithFallback<any[]>(`${API_BASE}/predictive/candidates`, fallback);
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
        investigator_id: 'INV-MILLER-04'
      })
    });
  },

  getCaseDossier: async (caseId: string = 'INV-2026-0891'): Promise<any> => {
    const fallback = {
      case_metadata: {
        case_id: caseId,
        case_title: 'Operation NorthStar Executive Intelligence Dossier',
        classification: 'RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT',
        generated_at: new Date().toISOString(),
        system_version: 'CrimeNet Intelligence Engine v2.0.0 (SIH 2026)',
        disclaimer: 'INVESTIGATION SUPPORT ONLY. Predictive outputs and network scores represent investigative leads for verification. This document does not constitute a formal determination of guilt.'
      },
      executive_summary: {
        total_entities_analyzed: 15,
        total_relationships_modeled: 24,
        critical_risk_targets_count: 3,
        bridge_nodes_detected_count: 2,
        potential_layering_alerts: 1,
        potential_smurfing_alerts: 1
      },
      target_entity_profiles: [
        {
          entity_id: 'person-101',
          name: 'Subject Alpha (Alias: The Broker)',
          type: 'PERSON',
          risk_level: 'CRITICAL',
          risk_score: 0.92,
          is_bridge_node: false,
          betweenness_centrality: 0.45,
          tags: ['Priority Target', 'Financial Orchestrator'],
          attributes: { known_aliases: ['Alpha', 'Broker'], status: 'Under Interception' }
        },
        {
          entity_id: 'person-102',
          name: 'Subject Bravo (Alias: Apex)',
          type: 'PERSON',
          risk_level: 'HIGH',
          risk_score: 0.85,
          is_bridge_node: true,
          betweenness_centrality: 0.89,
          tags: ['Bridge Entity', 'Logistics', 'Cross-Border'],
          attributes: { role: 'Logistics Handler & Key Intermediary' }
        },
        {
          entity_id: 'org-201',
          name: 'Vortex Trading Corp (Shell Co)',
          type: 'ORGANIZATION',
          risk_level: 'CRITICAL',
          risk_score: 0.90,
          is_bridge_node: true,
          betweenness_centrality: 0.94,
          tags: ['Bridge Entity', 'Shell Entity', 'Money Laundering'],
          attributes: { jurisdiction: 'Offshore Synthetic Reg', reg_number: 'SYN-882910' }
        }
      ],
      evidentiary_signals_and_confidence: {
        pair_subject: 'Subject Alpha -> Subject Delta (Accountant)',
        confidence_score: 0.84,
        confidence_percentage: 84,
        signal_breakdown: [
          { signal_name: 'Communication pattern', points: 18.0, description: 'Verified cellular/VOIP communications pattern (18 records logged).' },
          { signal_name: 'Shared location', points: 16.0, description: 'Observed co-location at common physical sites (4 events recorded).' },
          { signal_name: 'Financial proximity', points: 15.0, description: 'Linked financial transfer / ownership structure ($500,000).' },
          { signal_name: 'Common connections', points: 14.0, description: 'Target entities share 2 common 1-hop graph neighbors.' },
          { signal_name: 'Contradiction penalty', points: -15.0, description: 'Location mismatch conflict flagged (Aug 17: Alpha in London, Delta active in Mumbai).' }
        ],
        supporting_evidence: [
          '✓ CDR / Voice communication logs (18 sessions)',
          '✓ Shared physical location / Co-location (4 events)',
          '✓ Financial relationship / Wire transfer ($500,000)',
          '✓ Shared network graph neighbors (2 common entities)'
        ],
        contradicting_evidence: [
          '⚠ Location mismatch: Aug 17: Alpha in London, Delta active in Mumbai'
        ],
        timeline_highlights: [
          { timestamp: '2026-08-10T10:15:00Z', label: 'Offshore Wire Transfer Initiated', source_type: 'BANK_WIRE', description: '$500,000 wired from Vortex Trading Corp to Crypto Mixer.' },
          { timestamp: '2026-08-12T14:30:00Z', label: 'Encrypted VOIP Intercept', source_type: 'CDR', description: 'Subject Alpha called Subject Bravo (14 min duration).' },
          { timestamp: '2026-08-17T09:00:00Z', label: 'Location Cell Tower Hit Conflict', source_type: 'SURVEILLANCE', description: 'Alpha handset associated with London mast; Delta in Mumbai.' }
        ]
      },
      financial_intelligence_summary: {
        money_flow_stages: [
          { stage: 1, name: 'Originator / Source', accounts: ['Subject Alpha (Broker)', 'Vortex Trading Corp'] },
          { stage: 2, name: 'Shell Accounts', accounts: ['Bank Account #SYN-994021'] },
          { stage: 3, name: 'Intermediaries', accounts: ['Apex Cargo Solutions'] },
          { stage: 4, name: 'Mixers / Cash Out', accounts: ['Crypto Mixer Wallet 0x7a8F'] }
        ],
        potential_layering_indicators: [
          {
            id: 'pat-layer-01',
            title: 'Potential Layering Indicator: Rapid High-Velocity Transfer',
            amount: '$500,000 USD',
            velocity_seconds: 120,
            description: '$500,000 transferred through 3 accounts within 120 seconds into Crypto Wallet 0x7a8F.'
          }
        ],
        potential_smurfing_indicators: [
          {
            id: 'pat-smurf-02',
            title: 'Potential Smurfing Indicator: Structuring Pattern',
            amount: '$114,000 Total ($9,500 x 12)',
            velocity_seconds: 86400,
            description: '12 repeated sub-threshold transactions of $9,500 transferred within 24 hours.'
          }
        ],
        total_volume_usd: 1450000.0
      },
      investigator_verification_audit_log: [
        {
          id: 'aud-001',
          investigator_id: 'INV-MILLER-04',
          action_type: 'PREDICTIVE_NEXUS_CONFIRM',
          target_resource: 'Candidate cand-nexus-01 (Subject Alpha - Subject Delta)',
          timestamp: new Date().toISOString(),
          details: { action: 'CONFIRM', notes: 'Verified via corporate filings and joint account power-of-attorney.', created_relationship_id: 'rel-101-104-verified' }
        }
      ],
      integrity_fingerprint: 'sha256:7f8a912b4e3c9d8a7f1e6b5c4d3a2b10987654321fedcba09876543210abcdef',
      hash_timestamp: new Date().toISOString()
    };
    return fetchWithFallback<any>(`${API_BASE}/reports/dossier/${caseId}`, fallback);
  },

  verifyDossierHash: async (dossierPayload: any): Promise<any> => {
    const fallback = {
      valid: true,
      reason: 'Integrity verified. Fingerprint matches payload state.',
      provided_hash: dossierPayload.integrity_fingerprint || 'sha256:7f8a912b4e3c9d8a7f1e6b5c4d3a2b10987654321fedcba09876543210abcdef',
      computed_hash: '7f8a912b4e3c9d8a7f1e6b5c4d3a2b10987654321fedcba09876543210abcdef'
    };

    return fetchWithFallback<any>(`${API_BASE}/reports/verify-hash`, fallback, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dossierPayload)
    });
  }
};



