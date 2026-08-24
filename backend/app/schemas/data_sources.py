from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class SourceType(str, Enum):
    STRUCTURED_LOGS = "STRUCTURED_LOGS"
    UNSTRUCTURED_TEXT = "UNSTRUCTURED_TEXT"
    CALL_METADATA = "CALL_METADATA"
    FINANCIAL_TRANSFERS = "FINANCIAL_TRANSFERS"
    ANONYMOUS_TIP = "ANONYMOUS_TIP"

class SourceStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PROCESSING = "PROCESSING"
    PAUSED = "PAUSED"
    ERROR = "ERROR"

class DataSourceBase(BaseModel):
    name: str
    source_type: SourceType
    description: str
    confidence_score: float = Field(0.9, ge=0.0, le=1.0)
    status: SourceStatus = SourceStatus.ACTIVE
    records_ingested: int = 0

class DataSourceCreate(DataSourceBase):
    pass

class DataSourceResponse(DataSourceBase):
    id: str
    last_ingested_at: str
