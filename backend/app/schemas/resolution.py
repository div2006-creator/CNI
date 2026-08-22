from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CandidateStatus(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    CONFIRMED_MERGE = "CONFIRMED_MERGE"
    DISMISSED = "DISMISSED"

class EntityResolutionCandidate(BaseModel):
    id: str
    entity_id_1: str
    entity_id_2: str
    name_1: str
    name_2: str
    type: str
    similarity_score: float = Field(..., ge=0.0, le=1.0)
    matching_attributes: List[str]
    status: CandidateStatus = CandidateStatus.PENDING_REVIEW
    explanation: str

class EntityMergeRequest(BaseModel):
    primary_entity_id: str
    secondary_entity_id: str
    merge_reason: str
