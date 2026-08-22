import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Entity, 
  Relationship, 
  NetworkGraphData, 
  EvidenceItem, 
  EntityType, 
  RelationshipType, 
  ShortestPathResult 
} from '../types';
import { apiService } from '../services/api';

export interface FilterState {
  entityTypes: EntityType[];
  relationshipTypes: RelationshipType[];
  minConfidence: number;
  minRisk: number;
  startDate: string | null;
  endDate: string | null;
  networkDepth: number; // 1, 2, 3, 4
  requireEvidence: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  entityTypes: ['PERSON', 'ORGANIZATION', 'LOCATION', 'VEHICLE', 'PHONE', 'ACCOUNT', 'EVENT', 'CASE', 'DOCUMENT'],
  relationshipTypes: ['KNOWS', 'CALLS', 'MESSAGED', 'TRANSFERRED_TO', 'OWNS', 'VISITED', 'WORKS_FOR', 'ASSOCIATED_WITH', 'PARTICIPATED_IN', 'LOCATED_AT', 'USES', 'CONNECTED_TO', 'MENTIONED_IN'],
  minConfidence: 0.0,
  minRisk: 0.0,
  startDate: null,
  endDate: null,
  networkDepth: 2,
  requireEvidence: false
};

interface InvestigationContextType {
  selectedEntityId: string | null;
  selectedEntity: Entity | null;
  selectedRelationshipId: string | null;
  selectedRelationship: Relationship | null;
  selectedEvidenceId: string | null;
  selectedEvidence: EvidenceItem | null;
  selectedEventId: string | null;
  filterState: FilterState;
  
  // Connection Path
  sourceEntityId: string | null;
  targetEntityId: string | null;
  connectionPathResult: ShortestPathResult | null;
  pathLoading: boolean;

  // Datasets
  entities: Entity[];
  relationships: Relationship[];
  graphData: NetworkGraphData | null;
  evidenceItems: EvidenceItem[];
  loading: boolean;

  // Actions
  selectEntity: (id: string | null) => void;
  selectRelationship: (id: string | null) => void;
  selectEvidence: (id: string | null) => void;
  selectEvent: (id: string | null) => void;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  findConnectionPath: (sourceId: string, targetId: string) => Promise<void>;
  clearConnectionPath: () => void;
  refreshData: () => Promise<void>;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export const InvestigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);

  // Selected states
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>('person-101');
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>('rel-01');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>('ev-001');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Filters
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTERS);

  // Path finder states
  const [sourceEntityId, setSourceEntityId] = useState<string | null>('person-101');
  const [targetEntityId, setTargetEntityId] = useState<string | null>('account-302');
  const [connectionPathResult, setConnectionPathResult] = useState<ShortestPathResult | null>(null);
  const [pathLoading, setPathLoading] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [ents, rels, graph, evs] = await Promise.all([
        apiService.getEntities(),
        apiService.getRelationships(),
        apiService.getNetworkGraph(filterState.minRisk, filterState.entityTypes),
        apiService.getEvidenceList()
      ]);
      setEntities(ents);
      setRelationships(rels);
      setGraphData(graph);
      setEvidenceItems(evs);
    } catch (err) {
      console.error('Failed loading investigation data context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update derived selected objects when IDs change
  const selectedEntity = entities.find(e => e.id === selectedEntityId) || null;
  const selectedRelationship = relationships.find(r => r.id === selectedRelationshipId) || null;
  const selectedEvidence = evidenceItems.find(ev => ev.id === selectedEvidenceId || ev.source_id === selectedEvidenceId) || null;

  const selectEntity = (id: string | null) => {
    setSelectedEntityId(id);
    if (id) {
      // Automatically associate top relationship & evidence linked to entity
      const rel = relationships.find(r => r.source_id === id || r.target_id === id);
      if (rel) {
        setSelectedRelationshipId(rel.id);
        if (rel.evidence_id) setSelectedEvidenceId(rel.evidence_id);
      }
    }
  };

  const selectRelationship = (id: string | null) => {
    setSelectedRelationshipId(id);
    if (id) {
      const rel = relationships.find(r => r.id === id);
      if (rel && rel.evidence_id) {
        setSelectedEvidenceId(rel.evidence_id);
      }
    }
  };

  const selectEvidence = (id: string | null) => {
    setSelectedEvidenceId(id);
    if (id) {
      const ev = evidenceItems.find(e => e.id === id || e.source_id === id);
      if (ev && ev.linked_entity_ids.length > 0) {
        setSelectedEntityId(ev.linked_entity_ids[0]);
      }
    }
  };

  const selectEvent = (id: string | null) => {
    setSelectedEventId(id);
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilterState(DEFAULT_FILTERS);
  };

  const findConnectionPath = async (sourceId: string, targetId: string) => {
    setSourceEntityId(sourceId);
    setTargetEntityId(targetId);
    setPathLoading(true);
    try {
      const res = await apiService.getShortestPath(sourceId, targetId);
      setConnectionPathResult(res);
    } catch (err) {
      console.error('Connection path error:', err);
    } finally {
      setPathLoading(false);
    }
  };

  const clearConnectionPath = () => {
    setConnectionPathResult(null);
    setSourceEntityId(null);
    setTargetEntityId(null);
  };

  return (
    <InvestigationContext.Provider
      value={{
        selectedEntityId,
        selectedEntity,
        selectedRelationshipId,
        selectedRelationship,
        selectedEvidenceId,
        selectedEvidence,
        selectedEventId,
        filterState,
        sourceEntityId,
        targetEntityId,
        connectionPathResult,
        pathLoading,
        entities,
        relationships,
        graphData,
        evidenceItems,
        loading,
        selectEntity,
        selectRelationship,
        selectEvidence,
        selectEvent,
        updateFilters,
        resetFilters,
        findConnectionPath,
        clearConnectionPath,
        refreshData: loadAllData
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export const useInvestigation = () => {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
};
