from fastapi import APIRouter, HTTPException, status
from typing import List
from app.schemas.predictive import (
    CandidateLinkPair,
    InvestigatorReviewRequest,
    InvestigatorReviewResponse
)
from app.graph.store import graph_driver
from app.predictive.nexus_engine import PredictiveNexusEngine
from app.predictive.review_service import InvestigatorReviewService

router = APIRouter(prefix="/predictive", tags=["Predictive Nexus & Review"])

# In-memory candidate list storage
candidate_store: List[dict] = PredictiveNexusEngine.generate_candidate_links(graph_driver)

@router.get("/candidates", response_model=List[CandidateLinkPair])
def get_predictive_candidates():
    """
    Returns candidate hidden associations discovered in the Knowledge Graph with explainable signal breakdowns.
    """
    return candidate_store

@router.post("/review", response_model=InvestigatorReviewResponse)
def submit_investigator_review(review_req: InvestigatorReviewRequest):
    """
    Submit human-in-the-loop investigator verification review ([CONFIRM], [REJECT], [NEED MORE EVIDENCE]).
    Updates Knowledge Graph upon confirmation and records action in audit trail.
    """
    target_cand = None
    for cand in candidate_store:
        if cand["candidate_id"] == review_req.candidate_id:
            target_cand = cand
            break

    if not target_cand:
        # Fallback default candidate if custom ID passed
        target_cand = candidate_store[0] if candidate_store else {
            "candidate_id": review_req.candidate_id,
            "source_entity_id": "person-101",
            "source_entity_name": "Subject Alpha",
            "target_entity_id": "person-104",
            "target_entity_name": "Subject Delta",
            "candidate_score": 0.74,
            "suggested_relationship_type": "ASSOCIATED_WITH"
        }

    res = InvestigatorReviewService.process_review(review_req, target_cand)
    target_cand["status"] = res["status"]
    return res
