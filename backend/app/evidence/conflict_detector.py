import datetime
import hashlib
from typing import List, Dict, Any, Optional

class ConflictDetector:
    """
    Lightweight deterministic conflict detector for CNI evidence pipeline.
    Identifies contradictory evidence, identity mismatches, temporal collisions,
    and ownership conflicts without drawing automatic guilt conclusions.
    Generates UNRESOLVED_CONFLICT evidence items for investigator review.
    """

    @classmethod
    def detect_conflicts(
        cls,
        case_id: str,
        entities: List[Dict[str, Any]],
        relationships: List[Dict[str, Any]],
        evidence_items: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        conflicts: List[Dict[str, Any]] = []
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        evidence_items = evidence_items or []

        # 1. Identity Conflicts: Same raw identifier associated with different names/types
        id_map: Dict[str, List[Dict[str, Any]]] = {}
        for ent in entities:
            raw_id = ent.get("attributes", {}).get("raw_identifier") or ent.get("name")
            if raw_id:
                clean_id = str(raw_id).strip().lower()
                id_map.setdefault(clean_id, []).append(ent)

        for raw_id, matches in id_map.items():
            if len(matches) > 1:
                types = set(m.get("type") for m in matches)
                names = set(m.get("name") for m in matches)
                if len(types) > 1 or len(names) > 1:
                    cid = f"conf-id-{hashlib.md5(f'{case_id}:{raw_id}'.encode()).hexdigest()[:6]}"
                    conflicts.append({
                        "id": cid,
                        "title": f"Identity Conflict for Identifier '{raw_id}'",
                        "source_type": "CONFLICT_DETECTOR",
                        "source_id": cid,
                        "source_reference_id": f"Case {case_id}",
                        "content_snippet": f"Identifier '{raw_id}' is associated with incompatible types/names: {list(names)} ({list(types)}).",
                        "confidence": 0.90,
                        "timestamp": now,
                        "created_at": now,
                        "extraction_method": "DETERMINISTIC_CONFLICT_DETECTOR",
                        "linked_entity_ids": [m["id"] for m in matches],
                        "linked_relationship_ids": [],
                        "case_id": case_id,
                        "fact_type": "UNRESOLVED_CONFLICT",
                        "conflict_type": "IDENTITY_CONFLICT",
                        "provenance": {"is_partial": True, "snippet": f"Identifier collision for {raw_id}"}
                    })

        # 2. Temporal Conflicts: Same entity appearing in multiple events at the exact same timestamp
        time_entity_map: Dict[Tuple[str, str], List[Dict[str, Any]]] = {}
        for rel in relationships:
            ts = rel.get("timestamp") or rel.get("start_time")
            if ts:
                src = rel.get("source_id")
                tgt = rel.get("target_id")
                if src:
                    time_entity_map.setdefault((src, ts), []).append(rel)
                if tgt:
                    time_entity_map.setdefault((tgt, ts), []).append(rel)

        for (ent_id, ts), rel_list in time_entity_map.items():
            if len(rel_list) > 1:
                # Check if relationships involve incompatible cell towers / locations
                towers = set(r.get("attributes", {}).get("cell_tower") for r in rel_list if r.get("attributes", {}).get("cell_tower"))
                if len(towers) > 1:
                    cid = f"conf-temp-{hashlib.md5(f'{case_id}:{ent_id}:{ts}'.encode()).hexdigest()[:6]}"
                    conflicts.append({
                        "id": cid,
                        "title": f"Temporal Location Conflict for Entity '{ent_id}'",
                        "source_type": "CONFLICT_DETECTOR",
                        "source_id": cid,
                        "source_reference_id": f"Case {case_id}",
                        "content_snippet": f"Entity '{ent_id}' registered simultaneous activity at {ts} across different locations: {list(towers)}.",
                        "confidence": 0.95,
                        "timestamp": now,
                        "created_at": now,
                        "extraction_method": "DETERMINISTIC_CONFLICT_DETECTOR",
                        "linked_entity_ids": [ent_id],
                        "linked_relationship_ids": [r["id"] for r in rel_list],
                        "case_id": case_id,
                        "fact_type": "UNRESOLVED_CONFLICT",
                        "conflict_type": "TEMPORAL_LOCATION_CONFLICT",
                        "provenance": {"is_partial": True, "snippet": f"Simultaneous activity at {ts}"}
                    })

        # 3. Ownership vs Usage Conflicts: Phone or Account linked to both OWNS and USES by different persons
        owns_map: Dict[str, str] = {}
        uses_map: Dict[str, str] = {}
        for rel in relationships:
            rel_type = rel.get("type")
            if rel_type in ["OWNS", "REGISTERED_TO"]:
                owns_map[rel["target_id"]] = rel["source_id"]
            elif rel_type in ["USES", "OPERATES"]:
                uses_map[rel["target_id"]] = rel["source_id"]

        for target_id, owner_id in owns_map.items():
            user_id = uses_map.get(target_id)
            if user_id and user_id != owner_id:
                cid = f"conf-own-{hashlib.md5(f'{case_id}:{target_id}'.encode()).hexdigest()[:6]}"
                conflicts.append({
                    "id": cid,
                    "title": f"Ownership vs Usage Discrepancy for '{target_id}'",
                    "source_type": "CONFLICT_DETECTOR",
                    "source_id": cid,
                    "source_reference_id": f"Case {case_id}",
                    "content_snippet": f"Target entity '{target_id}' is owned by '{owner_id}' but active usage evidence links to '{user_id}'.",
                    "confidence": 0.88,
                    "timestamp": now,
                    "created_at": now,
                    "extraction_method": "DETERMINISTIC_CONFLICT_DETECTOR",
                    "linked_entity_ids": [target_id, owner_id, user_id],
                    "linked_relationship_ids": [],
                    "case_id": case_id,
                    "fact_type": "UNRESOLVED_CONFLICT",
                    "conflict_type": "OWNERSHIP_DISCREPANCY",
                    "provenance": {"is_partial": True, "snippet": f"Owner {owner_id} vs User {user_id}"}
                })

        return conflicts
