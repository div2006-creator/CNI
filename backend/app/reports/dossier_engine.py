import datetime
import hashlib
import json
from typing import Dict, Any, List

from app.graph.store import graph_driver
from app.evidence.confidence import ConfidenceEngine
from app.analytics.financial_analytics import FinancialAnalyticsEngine
from data.synthetic.seed_data import get_synthetic_dataset

synthetic_audit_logs = get_synthetic_dataset().get("audit_logs", [])


class DossierEngine:
    """
    Case Snapshot & Auditable Dossier Generation Engine with SHA-256 Tamper-Evident Fingerprinting.
    Compiles entities, graph analytics, financial flow anomalies, evidence breakdowns, and investigator audit logs.
    """

    @staticmethod
    def generate_dossier(case_id: str = "INV-2026-0891") -> Dict[str, Any]:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # 1. Fetch graph state via get_network_graph()
        net_graph = graph_driver.get_network_graph()
        nodes = net_graph.get("nodes", [])
        edges = net_graph.get("edges", [])
        
        # Identify primary target profiles
        critical_targets = [
            n for n in nodes
            if n.get("risk_level") == "CRITICAL" or n.get("is_bridge_node", False)
        ]
        
        # 2. Compute evidence confidence breakdown for sample key relationship
        sample_edge = edges[0] if edges else {
            "id": "rel-101-104",
            "source_id": "person-101",
            "target_id": "person-104",
            "type": "ASSOCIATED_WITH",
            "attributes": {
                "call_count_30d": 18,
                "co_location_events": 4,
                "location_mismatch": "Aug 17: Alpha in London, Delta active in Mumbai"
            }
        }
        synthetic_evidence = get_synthetic_dataset().get("evidence_items", [])
        confidence_breakdown = ConfidenceEngine.evaluate_relationship(
            relationship=sample_edge,
            linked_evidence_items=synthetic_evidence,
            common_neighbors_count=2
        )
        
        # 3. Analyze financial flows
        fin_analysis = FinancialAnalyticsEngine.analyze_financial_network(graph_driver)
        
        # 4. Fetch evidence timeline
        timeline_events = get_synthetic_dataset().get("timeline_events", [])
        
        # 5. Build dossier payload structure
        dossier_payload = {
            "case_metadata": {
                "case_id": case_id,
                "case_title": "Operation NorthStar Executive Intelligence Dossier",
                "classification": "RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT",
                "generated_at": now,
                "system_version": "CrimeNet Intelligence Engine v2.0.0 (SIH 2026)",
                "disclaimer": "INVESTIGATION SUPPORT ONLY. Predictive outputs and network scores represent investigative leads for verification. This document does not constitute a formal determination of guilt."
            },
            "executive_summary": {
                "total_entities_analyzed": len(nodes),
                "total_relationships_modeled": len(edges),
                "critical_risk_targets_count": len([n for n in nodes if n.get("risk_level") == "CRITICAL"]),
                "bridge_nodes_detected_count": len([n for n in nodes if n.get("is_bridge_node")]),
                "potential_layering_alerts": len(fin_analysis.get("potential_layering_indicators", [])),
                "potential_smurfing_alerts": len(fin_analysis.get("potential_smurfing_indicators", []))
            },
            "target_entity_profiles": [
                {
                    "entity_id": target.get("id"),
                    "name": target.get("name"),
                    "type": target.get("type"),
                    "risk_level": target.get("risk_level"),
                    "risk_score": target.get("risk_score"),
                    "is_bridge_node": target.get("is_bridge_node", False),
                    "betweenness_centrality": target.get("betweenness_centrality", 0.0),
                    "tags": target.get("tags", []),
                    "attributes": target.get("attributes", {})
                }
                for target in critical_targets
            ],
            "evidentiary_signals_and_confidence": {
                "pair_subject": "Subject Alpha -> Subject Delta (Accountant)",
                "confidence_score": confidence_breakdown.get("overall_confidence", 0.84),
                "confidence_percentage": confidence_breakdown.get("confidence_percentage", 84),
                "signal_breakdown": confidence_breakdown.get("score_breakdown", []),
                "supporting_evidence": confidence_breakdown.get("supporting_evidence", []),
                "contradicting_evidence": confidence_breakdown.get("contradicting_evidence", []),
                "timeline_highlights": timeline_events[:5]
            },
            "financial_intelligence_summary": {
                "money_flow_stages": fin_analysis.get("stages", []),
                "potential_layering_indicators": fin_analysis.get("potential_layering_indicators", []),
                "potential_smurfing_indicators": fin_analysis.get("potential_smurfing_indicators", []),
                "total_volume_usd": fin_analysis.get("total_volume_usd", 1450000.0)
            },
            "investigator_verification_audit_log": [
                {
                    "id": log.get("id"),
                    "investigator_id": log.get("investigator_id"),
                    "action_type": log.get("action_type"),
                    "target_resource": log.get("target_resource"),
                    "timestamp": log.get("timestamp"),
                    "details": log.get("details", {})
                }
                for log in synthetic_audit_logs
            ]
        }
        
        # Compute SHA-256 Tamper-Evident Fingerprint
        raw_hash = DossierEngine.compute_dossier_hash(dossier_payload)
        
        dossier_payload["integrity_fingerprint"] = f"sha256:{raw_hash}"
        dossier_payload["hash_timestamp"] = now
        
        return dossier_payload

    @staticmethod
    def compute_dossier_hash(dossier_payload: Dict[str, Any]) -> str:
        """
        Computes deterministic SHA-256 hex digest over canonical JSON representation of dossier.
        """
        data_to_hash = {
            k: v for k, v in dossier_payload.items()
            if k not in ("integrity_fingerprint", "hash_timestamp")
        }
        canonical_json = json.dumps(data_to_hash, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(canonical_json.encode("utf-8")).hexdigest()

    @staticmethod
    def verify_dossier(dossier_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifies tamper-evident integrity of a dossier payload.
        """
        fingerprint = dossier_payload.get("integrity_fingerprint", "")
        if not fingerprint:
            return {
                "valid": False,
                "reason": "Missing integrity_fingerprint field.",
                "provided_hash": None,
                "computed_hash": None
            }
        
        raw_provided = fingerprint.replace("sha256:", "") if fingerprint.startswith("sha256:") else fingerprint
        computed = DossierEngine.compute_dossier_hash(dossier_payload)
        
        is_valid = computed.lower() == raw_provided.lower()
        return {
            "valid": is_valid,
            "reason": "Integrity verified. Fingerprint matches payload state." if is_valid else "TAMPER WARNING: Payload content does not match original SHA-256 fingerprint.",
            "provided_hash": raw_provided,
            "computed_hash": computed
        }
