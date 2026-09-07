from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.fact import FactType, EvidenceProvenance

class EvidenceBase(BaseModel):
    title: str
    source_type: str = Field(..., description="e.g. CDR, BANK_WIRE, SURVEILLANCE_REPORT, CORPORATE_FILING, FIR, SOCIAL_MEDIA")
    source_id: Optional[str] = None
    source_reference_id: Optional[str] = None
    content_snippet: str
    confidence: float = Field(0.9, ge=0.0, le=1.0)
    timestamp: str
    extraction_method: str = "AUTOMATED_NLP"
    linked_entity_ids: List[str] = Field(default_factory=list)
    linked_relationship_ids: List[str] = Field(default_factory=list)
    reliability_level: Optional[str] = Field("HIGH", description="HIGH, MEDIUM, or LOW")
    case_id: Optional[str] = Field("DEMO-CASE-001", description="Associated case identifier")
    fact_type: FactType = Field(FactType.DOCUMENT_FACT, description="DOCUMENT_FACT, ANALYTICAL_INFERENCE, or UNRESOLVED_CONFLICT")
    provenance: Optional[EvidenceProvenance] = None
    source_document_id: Optional[str] = None

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: str
    created_at: Optional[str] = None

class SignalContribution(BaseModel):
    signal_name: str
    points: float
    description: str

class SourceReliabilityRating(BaseModel):
    source_type: str
    reliability_level: str  # HIGH, MEDIUM, LOW
    weight: float

class TimelineEvent(BaseModel):
    timestamp: str
    label: str
    source_type: str
    description: str
    case_id: Optional[str] = "DEMO-CASE-001"

class RelationshipEvidenceExplanation(BaseModel):
    relationship_id: str
    source_id: str
    target_id: str
    relationship_type: str
    overall_confidence: float = Field(..., ge=0.0, le=1.0)
    confidence_percentage: int = Field(..., ge=0, le=100)
    score_breakdown: List[SignalContribution] = Field(default_factory=list)
    supporting_evidence: List[str] = Field(default_factory=list)
    contradicting_evidence: List[str] = Field(default_factory=list)
    source_reliability: List[SourceReliabilityRating] = Field(default_factory=list)
    timeline: List[TimelineEvent] = Field(default_factory=list)
    evidence_items: List[EvidenceResponse] = Field(default_factory=list)
    case_id: Optional[str] = "DEMO-CASE-001"
    fact_type: FactType = FactType.ANALYTICAL_INFERENCE
