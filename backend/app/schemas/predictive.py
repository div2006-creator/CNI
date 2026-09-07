from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from app.schemas.fact import FactType

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
    case_id: Optional[str] = "DEMO-CASE-001"
    fact_type: FactType = FactType.ANALYTICAL_INFERENCE

class InvestigatorReviewRequest(BaseModel):
    candidate_id: str
    action: ReviewAction
    investigator_id: str = "INV-OFFICER-01"
    notes: Optional[str] = None
    case_id: Optional[str] = "DEMO-CASE-001"

class InvestigatorReviewResponse(BaseModel):
    candidate_id: str
    action: str
    status: str
    audit_id: str
    message: str
    created_relationship_id: Optional[str] = None
    case_id: Optional[str] = "DEMO-CASE-001"
