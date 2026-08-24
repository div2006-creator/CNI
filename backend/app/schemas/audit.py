from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class AuditActionType(str):
    SEARCH = "SEARCH"
    ENTITY_OPENED = "ENTITY_OPENED"
    RELATIONSHIP_INSPECTED = "RELATIONSHIP_INSPECTED"
    EVIDENCE_VIEWED = "EVIDENCE_VIEWED"
    INVESTIGATION_CREATED = "INVESTIGATION_CREATED"
    FINDING_REVIEWED = "FINDING_REVIEWED"
    REPORT_GENERATED = "REPORT_GENERATED"
    WHAT_IF_EXECUTED = "WHAT_IF_EXECUTED"

class AuditLogEntry(BaseModel):
    id: str
    investigator_id: str
    action_type: str
    target_resource: str
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str
