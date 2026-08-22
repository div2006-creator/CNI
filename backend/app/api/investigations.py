from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.investigations import InvestigationResponse, InvestigationCreate
from data.synthetic.seed_data import get_synthetic_dataset

router = APIRouter(prefix="/investigations", tags=["Investigations"])
synthetic_cases = get_synthetic_dataset()["investigations"]

@router.get("", response_model=List[InvestigationResponse])
def list_investigations():
    """List active investigation case files."""
    return synthetic_cases

@router.get("/{case_id}", response_model=InvestigationResponse)
def get_investigation_detail(case_id: str):
    """Retrieve detailed investigation case metadata."""
    for c in synthetic_cases:
        if c["id"] == case_id or c["case_number"] == case_id:
            return c
    raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")

@router.post("", response_model=InvestigationResponse, status_code=201)
def create_investigation(case_in: InvestigationCreate):
    """Open a new investigation case file."""
    import uuid, datetime
    new_id = f"case-{str(uuid.uuid4())[:8]}"
    now = datetime.datetime.utcnow().isoformat() + "Z"
    new_case = {
        "id": new_id,
        "case_number": case_in.case_number,
        "title": case_in.title,
        "summary": case_in.summary,
        "lead_investigator": case_in.lead_investigator,
        "priority": case_in.priority.value,
        "status": case_in.status.value,
        "assigned_entity_ids": case_in.assigned_entity_ids,
        "tags": case_in.tags,
        "created_at": now,
        "updated_at": now,
        "notes_count": 0
    }
    synthetic_cases.append(new_case)
    return new_case
