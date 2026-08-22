from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.alerts import AlertResponse, AlertCreate
from data.synthetic.seed_data import get_synthetic_dataset

router = APIRouter(prefix="/alerts", tags=["Alerts"])
synthetic_alerts = get_synthetic_dataset()["alerts"]

@router.get("", response_model=List[AlertResponse])
def list_alerts():
    """Retrieve active suspicious pattern alerts."""
    return synthetic_alerts

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert_detail(alert_id: str):
    """Retrieve details for a specific alert."""
    for a in synthetic_alerts:
        if a["id"] == alert_id:
            return a
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found.")

@router.post("", response_model=AlertResponse, status_code=201)
def create_alert(alert_in: AlertCreate):
    """Register a new pattern alert."""
    import uuid, datetime
    new_id = f"alert-{str(uuid.uuid4())[:8]}"
    now = datetime.datetime.utcnow().isoformat() + "Z"
    new_alert = {
        "id": new_id,
        "title": alert_in.title,
        "pattern_type": alert_in.pattern_type,
        "description": alert_in.description,
        "severity": alert_in.severity.value,
        "status": alert_in.status.value,
        "risk_score": alert_in.risk_score,
        "related_entity_ids": alert_in.related_entity_ids,
        "explanation": alert_in.explanation,
        "created_at": now,
        "updated_at": now
    }
    synthetic_alerts.append(new_alert)
    return new_alert
