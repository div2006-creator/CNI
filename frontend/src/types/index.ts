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
  centrality?: number;
  role?: string;
  aliases?: string[];
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
  reliability_level?: string;
}

export interface SignalContribution {
  signal_name: string;
  points: number;
  description: string;
}

export interface SourceReliabilityRating {
  source_type: string;
  reliability_level: 'HIGH' | 'MEDIUM' | 'LOW';
  weight: number;
}

export interface TimelineEvent {
  timestamp: string;
  label: string;
  source_type: string;
  description: string;
}

export interface RelationshipEvidenceExplanation {
  relationship_id: string;
  source_id: string;
  target_id: string;
  relationship_type: string;
  overall_confidence: number;
  confidence_percentage: number;
  score_breakdown: SignalContribution[];
  supporting_evidence: string[];
  contradicting_evidence: string[];
  source_reliability: SourceReliabilityRating[];
  timeline: TimelineEvent[];
  evidence_items: EvidenceItem[];
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
  classification_label?: string;
  reasoning: string[];
  supporting_evidence_ids: string[];
  supporting_entity_ids: string[];
  contradicting_evidence?: string[];
  recommended_action?: string;
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

export interface CentralityItem {
  id: string;
  name: string;
  type: string;
  degree_centrality: number;
  betweenness_centrality: number;
  is_bridge_node: boolean;
}

export interface CommunityItem {
  community_id: string;
  name: string;
  node_count: number;
  member_node_ids: string[];
  risk_summary: string;
}

export interface BridgeNodeItem {
  id: string;
  name: string;
  type: string;
  betweenness_centrality: number;
  degree_centrality: number;
  risk_level: string;
  reason: string;
}

export interface NetworkAnalyticsData {
  centrality_metrics: CentralityItem[];
  communities: CommunityItem[];
  bridge_nodes: BridgeNodeItem[];
  anomalies: any[];
}

export interface MoneyFlowStage {
  stage: number;
  stage_name: string;
  entity_name: string;
  entity_type: string;
  amount: string;
  timestamp: string;
}

export interface PatternIndicatorItem {
  id: string;
  pattern_type: string;
  title: string;
  severity: string;
  risk_score: number;
  description: string;
  source_account: string;
  target_account: string;
  amount: string;
  velocity_seconds: number;
  intermediary_count: number;
  investigative_lead: string;
  disclaimer: string;
}


export interface FinancialAnalyticsData {
  summary: Record<string, any>;
  flow_stages: MoneyFlowStage[];
  pattern_indicators: PatternIndicatorItem[];
  financial_nodes: any[];
  financial_edges: any[];
}

export interface LinkSignalContribution {
  signal_name: string;
  contribution_percentage: number;
  description: string;
}

export interface CandidateLinkPair {
  candidate_id: string;
  source_entity_id: string;
  source_entity_name: string;
  source_entity_type: string;
  target_entity_id: string;
  target_entity_name: string;
  target_entity_type: string;
  candidate_score: number;
  score_percentage: number;
  suggested_relationship_type: string;
  classification_label: string;
  signals: LinkSignalContribution[];
  reasons: string[];
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'NEED_MORE_EVIDENCE';
  investigative_lead: string;
  disclaimer: string;
}

export interface InvestigatorReviewResponse {
  candidate_id: string;
  action: string;
  status: string;
  audit_id: string;
  message: string;
  created_relationship_id?: string;
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

export interface IngestionSummary {
  status: string;
  filename: string;
  source_type: string;
  total_records_processed: number;
  entities_created_count: number;
  relationships_created_count: number;
  new_entities: Entity[];
  new_relationships: Relationship[];
  evidence_id: string;
  message: string;
  warnings: string[];
}

