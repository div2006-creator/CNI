from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CaseStatus(str, Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"

class CasePriority(str, Enum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class InvestigationBase(BaseModel):
    case_number: str
    title: str
    summary: str
    lead_investigator: str
    priority: CasePriority = CasePriority.HIGH
    status: CaseStatus = CaseStatus.ACTIVE
    assigned_entity_ids: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationResponse(InvestigationBase):
    id: str
    created_at: str
    updated_at: str
    notes_count: int = 0
