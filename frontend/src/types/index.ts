export type EntityType = 
  | 'PERSON' 
  | 'ORGANIZATION' 
  | 'LOCATION' 
  | 'VEHICLE' 
  | 'PHONE' 
  | 'ACCOUNT' 
  | 'CASE' 
  | 'EVENT'
  | 'DOCUMENT';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  risk_level: RiskLevel;
  risk_score: number;
  attributes: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
  connection_count?: number;
  is_bridge_node?: boolean;
  betweenness_centrality?: number;
}

export type RelationshipType = 
  | 'KNOWS' 
  | 'CALLS'
  | 'MESSAGED'
  | 'TRANSFERRED_TO' 
  | 'OWNS' 
  | 'VISITED' 
  | 'WORKS_FOR' 
  | 'ASSOCIATED_WITH' 
  | 'PARTICIPATED_IN' 
  | 'LOCATED_AT'
  | 'USES'
  | 'CONNECTED_TO'
  | 'MENTIONED_IN';

export interface Relationship {
  id: string;
  source_id: string;
  target_id: string;
  type: RelationshipType;
  confidence: number;
  weight: number;
  attributes: Record<string, any>;
  start_time?: string;
  end_time?: string;
  timestamp?: string;
  source_type?: string;
  evidence_id?: string;
  extraction_method?: string;
  source_name?: string;
  target_name?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: EntityType;
  risk_level: RiskLevel;
  risk_score: number;
  properties: Record<string, any>;
  is_bridge_node?: boolean;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  confidence: number;
  weight: number;
  properties: Record<string, any>;
  timestamp?: string;
  evidence_id?: string;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  total_nodes: number;
  total_edges: number;
}

export interface ShortestPathResult {
  found: boolean;
  path_nodes: NetworkNode[];
  path_edges: NetworkEdge[];
  distance: number;
}

export interface EvidenceItem {
  id: string;
  title: string;
  source_type: string;
  source_id: string;
  content_snippet: string;
  confidence: number;
  timestamp: string;
  extraction_method: string;
  linked_entity_ids: string[];
  linked_relationship_ids: string[];
}

export interface ResolutionCandidate {
  id: string;
  entity_id_1: string;
  entity_id_2: string;
  name_1: string;
  name_2: string;
  type: EntityType;
  similarity_score: number;
  matching_attributes: string[];
  status: 'PENDING_REVIEW' | 'CONFIRMED_MERGE' | 'DISMISSED';
  explanation: string;
}

export interface WhatIfResult {
  simulation_id: string;
  removed_nodes: string[];
  metrics: {
    total_nodes_before: number;
    total_nodes_after: number;
    total_edges_before: number;
    total_edges_after: number;
    disconnected_clusters_count: number;
    impact_summary: string;
    affected_entity_ids: string[];
  };
}

export interface CopilotResponse {
  query: string;
  answer: string;
  confidence: number;
  reasoning: string[];
  supporting_evidence_ids: string[];
  supporting_entity_ids: string[];
  suggested_investigative_actions: string[];
}

export interface AuditLog {
  id: string;
  investigator_id: string;
  action_type: string;
  target_resource: string;
  details: Record<string, any>;
  timestamp: string;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'NEW' | 'UNDER_REVIEW' | 'DISMISSED' | 'RESOLVED';

export interface Alert {
  id: string;
  title: string;
  pattern_type: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  risk_score: number;
  related_entity_ids: string[];
  explanation: string;
  created_at: string;
  updated_at: string;
}

export type CasePriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CaseStatus = 'ACTIVE' | 'PENDING' | 'CLOSED' | 'ARCHIVED';

export interface Investigation {
  id: string;
  case_number: string;
  title: string;
  summary: string;
  lead_investigator: string;
  priority: CasePriority;
  status: CaseStatus;
  assigned_entity_ids: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  notes_count: number;
}

export type SourceType = 'STRUCTURED_LOGS' | 'UNSTRUCTURED_TEXT' | 'CALL_METADATA' | 'FINANCIAL_TRANSFERS' | 'ANONYMOUS_TIP';
export type SourceStatus = 'ACTIVE' | 'PROCESSING' | 'PAUSED' | 'ERROR';

export interface DataSource {
  id: string;
  name: string;
  source_type: SourceType;
  description: string;
  confidence_score: number;
  status: SourceStatus;
  records_ingested: number;
  last_ingested_at: string;
}

export interface SystemHealth {
  status: string;
  app_name: string;
  environment: string;
  timestamp: string;
  graph_driver: string;
  database_status: {
    postgres: string;
    neo4j: string;
  };
}
