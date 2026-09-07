from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class AbstractGraphDriver(ABC):
    @abstractmethod
    def get_network_graph(
        self,
        entity_types: Optional[List[str]] = None,
        min_risk: float = 0.0,
        case_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Fetch network graph (nodes and edges) with optional entity_type, min_risk, and case_id filtering."""
        pass

    @abstractmethod
    def get_entity_by_id(self, entity_id: str, case_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Fetch a specific node by ID, optionally verifying case association."""
        pass

    @abstractmethod
    def get_entity_neighbors(self, entity_id: str, depth: int = 1, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Fetch 1-hop or N-hop subgraph around a target entity scoped by case_id."""
        pass

    @abstractmethod
    def find_shortest_path(self, source_id: str, target_id: str, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Compute shortest connection path between two entities scoped by case_id."""
        pass

    @abstractmethod
    def add_node(self, node_data: Dict[str, Any], case_id: Optional[str] = None) -> Dict[str, Any]:
        """Add a new node to the graph."""
        pass

    @abstractmethod
    def upsert_node(self, node_data: Dict[str, Any], case_id: Optional[str] = None) -> Dict[str, Any]:
        """Upsert (insert or merge) an entity node with deduplication, metadata merging, and case scoping."""
        pass

    @abstractmethod
    def add_edge(self, edge_data: Dict[str, Any], case_id: Optional[str] = None) -> Dict[str, Any]:
        """Add a new relationship edge to the graph."""
        pass

    @abstractmethod
    def upsert_edge(self, edge_data: Dict[str, Any], case_id: Optional[str] = None) -> Dict[str, Any]:
        """Upsert (insert or merge) a relationship edge with deduplication, metadata merging, and case scoping."""
        pass
