from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class RelationshipType(str, Enum):
    KNOWS = "KNOWS"
    CALLS = "CALLS"
    MESSAGED = "MESSAGED"
    TRANSFERRED_TO = "TRANSFERRED_TO"
    OWNS = "OWNS"
    VISITED = "VISITED"
    WORKS_FOR = "WORKS_FOR"
    ASSOCIATED_WITH = "ASSOCIATED_WITH"
    PARTICIPATED_IN = "PARTICIPATED_IN"
    LOCATED_AT = "LOCATED_AT"
    USES = "USES"
    CONNECTED_TO = "CONNECTED_TO"
    MENTIONED_IN = "MENTIONED_IN"

class RelationshipBase(BaseModel):
    source_id: str
    target_id: str
    type: RelationshipType
    confidence: float = Field(0.8, ge=0.0, le=1.0)
    weight: float = Field(1.0, ge=0.0)
    attributes: Dict[str, Any] = Field(default_factory=dict)
    
    # Temporal Attributes
    start_time: Optional[str] = Field(None, description="Relationship validity start ISO timestamp")
    end_time: Optional[str] = Field(None, description="Relationship validity end ISO timestamp")
    timestamp: Optional[str] = Field(None, description="Primary event/occurrence timestamp")

    # Evidence & Provenance Metadata
    source_type: Optional[str] = Field(None, description="Source provenance (e.g. CDR, BANK_WIRE, SURVEILLANCE)")
    source_reference_id: Optional[str] = Field(None, description="Raw source log or file identifier")
    evidence_id: Optional[str] = Field(None, description="Reference ID to linked evidence record")
    extraction_method: Optional[str] = Field("AUTOMATED_NLP", description="Method of extraction")

class RelationshipCreate(RelationshipBase):
    pass

class RelationshipResponse(RelationshipBase):
    id: str
    source_name: Optional[str] = None
    target_name: Optional[str] = None
