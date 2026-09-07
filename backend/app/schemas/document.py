from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class ProcessingStatus(str, Enum):
    UPLOADED = "UPLOADED"
    VALIDATING = "VALIDATING"
    PARSING = "PARSING"
    EXTRACTING = "EXTRACTING"
    NORMALIZING = "NORMALIZING"
    LINKING = "LINKING"
    BUILDING_EVIDENCE = "BUILDING_EVIDENCE"
    CHECKING_CONFLICTS = "CHECKING_CONFLICTS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class SourceDocument(BaseModel):
    id: str = Field(..., description="Unique source document ID e.g. doc-fir-001")
    source_document_id: str = Field(..., description="Alias for id for backward compatibility")
    case_id: str = Field("DEMO-CASE-001", description="Associated investigation case ID")
    filename: str
    source_type: str = Field("UNSTRUCTURED_TEXT", description="CDR, BANK_WIRE, FIR_REPORT, SURVEILLANCE_REPORT, etc.")
    content_type: Optional[str] = Field(None, description="MIME type e.g. text/csv, application/json")
    mime_type: Optional[str] = Field(None, description="MIME type alias")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    upload_timestamp: str = Field(..., description="ISO 8601 upload timestamp")
    ingested_at: str = Field(..., description="ISO 8601 ingested at alias")
    processing_status: ProcessingStatus = Field(ProcessingStatus.COMPLETED, description="Current processing lifecycle status")
    status: str = Field("COMPLETED", description="Status string representation")
    processing_error: Optional[str] = Field(None, description="Error details if processing failed")
    content_hash: Optional[str] = Field(None, description="SHA-256 content hash calculated from file bytes")
    checksum: Optional[str] = Field(None, description="Checksum alias")
    record_count: int = 0
    original_metadata: Dict[str, Any] = Field(default_factory=dict, description="Header names, row counts, or raw metadata")

