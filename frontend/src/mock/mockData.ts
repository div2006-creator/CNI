import { 
  Entity, 
  Relationship, 
  Alert, 
  Investigation, 
  DataSource, 
  NetworkGraphData,
  EvidenceItem,
  ResolutionCandidate,
  AuditLog
} from '../types';

export const MOCK_ENTITIES: Entity[] = [];

export const MOCK_RELATIONSHIPS: Relationship[] = [];

export const MOCK_EVIDENCE: EvidenceItem[] = [];

export const MOCK_RESOLUTIONS: ResolutionCandidate[] = [];

export const MOCK_AUDITS: AuditLog[] = [];

export const MOCK_GRAPH_DATA: NetworkGraphData = {
  nodes: [],
  edges: [],
  total_nodes: 0,
  total_edges: 0,
};

export const MOCK_ALERTS: Alert[] = [];

export const MOCK_INVESTIGATIONS: Investigation[] = [];

export const MOCK_DATA_SOURCES: DataSource[] = [];
