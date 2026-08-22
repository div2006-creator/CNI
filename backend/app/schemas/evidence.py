from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EvidenceBase(BaseModel):
    title: str
    source_type: str = Field(..., description="e.g. CDR, BANK_WIRE, SURVEILLANCE_REPORT, MOBILE_MSG")
    source_id: str
    content_snippet: str
    confidence: float = Field(0.9, ge=0.0, le=1.0)
    timestamp: str
    extraction_method: str = "AUTOMATED_NLP"
    linked_entity_ids: List[str] = Field(default_factory=list)
    linked_relationship_ids: List[str] = Field(default_factory=list)

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: str
    created_at: str
