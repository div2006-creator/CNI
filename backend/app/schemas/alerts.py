from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AlertSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class AlertStatus(str, Enum):
    NEW = "NEW"
    UNDER_REVIEW = "UNDER_REVIEW"
    DISMISSED = "DISMISSED"
    RESOLVED = "RESOLVED"

class AlertBase(BaseModel):
    title: str
    pattern_type: str
    description: str
    severity: AlertSeverity
    status: AlertStatus = AlertStatus.NEW
    risk_score: float = Field(0.5, ge=0.0, le=1.0)
    related_entity_ids: List[str] = Field(default_factory=list)
    explanation: str

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: str
    created_at: str
    updated_at: str
