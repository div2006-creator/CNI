from typing import Optional
from pydantic import BaseModel, Field

class SourceDocument(BaseModel):
    source_document_id: str = Field(..., description="Unique source document ID e.g. doc-fir-001")
    case_id: str = Field("DEMO-CASE-001", description="Associated investigation case ID")
    filename: str
    source_type: str = Field("UNSTRUCTURED_TEXT", description="CDR, BANK_WIRE, FIR_REPORT, SURVEILLANCE_REPORT, etc.")
    ingested_at: str
    checksum: Optional[str] = None
    status: str = Field("PROCESSED", description="ACTIVE, PROCESSING, PROCESSED, ERROR")
    record_count: int = 0
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
