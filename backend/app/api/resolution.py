from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.resolution import EntityResolutionCandidate, EntityMergeRequest, CandidateStatus
from data.synthetic.seed_data import get_synthetic_dataset

router = APIRouter(prefix="/resolution", tags=["Entity Resolution"])
synthetic_candidates = get_synthetic_dataset().get("resolution_candidates", [])

@router.get("/candidates", response_model=List[EntityResolutionCandidate])
def get_candidate_matches():
    """Retrieve potential duplicate entity candidate matches for investigator review."""
    return synthetic_candidates

@router.post("/merge", status_code=200)
def merge_entities(merge_req: EntityMergeRequest):
    """Confirm merge of candidate duplicate entities with audit confirmation."""
    return {
        "status": "MERGE_CONFIRMED",
        "primary_entity_id": merge_req.primary_entity_id,
        "merged_secondary_id": merge_req.secondary_entity_id,
        "message": f"Successfully merged secondary entity '{merge_req.secondary_entity_id}' into primary entity '{merge_req.primary_entity_id}'."
    }
