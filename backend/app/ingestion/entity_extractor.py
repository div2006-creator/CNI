import datetime
import hashlib
from typing import List, Dict, Any, Tuple

class EntityExtractor:
    """
    Extracts, normalizes, and deduplicates network graph nodes from parsed evidence records.
    """

    @staticmethod
    def _make_id(entity_type: str, identifier: str, case_id: str = "DEMO-CASE-001") -> str:
        clean = f"{case_id}:{identifier.strip().lower()}"
        short_hash = hashlib.md5(clean.encode()).hexdigest()[:6]
        return f"{entity_type.lower()}-{short_hash}"

    @classmethod
    def extract_from_cdr(cls, records: List[Dict[str, Any]], case_id: str = "DEMO-CASE-001") -> List[Dict[str, Any]]:
        nodes_dict: Dict[str, Dict[str, Any]] = {}
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        for rec in records:
            caller = rec["caller_phone"]
            callee = rec["callee_phone"]

            for phone in [caller, callee]:
                node_id = cls._make_id("PHONE", phone, case_id=case_id)
                if node_id not in nodes_dict:
                    nodes_dict[node_id] = {
                        "id": node_id,
                        "name": phone if phone.startswith("+") else f"+1 {phone}",
                        "type": "PHONE",
                        "risk_level": "HIGH" if "555" in phone or "999" in phone else "MEDIUM",
                        "risk_score": 0.75,
                        "attributes": {"carrier": "Ingested Telemetry Feed", "raw_identifier": phone},
                        "tags": ["Ingested CDR", "Cellular Target"],
                        "created_at": now,
                        "updated_at": now,
                        "case_id": case_id,
                        "is_bridge_node": False,
                        "betweenness_centrality": 0.2
                    }

        return list(nodes_dict.values())

    @classmethod
    def extract_from_financial(cls, records: List[Dict[str, Any]], case_id: str = "DEMO-CASE-001") -> List[Dict[str, Any]]:
        nodes_dict: Dict[str, Dict[str, Any]] = {}
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        for rec in records:
            sender = rec["sender_account"]
            receiver = rec["receiver_account"]
            amount = rec.get("amount", 0.0)

            for acc in [sender, receiver]:
                node_id = cls._make_id("ACCOUNT", acc, case_id=case_id)
                if node_id not in nodes_dict:
                    is_crypto = acc.startswith("0x") or "wallet" in acc.lower()
                    nodes_dict[node_id] = {
                        "id": node_id,
                        "name": f"Account {acc}" if not is_crypto else f"Crypto Wallet {acc[:10]}...",
                        "type": "ACCOUNT",
                        "risk_level": "CRITICAL" if amount >= 100000 or is_crypto else "HIGH",
                        "risk_score": 0.88 if amount >= 100000 else 0.70,
                        "attributes": {
                            "vpa_handle": acc,
                            "last_transfer_amount": amount,
                            "channel": rec.get("channel", "UPI")
                        },
                        "tags": ["Ingested Financial", "High-Value Target" if amount >= 100000 else "UPI Account"],
                        "created_at": now,
                        "updated_at": now,
                        "case_id": case_id,
                        "is_bridge_node": False,
                        "betweenness_centrality": 0.3
                    }

        return list(nodes_dict.values())

    @classmethod
    def extract_from_fir(cls, parsed_fir: Dict[str, Any], case_id: str = "DEMO-CASE-001") -> List[Dict[str, Any]]:
        nodes_dict: Dict[str, Dict[str, Any]] = {}
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        tokens = parsed_fir.get("extracted_tokens", {})

        # Persons
        for p in tokens.get("persons", []):
            node_id = cls._make_id("PERSON", p, case_id=case_id)
            nodes_dict[node_id] = {
                "id": node_id,
                "name": p if p.startswith("Subject") else f"Subject {p}",
                "type": "PERSON",
                "risk_level": "HIGH",
                "risk_score": 0.82,
                "attributes": {"source_report": "Ingested FIR Text"},
                "tags": ["Extracted Suspect", "FIR Mention"],
                "created_at": now,
                "updated_at": now,
                "case_id": case_id,
                "is_bridge_node": False,
                "betweenness_centrality": 0.4
            }

        # Phones
        for ph in tokens.get("phones", []):
            node_id = cls._make_id("PHONE", ph, case_id=case_id)
            nodes_dict[node_id] = {
                "id": node_id,
                "name": ph,
                "type": "PHONE",
                "risk_level": "MEDIUM",
                "risk_score": 0.65,
                "attributes": {"carrier": "Intercept Feed"},
                "tags": ["Encrypted Intercept"],
                "created_at": now,
                "updated_at": now,
                "case_id": case_id,
                "is_bridge_node": False,
                "betweenness_centrality": 0.2
            }

        # Accounts
        for acc in tokens.get("accounts", []):
            node_id = cls._make_id("ACCOUNT", acc, case_id=case_id)
            nodes_dict[node_id] = {
                "id": node_id,
                "name": acc,
                "type": "ACCOUNT",
                "risk_level": "HIGH",
                "risk_score": 0.80,
                "attributes": {"account_ref": acc},
                "tags": ["Financial Intercept"],
                "created_at": now,
                "updated_at": now,
                "case_id": case_id,
                "is_bridge_node": False,
                "betweenness_centrality": 0.3
            }

        # Organizations
        for org in tokens.get("organizations", []):
            node_id = cls._make_id("ORGANIZATION", org, case_id=case_id)
            nodes_dict[node_id] = {
                "id": node_id,
                "name": org,
                "type": "ORGANIZATION",
                "risk_level": "CRITICAL",
                "risk_score": 0.90,
                "attributes": {"status": "Suspected Front Entity"},
                "tags": ["Shell Company", "Front Business"],
                "created_at": now,
                "updated_at": now,
                "case_id": case_id,
                "is_bridge_node": True,
                "betweenness_centrality": 0.75
            }

        # Locations
        for loc in tokens.get("locations", []):
            node_id = cls._make_id("LOCATION", loc, case_id=case_id)
            nodes_dict[node_id] = {
                "id": node_id,
                "name": loc,
                "type": "LOCATION",
                "risk_level": "HIGH",
                "risk_score": 0.75,
                "attributes": {"site_type": "Surveillance Point"},
                "tags": ["Staging Location"],
                "created_at": now,
                "updated_at": now,
                "case_id": case_id,
                "is_bridge_node": False,
                "betweenness_centrality": 0.35
            }

        # Vehicles
        for veh in tokens.get("vehicles", []):
            node_id = cls._make_id("VEHICLE", veh, case_id=case_id)
            nodes_dict[node_id] = {
                "id": node_id,
                "name": veh,
                "type": "VEHICLE",
                "risk_level": "MEDIUM",
                "risk_score": 0.60,
                "attributes": {"vehicle_details": veh},
                "tags": ["Transport"],
                "created_at": now,
                "updated_at": now,
                "case_id": case_id,
                "is_bridge_node": False,
                "betweenness_centrality": 0.15
            }

        return list(nodes_dict.values())

