from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.evidence import EvidenceResponse
from data.synthetic.seed_data import get_synthetic_dataset

router = APIRouter(prefix="/evidence", tags=["Evidence & Provenance"])
synthetic_evidence = get_synthetic_dataset().get("evidence_items", [])

@router.get("", response_model=List[EvidenceResponse])
def list_evidence():
    """Retrieve evidence items linked to graph relationships and entity extractions."""
    return synthetic_evidence

@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence_detail(evidence_id: str):
    """Retrieve details for a specific evidence item."""
    for item in synthetic_evidence:
        if item["id"] == evidence_id or item["source_id"] == evidence_id:
            return item
    raise HTTPException(status_code=404, detail=f"Evidence '{evidence_id}' not found.")
