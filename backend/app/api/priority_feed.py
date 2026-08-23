from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/priority-feed", tags=["Priority Feed"])

@router.get("", response_model=List[Dict[str, Any]])
def get_priority_intelligence_feed():
    """Retrieve NCIC Command priority intelligence events log."""
    return [
        {"time": "10:42", "event": "Unauthorized Access Attempt", "level": "Critical"},
        {"time": "09:15", "event": "Data Exfiltration Blocked", "level": "High"},
        {"time": "08:30", "event": "New Entity Identified: Group C", "level": "Medium"},
        {"time": "07:55", "event": "Routine Surveillance Update", "level": "Low"},
        {"time": "06:12", "event": "Wiretap Audio Segment Processed", "level": "Low"}
    ]
