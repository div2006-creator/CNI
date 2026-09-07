from enum import Enum
from typing import Dict, Tuple

class ReliabilityLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

# Source type reliability matrix mapping
SOURCE_RELIABILITY_MAP: Dict[str, Tuple[ReliabilityLevel, float]] = {
    "CDR": (ReliabilityLevel.HIGH, 0.95),
    "BANK_WIRE": (ReliabilityLevel.HIGH, 0.95),
    "UPI": (ReliabilityLevel.HIGH, 0.95),
    "FINANCIAL": (ReliabilityLevel.HIGH, 0.95),
    "CORPORATE_FILING": (ReliabilityLevel.HIGH, 0.90),
    "FIR": (ReliabilityLevel.HIGH, 0.90),
    "OFFICIAL_REGISTRY": (ReliabilityLevel.HIGH, 0.90),
    "SURVEILLANCE_REPORT": (ReliabilityLevel.HIGH, 0.85),
    "TELEMETRY_LOG": (ReliabilityLevel.HIGH, 0.85),
    "INTELLIGENCE_REPORT": (ReliabilityLevel.MEDIUM, 0.70),
    "FIELD_INTERCEPT": (ReliabilityLevel.MEDIUM, 0.70),
    "HUMINT": (ReliabilityLevel.MEDIUM, 0.65),
    "SOCIAL_MEDIA": (ReliabilityLevel.LOW, 0.40),
    "COMMUNITY_TIP": (ReliabilityLevel.LOW, 0.35),
}

def get_source_reliability(source_type: str) -> Tuple[ReliabilityLevel, float]:
    """
    Returns (ReliabilityLevel, numeric_weight) for a given source type.
    """
    stype = (source_type or "").upper().strip()
    return SOURCE_RELIABILITY_MAP.get(stype, (ReliabilityLevel.MEDIUM, 0.75))
