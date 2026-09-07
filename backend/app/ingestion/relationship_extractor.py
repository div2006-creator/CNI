import datetime
import hashlib
from typing import List, Dict, Any
from app.ingestion.entity_extractor import EntityExtractor

class RelationshipExtractor:
    """
    Extracts relationship edges connecting nodes from parsed records.
    """

    @staticmethod
    def _make_rel_id(rel_type: str, source_id: str, target_id: str) -> str:
        raw = f"{rel_type}:{source_id}:{target_id}"
        return f"rel-ingest-{hashlib.md5(raw.encode()).hexdigest()[:8]}"

    @classmethod
    def extract_from_cdr(cls, records: List[Dict[str, Any]], evidence_id: str) -> List[Dict[str, Any]]:
        edges: List[Dict[str, Any]] = []

        for rec in records:
            src_node_id = EntityExtractor._make_id("PHONE", rec["caller_phone"])
            tgt_node_id = EntityExtractor._make_id("PHONE", rec["callee_phone"])

            rel_id = cls._make_rel_id("CALLS", src_node_id, tgt_node_id)
            edges.append({
                "id": rel_id,
                "source_id": src_node_id,
                "target_id": tgt_node_id,
                "type": "CALLS",
                "confidence": 0.95,
                "weight": 0.90,
                "start_time": rec.get("timestamp"),
                "end_time": rec.get("timestamp"),
                "timestamp": rec.get("timestamp"),
                "source_type": "CDR",
                "evidence_id": evidence_id,
                "attributes": {
                    "duration_seconds": rec.get("duration_sec", 60),
                    "call_type": rec.get("call_type", "VOICE"),
                    "cell_tower": rec.get("cell_tower")
                }
            })

        return edges

    @classmethod
    def extract_from_financial(cls, records: List[Dict[str, Any]], evidence_id: str) -> List[Dict[str, Any]]:
        edges: List[Dict[str, Any]] = []

        for rec in records:
            src_node_id = EntityExtractor._make_id("ACCOUNT", rec["sender_account"])
            tgt_node_id = EntityExtractor._make_id("ACCOUNT", rec["receiver_account"])

            rel_id = cls._make_rel_id("TRANSFERRED_TO", src_node_id, tgt_node_id)
            amt = rec.get("amount", 0.0)
            edges.append({
                "id": rel_id,
                "source_id": src_node_id,
                "target_id": tgt_node_id,
                "type": "TRANSFERRED_TO",
                "confidence": 0.99,
                "weight": 1.0 if amt >= 100000 else 0.8,
                "start_time": rec.get("timestamp"),
                "end_time": rec.get("timestamp"),
                "timestamp": rec.get("timestamp"),
                "source_type": "UPI_FINANCIAL",
                "evidence_id": evidence_id,
                "attributes": {
                    "amount_usd": amt,
                    "transaction_id": rec.get("txn_id"),
                    "channel": rec.get("channel")
                }
            })

        return edges

    @classmethod
    def extract_from_fir(cls, extracted_nodes: List[Dict[str, Any]], evidence_id: str) -> List[Dict[str, Any]]:
        edges: List[Dict[str, Any]] = []
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # Group nodes by type
        persons = [n for n in extracted_nodes if n["type"] == "PERSON"]
        phones = [n for n in extracted_nodes if n["type"] == "PHONE"]
        orgs = [n for n in extracted_nodes if n["type"] == "ORGANIZATION"]
        locs = [n for n in extracted_nodes if n["type"] == "LOCATION"]
        accs = [n for n in extracted_nodes if n["type"] == "ACCOUNT"]

        # Link Persons to each other (ASSOCIATED_WITH)
        for i in range(len(persons)):
            for j in range(i + 1, len(persons)):
                rel_id = cls._make_rel_id("ASSOCIATED_WITH", persons[i]["id"], persons[j]["id"])
                edges.append({
                    "id": rel_id,
                    "source_id": persons[i]["id"],
                    "target_id": persons[j]["id"],
                    "type": "ASSOCIATED_WITH",
                    "confidence": 0.85,
                    "weight": 0.75,
                    "timestamp": now,
                    "source_type": "FIR_REPORT",
                    "evidence_id": evidence_id,
                    "attributes": {"context": "Mentioned together in surveillance FIR text report"}
                })

        # Link Persons to Phones (USES)
        for p in persons:
            for ph in phones:
                rel_id = cls._make_rel_id("USES", p["id"], ph["id"])
                edges.append({
                    "id": rel_id,
                    "source_id": p["id"],
                    "target_id": ph["id"],
                    "type": "USES",
                    "confidence": 0.88,
                    "weight": 0.85,
                    "timestamp": now,
                    "source_type": "FIR_REPORT",
                    "evidence_id": evidence_id,
                    "attributes": {"context": "Suspected usage of line"}
                })

        # Link Persons to Orgs (OWNS / WORKS_FOR)
        for p in persons:
            for o in orgs:
                rel_id = cls._make_rel_id("OWNS", p["id"], o["id"])
                edges.append({
                    "id": rel_id,
                    "source_id": p["id"],
                    "target_id": o["id"],
                    "type": "OWNS",
                    "confidence": 0.90,
                    "weight": 0.90,
                    "timestamp": now,
                    "source_type": "FIR_REPORT",
                    "evidence_id": evidence_id,
                    "attributes": {"context": "Corporate control mentioned in FIR"}
                })

        # Link Persons to Locations (VISITED / LOCATED_AT)
        for p in persons:
            for l in locs:
                rel_id = cls._make_rel_id("LOCATED_AT", p["id"], l["id"])
                edges.append({
                    "id": rel_id,
                    "source_id": p["id"],
                    "target_id": l["id"],
                    "type": "LOCATED_AT",
                    "confidence": 0.80,
                    "weight": 0.70,
                    "timestamp": now,
                    "source_type": "FIR_REPORT",
                    "evidence_id": evidence_id,
                    "attributes": {"context": "Observed co-location at facility"}
                })

        return edges
