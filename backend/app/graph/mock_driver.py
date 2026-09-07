import datetime
from typing import List, Dict, Any, Optional
from collections import deque
from app.graph.abstract import AbstractGraphDriver
from app.utils.normalization import normalize_entity_identifier
from data.synthetic.seed_data import get_synthetic_dataset

class MockInMemoryGraphDriver(AbstractGraphDriver):
    def __init__(self):
        dataset = get_synthetic_dataset()
        self.nodes: Dict[str, Dict[str, Any]] = {n["id"]: dict(n) for n in dataset.get("nodes", [])}
        self.edges: Dict[str, Dict[str, Any]] = {e["id"]: dict(e) for e in dataset.get("relationships", [])}
        self.normalized_index: Dict[str, str] = {}

        for node_id, node in self.nodes.items():
            self._index_node(node)

    def _get_node_lookup_key(self, node: Dict[str, Any]) -> Optional[str]:
        ntype = (node.get("type") or "").upper()
        raw_val = node.get("identifier")
        if not raw_val and "attributes" in node and isinstance(node["attributes"], dict):
            raw_val = (
                node["attributes"].get("number") or
                node["attributes"].get("phone") or
                node["attributes"].get("upi_id") or
                node["attributes"].get("account_number") or
                node["attributes"].get("plate") or
                node["attributes"].get("reg_number")
            )
        if not raw_val:
            raw_val = node.get("name")

        if ntype and raw_val:
            norm_val = normalize_entity_identifier(ntype, str(raw_val))
            if norm_val:
                return f"{ntype}:{norm_val}"
        return None

    def _index_node(self, node: Dict[str, Any]):
        key = self._get_node_lookup_key(node)
        if key:
            self.normalized_index[key] = node["id"]

    def get_network_graph(self, entity_types: Optional[List[str]] = None, min_risk: float = 0.0) -> Dict[str, Any]:
        filtered_nodes = []
        filtered_node_ids = set()

        for node_id, node in self.nodes.items():
            if entity_types and node["type"] not in entity_types:
                continue
            if node.get("risk_score", 0.0) < min_risk:
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

    def upsert_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Upserts an entity node into memory graph. Normalizes identifiers, deduplicates,
        merges attributes and tags, and maintains multi-source provenance.
        """
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # 1. Normalize identifier & check existing match
        node_type = (node_data.get("type") or "UNKNOWN").upper()
        raw_identifier = node_data.get("identifier") or node_data.get("name") or node_data.get("id")
        norm_val = normalize_entity_identifier(node_type, str(raw_identifier)) if raw_identifier else ""
        
        lookup_key = f"{node_type}:{norm_val}" if norm_val else None
        
        existing_id = None
        if node_data.get("id") and node_data["id"] in self.nodes:
            existing_id = node_data["id"]
        elif lookup_key and lookup_key in self.normalized_index:
            existing_id = self.normalized_index[lookup_key]

        if existing_id:
            # UPDATE / MERGE existing node
            existing_node = self.nodes[existing_id]
            
            # Merge attributes
            existing_attrs = existing_node.get("attributes", {})
            new_attrs = node_data.get("attributes", {})
            existing_attrs.update(new_attrs)
            if norm_val:
                existing_attrs["normalized_identifier"] = norm_val
            existing_node["attributes"] = existing_attrs

            # Merge tags
            existing_tags = set(existing_node.get("tags", []))
            existing_tags.update(node_data.get("tags", []))
            existing_node["tags"] = list(existing_tags)

            # Multi-source provenance
            source_ids = set(existing_node.get("source_ids", []))
            if "source_id" in node_data and node_data["source_id"]:
                source_ids.add(node_data["source_id"])
            if "source_ids" in node_data:
                source_ids.update(node_data["source_ids"])
            existing_node["source_ids"] = list(source_ids)

            # Update risk score if higher
            if "risk_score" in node_data:
                existing_node["risk_score"] = max(existing_node.get("risk_score", 0.0), float(node_data["risk_score"]))
            if "risk_level" in node_data and node_data["risk_level"]:
                existing_node["risk_level"] = node_data["risk_level"]

            existing_node["updated_at"] = now
            return existing_node

        else:
            # INSERT new node
            new_node = dict(node_data)
            if "id" not in new_node or not new_node["id"]:
                import uuid
                new_node["id"] = f"{node_type.lower()}-{str(uuid.uuid4())[:8]}"

            if "attributes" not in new_node or not isinstance(new_node["attributes"], dict):
                new_node["attributes"] = {}
            if norm_val:
                new_node["attributes"]["normalized_identifier"] = norm_val

            if "tags" not in new_node:
                new_node["tags"] = []

            source_ids = set(new_node.get("source_ids", []))
            if "source_id" in new_node and new_node["source_id"]:
                source_ids.add(new_node["source_id"])
            new_node["source_ids"] = list(source_ids)

            new_node["created_at"] = new_node.get("created_at", now)
            new_node["updated_at"] = now

            self.nodes[new_node["id"]] = new_node
            if lookup_key:
                self.normalized_index[lookup_key] = new_node["id"]
            return new_node

    def upsert_edge(self, edge_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Upserts a relationship edge. Deduplicates based on (source_id, target_id, type) or ID,
        merges attributes, updates weight/confidence, and tracks multi-source provenance.
        """
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        src_id = edge_data.get("source_id")
        tgt_id = edge_data.get("target_id")
        rel_type = (edge_data.get("type") or "ASSOCIATED_WITH").upper()

        existing_edge_id = None
        if edge_data.get("id") and edge_data["id"] in self.edges:
            existing_edge_id = edge_data["id"]
        else:
            # Search for existing relationship between src and tgt of same type
            for eid, edge in self.edges.items():
                if edge.get("source_id") == src_id and edge.get("target_id") == tgt_id and edge.get("type") == rel_type:
                    existing_edge_id = eid
                    break

        if existing_edge_id:
            existing_edge = self.edges[existing_edge_id]

            # Merge attributes
            existing_attrs = existing_edge.get("attributes", {})
            existing_attrs.update(edge_data.get("attributes", {}))
            existing_edge["attributes"] = existing_attrs

            # Update confidence/weight
            if "confidence" in edge_data:
                existing_edge["confidence"] = max(existing_edge.get("confidence", 0.0), float(edge_data["confidence"]))
            if "weight" in edge_data:
                existing_edge["weight"] = max(existing_edge.get("weight", 0.0), float(edge_data["weight"]))

            # Merge multi-source evidence / source_ids
            evidence_ids = set(existing_edge.get("evidence_ids", []))
            if "evidence_id" in edge_data and edge_data["evidence_id"]:
                evidence_ids.add(edge_data["evidence_id"])
            if "evidence_ids" in edge_data:
                evidence_ids.update(edge_data["evidence_ids"])
            existing_edge["evidence_ids"] = list(evidence_ids)

            existing_edge["updated_at"] = now
            return existing_edge

        else:
            new_edge = dict(edge_data)
            if "id" not in new_edge or not new_edge["id"]:
                import uuid
                new_edge["id"] = f"rel-{str(uuid.uuid4())[:8]}"

            if "attributes" not in new_edge or not isinstance(new_edge["attributes"], dict):
                new_edge["attributes"] = {}

            evidence_ids = set(new_edge.get("evidence_ids", []))
            if "evidence_id" in new_edge and new_edge["evidence_id"]:
                evidence_ids.add(new_edge["evidence_id"])
            new_edge["evidence_ids"] = list(evidence_ids)

            new_edge["type"] = rel_type
            new_edge["created_at"] = new_edge.get("created_at", now)
            new_edge["updated_at"] = now

            self.edges[new_edge["id"]] = new_edge
            return new_edge

    def add_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        return self.upsert_node(node_data)

    def upsert_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Upserts an entity node into memory graph. Normalizes identifiers, deduplicates,
        merges attributes and tags, and maintains multi-source provenance.
        """
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # 1. Normalize identifier & check existing match
        node_type = (node_data.get("type") or "UNKNOWN").upper()
        raw_identifier = node_data.get("identifier") or node_data.get("name") or node_data.get("id")
        norm_val = normalize_entity_identifier(node_type, str(raw_identifier)) if raw_identifier else ""
        
        lookup_key = f"{node_type}:{norm_val}" if norm_val else None
        
        existing_id = None
        if node_data.get("id") and node_data["id"] in self.nodes:
            existing_id = node_data["id"]
        elif lookup_key and lookup_key in self.normalized_index:
            existing_id = self.normalized_index[lookup_key]

        if existing_id:
            # UPDATE / MERGE existing node
            existing_node = self.nodes[existing_id]
            
            # Merge attributes
            existing_attrs = existing_node.get("attributes", {})
            new_attrs = node_data.get("attributes", {})
            existing_attrs.update(new_attrs)
            if norm_val:
                existing_attrs["normalized_identifier"] = norm_val
            existing_node["attributes"] = existing_attrs

            # Merge tags
            existing_tags = set(existing_node.get("tags", []))
            existing_tags.update(node_data.get("tags", []))
            existing_node["tags"] = list(existing_tags)

            # Multi-source provenance
            source_ids = set(existing_node.get("source_ids", []))
            if "source_id" in node_data and node_data["source_id"]:
                source_ids.add(node_data["source_id"])
            if "source_ids" in node_data:
                source_ids.update(node_data["source_ids"])
            existing_node["source_ids"] = list(source_ids)

            # Update risk score if higher
            if "risk_score" in node_data:
                existing_node["risk_score"] = max(existing_node.get("risk_score", 0.0), float(node_data["risk_score"]))
            if "risk_level" in node_data and node_data["risk_level"]:
                existing_node["risk_level"] = node_data["risk_level"]

            existing_node["updated_at"] = now
            return existing_node

        else:
            # INSERT new node
            new_node = dict(node_data)
            if "id" not in new_node or not new_node["id"]:
                import uuid
                new_node["id"] = f"{node_type.lower()}-{str(uuid.uuid4())[:8]}"

            if "attributes" not in new_node or not isinstance(new_node["attributes"], dict):
                new_node["attributes"] = {}
            if norm_val:
                new_node["attributes"]["normalized_identifier"] = norm_val

            if "tags" not in new_node:
                new_node["tags"] = []

            source_ids = set(new_node.get("source_ids", []))
            if "source_id" in new_node and new_node["source_id"]:
                source_ids.add(new_node["source_id"])
            new_node["source_ids"] = list(source_ids)

            new_node["created_at"] = new_node.get("created_at", now)
            new_node["updated_at"] = now

            self.nodes[new_node["id"]] = new_node
            if lookup_key:
                self.normalized_index[lookup_key] = new_node["id"]
            return new_node

    def add_edge(self, edge_data: Dict[str, Any]) -> Dict[str, Any]:
        return self.upsert_edge(edge_data)
