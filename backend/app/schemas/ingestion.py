from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ParsedEntity(BaseModel):
    id: str
    name: str
    type: str  # PERSON, PHONE, ACCOUNT, LOCATION, VEHICLE, ORGANIZATION, EVENT, DOCUMENT
    risk_level: str = "MEDIUM"
    risk_score: float = 0.5
    attributes: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)

class ParsedRelationship(BaseModel):
    id: str
    source_id: str
    target_id: str
    type: str  # CALLS, TRANSFERRED_TO, ASSOCIATED_WITH, VISITED, LOCATED_AT, MENTIONED_IN, OWNS, USES
    confidence: float = 0.85
    weight: float = 1.0
    attributes: Dict[str, Any] = Field(default_factory=dict)
    timestamp: Optional[str] = None
    evidence_id: Optional[str] = None

class IngestionSummary(BaseModel):
    status: str = "SUCCESS"
    filename: str
    source_type: str  # CDR, UPI_FINANCIAL, FIR_REPORT, UNSTRUCTURED_TEXT
    total_records_processed: int
    entities_created_count: int
    relationships_created_count: int
    new_entities: List[ParsedEntity] = Field(default_factory=list)
    new_relationships: List[ParsedRelationship] = Field(default_factory=list)
    evidence_id: str
    message: str = "Data successfully ingested into intelligence graph."
    warnings: List[str] = Field(default_factory=list)

class TextInputIngest(BaseModel):
    text: str
    title: Optional[str] = "Pasted Intelligence Field Report"
    source_type: Optional[str] = "FIR_REPORT"
