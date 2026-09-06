from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class ReviewAction(str, Enum):
    CONFIRM = "CONFIRM"
    REJECT = "REJECT"
    NEED_MORE_EVIDENCE = "NEED_MORE_EVIDENCE"

class LinkSignalContribution(BaseModel):
    signal_name: str
    contribution_percentage: float
    description: str

class CandidateLinkPair(BaseModel):
    candidate_id: str
    source_entity_id: str
    source_entity_name: str
    source_entity_type: str
    target_entity_id: str
    target_entity_name: str
    target_entity_type: str
    candidate_score: float = Field(..., ge=0.0, le=1.0)
    score_percentage: int = Field(..., ge=0, le=100)
    suggested_relationship_type: str = "ASSOCIATED_WITH"
    classification_label: str = "Possible association"
    signals: List[LinkSignalContribution] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    status: str = Field("PENDING_REVIEW", description="PENDING_REVIEW, CONFIRMED, REJECTED, NEED_MORE_EVIDENCE")
    investigative_lead: str
    disclaimer: str = "Predictive candidate lead for investigator verification. Does not constitute legal proof of association or guilt."

class InvestigatorReviewRequest(BaseModel):
    candidate_id: str
    action: ReviewAction
    investigator_id: str = "INV-MILLER-04"
    notes: Optional[str] = None
    case_id: Optional[str] = "case-801"

class InvestigatorReviewResponse(BaseModel):
    candidate_id: str
    action: str
    status: str
    audit_id: str
    message: str
    created_relationship_id: Optional[str] = None
