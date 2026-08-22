from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class AbstractGraphDriver(ABC):
    @abstractmethod
    def get_network_graph(self, entity_types: Optional[List[str]] = None, min_risk: float = 0.0) -> Dict[str, Any]:
        """Fetch network graph (nodes and edges) with optional filtering."""
        pass

    @abstractmethod
    def get_entity_by_id(self, entity_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a specific node by ID."""
        pass

    @abstractmethod
    def get_entity_neighbors(self, entity_id: str, depth: int = 1) -> Dict[str, Any]:
        """Fetch 1-hop or N-hop subgraph around a target entity."""
        pass

    @abstractmethod
    def find_shortest_path(self, source_id: str, target_id: str) -> Dict[str, Any]:
        """Compute shortest connection path between two entities."""
        pass

    @abstractmethod
    def add_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new node to the graph."""
        pass

    @abstractmethod
    def add_edge(self, edge_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new relationship edge to the graph."""
        pass
