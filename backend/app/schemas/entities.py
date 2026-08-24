from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class EntityType(str, Enum):
    PERSON = "PERSON"
    ORGANIZATION = "ORGANIZATION"
    LOCATION = "LOCATION"
    VEHICLE = "VEHICLE"
    PHONE = "PHONE"
    ACCOUNT = "ACCOUNT"
    CASE = "CASE"
    EVENT = "EVENT"
    DOCUMENT = "DOCUMENT"

class RiskLevel(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"

class EntityBase(BaseModel):
    name: str = Field(..., description="Display label or identifier")
    type: EntityType
    risk_level: RiskLevel = RiskLevel.MEDIUM
    risk_score: float = Field(0.5, ge=0.0, le=1.0)
    attributes: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)

class EntityCreate(EntityBase):
    pass

class EntityResponse(EntityBase):
    id: str
    created_at: str
    updated_at: str
    connection_count: int = 0
    is_bridge_node: bool = False
    betweenness_centrality: float = 0.0
