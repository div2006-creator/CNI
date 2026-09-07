import re
import datetime
from typing import List, Dict, Any, Optional
from collections import deque
from app.graph.abstract import AbstractGraphDriver
from data.synthetic.seed_data import get_synthetic_dataset

class MockInMemoryGraphDriver(AbstractGraphDriver):
    def __init__(self):
        dataset = get_synthetic_dataset()
        self.nodes: Dict[str, Dict[str, Any]] = {n["id"]: n for n in dataset["nodes"]}
        self.edges: Dict[str, Dict[str, Any]] = {e["id"]: e for e in dataset["relationships"]}
        self.node_keys: Dict[str, str] = {}
        self.edge_keys: Dict[str, str] = {}
        self._rebuild_identity_indexes()

    @staticmethod
    def _normalize_text(value: str) -> str:
        return " ".join(str(value).strip().lower().split())

    @classmethod
    def _normalize_phone(cls, value: str) -> str:
        digits = re.sub(r"\D", "", str(value))
        if len(digits) == 10:
            return f"+91{digits}"
        if len(digits) == 12 and digits.startswith("91"):
            return f"+{digits}"
        if len(digits) == 11 and digits.startswith("1"):
            return f"+{digits}"
        if str(value).strip().startswith("+") and digits:
            return f"+{digits}"
        return f"+{digits}" if digits else cls._normalize_text(value)

    @classmethod
    def _node_identity_key(cls, node_data: Dict[str, Any]) -> str:
        entity_type = str(node_data.get("type", "")).upper()
        attrs = node_data.get("attributes", {}) or {}
        identifier = (
            attrs.get("normalized_key")
            or attrs.get("raw_identifier")
            or attrs.get("vpa_handle")
            or attrs.get("account_ref")
            or attrs.get("vehicle_details")
            or node_data.get("name")
            or node_data.get("id")
            or ""
        )

        if str(identifier).startswith(f"{entity_type}:"):
            return str(identifier)
        if entity_type == "PHONE":
            normalized = cls._normalize_phone(str(identifier))
        elif entity_type in {"ACCOUNT", "ORGANIZATION", "PERSON", "LOCATION"}:
            normalized = cls._normalize_text(str(identifier))
        elif entity_type == "VEHICLE":
            normalized = re.sub(r"[^A-Z0-9]", "", str(identifier).upper())
        else:
            normalized = cls._normalize_text(str(identifier))
        return f"{entity_type}:{normalized}"

    @staticmethod
    def _edge_identity_key(edge_data: Dict[str, Any]) -> str:
        return "|".join([
            str(edge_data.get("source_id", "")),
            str(edge_data.get("type", "")).upper(),
            str(edge_data.get("target_id", "")),
        ])

    @staticmethod
    def _merge_unique(existing: List[Any], incoming: List[Any]) -> List[Any]:
        merged = list(existing)
        for item in incoming:
            if item is not None and item not in merged:
                merged.append(item)
        return merged

    @classmethod
    def _as_list(cls, value: Any) -> List[Any]:
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return [value]

    def _rebuild_identity_indexes(self) -> None:
        self.node_keys = {}
        for node_id, node in self.nodes.items():
            self.node_keys[self._node_identity_key(node)] = node_id

        self.edge_keys = {}
        for edge_id, edge in self.edges.items():
            self.edge_keys[self._edge_identity_key(edge)] = edge_id

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
        self.node_keys[self._node_identity_key(node_data)] = node_data["id"]
        return node_data

    def upsert_node(self, node_data: Dict[str, Any]) -> Dict[str, Any]:
        incoming = dict(node_data)
        incoming_attrs = dict(incoming.get("attributes", {}) or {})
        identity_key = self._node_identity_key(incoming)
        incoming_attrs.setdefault("normalized_key", identity_key)
        incoming["attributes"] = incoming_attrs

        existing_id = self.node_keys.get(identity_key) or incoming.get("id")
        existing = self.nodes.get(existing_id)
        if not existing:
            self.nodes[incoming["id"]] = incoming
            self.node_keys[identity_key] = incoming["id"]
            return {"record": incoming, "status": "added"}

        changed = False
        existing_attrs = dict(existing.get("attributes", {}) or {})
        for key, value in incoming_attrs.items():
            if key not in existing_attrs:
                existing_attrs[key] = value
                changed = True
            elif existing_attrs[key] != value:
                variants_key = f"{key}_variants"
                variants = self._merge_unique(
                    self._as_list(existing_attrs.get(variants_key)),
                    [existing_attrs[key], value]
                )
                if variants != existing_attrs.get(variants_key):
                    existing_attrs[variants_key] = variants
                    changed = True

        tags = self._merge_unique(existing.get("tags", []), incoming.get("tags", []))
        if tags != existing.get("tags", []):
            existing["tags"] = tags
            changed = True

        for scalar_key in ["risk_score", "betweenness_centrality"]:
            if incoming.get(scalar_key, 0) > existing.get(scalar_key, 0):
                existing[scalar_key] = incoming[scalar_key]
                changed = True

        if "risk_level" in incoming:
            rank = {"INFO": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
            if rank.get(incoming["risk_level"], 0) > rank.get(existing.get("risk_level"), 0):
                existing["risk_level"] = incoming["risk_level"]
                changed = True

        if incoming.get("is_bridge_node") and not existing.get("is_bridge_node"):
            existing["is_bridge_node"] = True
            changed = True

        existing["attributes"] = existing_attrs
        if changed:
            existing["updated_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        self.nodes[existing["id"]] = existing
        self.node_keys[identity_key] = existing["id"]
        return {"record": existing, "status": "updated" if changed else "existing"}

    def add_edge(self, edge_data: Dict[str, Any]) -> Dict[str, Any]:
        self.edges[edge_data["id"]] = edge_data
        self.edge_keys[self._edge_identity_key(edge_data)] = edge_data["id"]
        return edge_data

    def upsert_edge(self, edge_data: Dict[str, Any]) -> Dict[str, Any]:
        incoming = dict(edge_data)
        identity_key = self._edge_identity_key(incoming)
        existing_id = self.edge_keys.get(identity_key) or incoming.get("id")
        existing = self.edges.get(existing_id)

        if not existing:
            incoming["source_types"] = self._as_list(incoming.get("source_type")) + self._as_list(incoming.get("source_types"))
            incoming["source_reference_ids"] = self._as_list(incoming.get("source_reference_id")) + self._as_list(incoming.get("source_reference_ids"))
            incoming["evidence_ids"] = self._as_list(incoming.get("evidence_id")) + self._as_list(incoming.get("evidence_ids"))
            incoming["observations_count"] = incoming.get("observations_count", 1)
            self.edges[incoming["id"]] = incoming
            self.edge_keys[identity_key] = incoming["id"]
            return {"record": incoming, "status": "added"}

        changed = False
        existing_attrs = dict(existing.get("attributes", {}) or {})
        incoming_attrs = dict(incoming.get("attributes", {}) or {})
        for key, value in incoming_attrs.items():
            if key not in existing_attrs:
                existing_attrs[key] = value
                changed = True
            elif existing_attrs[key] != value:
                variants_key = f"{key}_observations"
                variants = self._merge_unique(
                    self._as_list(existing_attrs.get(variants_key)),
                    [existing_attrs[key], value]
                )
                if variants != existing_attrs.get(variants_key):
                    existing_attrs[variants_key] = variants
                    changed = True

        for list_key, single_key in [
            ("source_types", "source_type"),
            ("source_reference_ids", "source_reference_id"),
            ("evidence_ids", "evidence_id"),
        ]:
            merged = self._merge_unique(
                self._as_list(existing.get(list_key)),
                self._as_list(existing.get(single_key)) + self._as_list(incoming.get(single_key)) + self._as_list(incoming.get(list_key))
            )
            if merged != existing.get(list_key):
                existing[list_key] = merged
                changed = True

        if incoming.get("confidence", 0) > existing.get("confidence", 0):
            existing["confidence"] = incoming["confidence"]
            changed = True
        if incoming.get("weight", 0) > existing.get("weight", 0):
            existing["weight"] = incoming["weight"]
            changed = True

        timestamps = self._merge_unique(
            self._as_list(existing.get("timestamps")),
            self._as_list(existing.get("timestamp")) + self._as_list(incoming.get("timestamp"))
        )
        if timestamps != existing.get("timestamps"):
            existing["timestamps"] = timestamps
            changed = True

        existing["attributes"] = existing_attrs
        existing["observations_count"] = max(existing.get("observations_count", 1), len(existing.get("evidence_ids", [])), 1)
        self.edges[existing["id"]] = existing
        self.edge_keys[identity_key] = existing["id"]
        return {"record": existing, "status": "updated" if changed else "existing"}
