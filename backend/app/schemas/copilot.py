from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CopilotQueryRequest(BaseModel):
    query: str
    case_id: Optional[str] = None
    focused_entity_ids: List[str] = Field(default_factory=list)

class CopilotQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float = Field(0.9, ge=0.0, le=1.0)
    classification_label: Optional[str] = "Possible association"
    reasoning: List[str] = Field(default_factory=list)
    supporting_evidence_ids: List[str] = Field(default_factory=list)
    supporting_entity_ids: List[str] = Field(default_factory=list)
    contradicting_evidence: List[str] = Field(default_factory=list)
    recommended_action: Optional[str] = "Review linked evidence items and timeline logs."
    suggested_investigative_actions: List[str] = Field(default_factory=list)

