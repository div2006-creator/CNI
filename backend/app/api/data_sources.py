from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.data_sources import DataSourceResponse, DataSourceCreate
from data.synthetic.seed_data import get_synthetic_dataset

router = APIRouter(prefix="/data-sources", tags=["Data Sources"])
synthetic_sources = get_synthetic_dataset()["data_sources"]

@router.get("", response_model=List[DataSourceResponse])
def list_data_sources():
    """Retrieve intelligence feed sources and ingestion metrics."""
    return synthetic_sources

@router.get("/{source_id}", response_model=DataSourceResponse)
def get_data_source_detail(source_id: str):
    """Retrieve details for a specific intelligence feed."""
    for s in synthetic_sources:
        if s["id"] == source_id:
            return s
    raise HTTPException(status_code=404, detail=f"Data source '{source_id}' not found.")

@router.post("", response_model=DataSourceResponse, status_code=201)
def create_data_source(source_in: DataSourceCreate):
    """Register a new intelligence ingestion feed."""
    import uuid, datetime
    new_id = f"ds-{str(uuid.uuid4())[:8]}"
    now = datetime.datetime.utcnow().isoformat() + "Z"
    new_source = {
        "id": new_id,
        "name": source_in.name,
        "source_type": source_in.source_type.value,
        "description": source_in.description,
        "confidence_score": source_in.confidence_score,
        "status": source_in.status.value,
        "records_ingested": source_in.records_ingested,
        "last_ingested_at": now
    }
    synthetic_sources.append(new_source)
    return new_source
