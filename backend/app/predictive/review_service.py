import datetime, uuid
from typing import Dict, Any
from app.schemas.predictive import InvestigatorReviewRequest, ReviewAction
from app.graph.store import graph_driver
from data.synthetic.seed_data import get_synthetic_dataset

synthetic_audit_logs = get_synthetic_dataset().get("audit_logs", [])

class InvestigatorReviewService:
    """
    Service for human-in-the-loop investigator verification of candidate predictive links and anomalies.
    AI suggestions NEVER silently become confirmed facts without explicit investigator action.
    Updates relationship status in graph store and logs case-scoped audit records.
    """

    @staticmethod
    def process_review(req: InvestigatorReviewRequest, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        audit_id = f"aud-{str(uuid.uuid4())[:8]}"
        effective_case_id = req.case_id or candidate_data.get("case_id") or "DEMO-CASE-001"

        action_str = req.action.value
        created_rel_id = None

        if req.action == ReviewAction.CONFIRM:
            status = "CONFIRMED"
            rel_status = "SUPPORTED"
            rel_data = {
                "source_id": candidate_data["source_entity_id"],
                "target_id": candidate_data["target_entity_id"],
                "type": candidate_data.get("suggested_relationship_type", "ASSOCIATED_WITH"),
                "confidence": candidate_data.get("candidate_score", 0.80),
                "weight": 0.90,
                "case_id": effective_case_id,
                "fact_type": "ANALYTICAL_INFERENCE",
                "status": rel_status,
                "attributes": {
                    "investigator_verified": True,
                    "verified_by": req.investigator_id,
                    "verification_date": now,
                    "notes": req.notes or "Confirmed via Predictive Nexus review interface."
                },
                "source_type": "PREDICTIVE_NEXUS_CONFIRMED"
            }
            upserted = graph_driver.upsert_edge(rel_data, case_id=effective_case_id)
            created_rel_id = upserted["id"]
            msg = f"Investigator '{req.investigator_id}' CONFIRMED candidate association in case '{effective_case_id}'. Edge '{created_rel_id}' updated to SUPPORTED in Knowledge Graph."

        elif req.action == ReviewAction.REJECT:
            status = "REJECTED"
            rel_status = "REJECTED"
            rel_data = {
                "source_id": candidate_data["source_entity_id"],
                "target_id": candidate_data["target_entity_id"],
                "type": candidate_data.get("suggested_relationship_type", "ASSOCIATED_WITH"),
                "confidence": candidate_data.get("candidate_score", 0.80),
                "weight": 0.0,
                "case_id": effective_case_id,
                "fact_type": "ANALYTICAL_INFERENCE",
                "status": rel_status,
                "attributes": {
                    "investigator_verified": True,
                    "verified_by": req.investigator_id,
                    "verification_date": now,
                    "notes": req.notes or "Rejected via Predictive Nexus review interface."
                },
                "source_type": "PREDICTIVE_NEXUS_REJECTED"
            }
            upserted = graph_driver.upsert_edge(rel_data, case_id=effective_case_id)
            created_rel_id = upserted["id"]
            msg = f"Investigator '{req.investigator_id}' REJECTED candidate association in case '{effective_case_id}'. Decision logged to audit trail."

        else:
            status = "NEED_MORE_EVIDENCE"
            msg = f"Investigator '{req.investigator_id}' flagged candidate as NEED MORE EVIDENCE in case '{effective_case_id}'. Tasking logged to audit trail."

        # Log audit entry in central audit system
        audit_entry = {
            "id": audit_id,
            "investigator_id": req.investigator_id,
            "action_type": f"PREDICTIVE_NEXUS_{action_str}",
            "target_resource": f"Candidate {req.candidate_id} ({candidate_data.get('source_entity_name')} - {candidate_data.get('target_entity_name')})",
            "details": {
                "candidate_id": req.candidate_id,
                "action": action_str,
                "score": candidate_data.get("candidate_score"),
                "notes": req.notes,
                "case_id": effective_case_id,
                "created_relationship_id": created_rel_id
            },
            "timestamp": now,
            "case_id": effective_case_id
        }
        synthetic_audit_logs.append(audit_entry)

        return {
            "candidate_id": req.candidate_id,
            "action": action_str,
            "status": status,
            "audit_id": audit_id,
            "message": msg,
            "created_relationship_id": created_rel_id,
            "case_id": effective_case_id
        }
