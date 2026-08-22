from typing import List, Dict, Any, Optional
from collections import deque
from app.graph.abstract import AbstractGraphDriver
from data.synthetic.seed_data import get_synthetic_dataset

class MockInMemoryGraphDriver(AbstractGraphDriver):
    def __init__(self):
        dataset = get_synthetic_dataset()
        self.nodes: Dict[str, Dict[str, Any]] = {n["id"]: n for n in dataset["nodes"]}
        self.edges: Dict[str, Dict[str, Any]] = {e["id"]: e for e in dataset["relationships"]}

    def get_network_graph(self, entity_types: Optional[List[str]] = None, min_risk: float = 0.0) -> Dict[str, Any]:
        filtered_nodes = []
        filtered_node_ids = set()

        for node_id, node in self.nodes.items():
            if entity_types and node["type"] not in entity_types:
                continue
            if node["risk_score"] < min_risk:
                continue
            filtered_nodes.append(node)
            filtered_node_ids.add(node_id)

        filtered_edges = []
        for edge_id, edge in self.edges.items():
            if edge["source_id"] in filtered_node_ids and edge["target_id"] in filtered_node_ids:
                filtered_edges.append(edge)

        return {
            "nodes": filtered_nodes,
            "edges": filtered_edges,
            "total_nodes": len(filtered_nodes),
            "total_edges": len(filtered_edges),
        }

    def get_entity_by_id(self, entity_id: str) -> Optional[Dict[str, Any]]:
        node = self.nodes.get(entity_id)
        if not node:
            return None
        # Count connections
        conn_count = sum(1 for e in self.edges.values() if e["source_id"] == entity_id or e["target_id"] == entity_id)
        node_copy = dict(node)
        node_copy["connection_count"] = conn_count
        return node_copy

    def get_entity_neighbors(self, entity_id: str, depth: int = 1) -> Dict[str, Any]:
        if entity_id not in self.nodes:
            return {"nodes": [], "edges": [], "total_nodes": 0, "total_edges": 0}

        visited_nodes = {entity_id}
        queue = deque([(entity_id, 0)])

        matching_edges = set()

        while queue:
            curr_id, curr_depth = queue.popleft()
            if curr_depth >= depth:
                continue

            for edge_id, edge in self.edges.items():
                nbr_id = None
                if edge["source_id"] == curr_id:
                    nbr_id = edge["target_id"]
                elif edge["target_id"] == curr_id:
                    nbr_id = edge["source_id"]

                if nbr_id:
                    matching_edges.add(edge_id)
                    if nbr_id not in visited_nodes:
                        visited_nodes.add(nbr_id)
                        queue.append((nbr_id, curr_depth + 1))

        sub_nodes = [self.nodes[nid] for nid in visited_nodes if nid in self.nodes]
        sub_edges = [self.edges[eid] for eid in matching_edges if eid in self.edges]

        return {
            "nodes": sub_nodes,
            "edges": sub_edges,
            "total_nodes": len(sub_nodes),
            "total_edges": len(sub_edges),
        }

    def find_shortest_path(self, source_id: str, target_id: str) -> Dict[str, Any]:
        if source_id not in self.nodes or target_id not in self.nodes:
            return {"found": False, "path_nodes": [], "path_edges": [], "distance": -1}

        if source_id == target_id:
            return {
                "found": True,
                "path_nodes": [self.nodes[source_id]],
                "path_edges": [],
                "distance": 0
            }

        # BFS for unweighted shortest path
        queue = deque([(source_id, [source_id], [])])
        visited = {source_id}

        while queue:
            curr_id, path_n, path_e = queue.popleft()

            if curr_id == target_id:
                path_nodes_data = [self.nodes[nid] for nid in path_n]
                path_edges_data = [self.edges[eid] for eid in path_e]
                return {
                    "found": True,
                    "path_nodes": path_nodes_data,
                    "path_edges": path_edges_data,
                    "distance": len(path_edges_data)
                }

            for edge_id, edge in self.edges.items():
                nbr_id = None
                if edge["source_id"] == curr_id:
                    nbr_id = edge["target_id"]
                elif edge["target_id"] == curr_id:
                    nbr_id = edge["source_id"]

                if nbr_id and nbr_id not in visited:
                    visited.add(nbr_id)
                    queue.append((nbr_id, path_n + [nbr_id], path_e + [edge_id]))

        return {"found": False, "path_nodes": [], "path_edges": [], "distance": -1}

    def add_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        self.nodes[node_data["id"]] = node_data
        return node_data

    def add_edge(self, edge_data: Dict[str, Any]) -> Dict[str, Any]:
        self.edges[edge_data["id"]] = edge_data
        return edge_data
