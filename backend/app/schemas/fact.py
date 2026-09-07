from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class FactType(str, Enum):
    DOCUMENT_FACT = "DOCUMENT_FACT"
    ANALYTICAL_INFERENCE = "ANALYTICAL_INFERENCE"
    UNRESOLVED_CONFLICT = "UNRESOLVED_CONFLICT"

class EvidenceProvenance(BaseModel):
    source_document_id: Optional[str] = Field(None, description="Unique ID of source document")
    page_number: Optional[int] = Field(None, description="Page number in source document if applicable")
    line_number: Optional[int] = Field(None, description="Line number in source document if applicable")
    start_offset: Optional[int] = Field(None, description="Character start offset in text if applicable")
    end_offset: Optional[int] = Field(None, description="Character end offset in text if applicable")
    row_number: Optional[int] = Field(None, description="CSV row index if applicable")
    snippet: Optional[str] = Field(None, description="Short source text snippet supporting the observation")
    is_partial: bool = Field(False, description="Flag indicating if provenance details are partial rather than exact")

