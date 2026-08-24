from fastapi import APIRouter
from typing import List
from app.schemas.audit import AuditLogEntry
from data.synthetic.seed_data import get_synthetic_dataset

router = APIRouter(prefix="/audit", tags=["Audit Trail"])
synthetic_audit = get_synthetic_dataset().get("audit_logs", [])

@router.get("", response_model=List[AuditLogEntry])
def get_audit_trail():
    """Retrieve audit log history of investigator actions and graph queries."""
    return synthetic_audit

@router.post("", response_model=AuditLogEntry, status_code=201)
def log_audit_action(entry: AuditLogEntry):
    """Log an investigator action into audit history."""
    synthetic_audit.insert(0, entry.dict())
    return entry
