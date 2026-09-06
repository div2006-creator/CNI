from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.reports.dossier_engine import DossierEngine

router = APIRouter(prefix="/reports", tags=["Reports & Dossiers"])


@router.get("/summary")
def get_report_summary():
    """Retrieve report generation template metadata."""
    return {
        "report_id": "CNI-INTEL-REPORT-001",
        "title": "Operation NorthStar Executive Intelligence Briefing",
        "case_number": "INV-2026-0891",
        "classification": "RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT",
        "primary_targets": ["Subject Alpha (person-101)", "Vortex Trading Corp (org-201)"],
        "key_findings": [
            "High-velocity money transfer of $500,000 to Crypto Wallet 0x7a8F",
            "Bridge entity Subject Bravo connects primary orchestrator to field logistics group"
        ]
    }


@router.get("/dossier/{case_id}")
def get_case_dossier(case_id: str):
    """
    Generate complete auditable evidence dossier for a case, complete with SHA-256 tamper-evident integrity fingerprint.
    """
    return DossierEngine.generate_dossier(case_id=case_id)


@router.post("/generate-hash")
def generate_hash(payload: Dict[str, Any]):
    """
    Compute deterministic SHA-256 tamper-evident fingerprint for arbitrary dossier or report payload.
    """
    raw_hash = DossierEngine.compute_dossier_hash(payload)
    return {
        "integrity_fingerprint": f"sha256:{raw_hash}",
        "computed_hash": raw_hash,
        "hash_algorithm": "SHA-256"
    }


@router.post("/verify-hash")
def verify_hash(payload: Dict[str, Any]):
    """
    Verify tamper-evident integrity of a dossier payload against its embedded fingerprint.
    """
    return DossierEngine.verify_dossier(payload)
