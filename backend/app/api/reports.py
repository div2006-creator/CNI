from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.graph.store import graph_driver
from app.reports.dossier_engine import DossierEngine

router = APIRouter(prefix="/reports", tags=["Reports & Dossiers"])

@router.get("/summary")
def get_report_summary():
    """Retrieve report generation template metadata based on active graph topology."""
    network = graph_driver.get_network_graph()
    nodes = network.get("nodes", [])
    
    top_nodes = sorted(nodes, key=lambda n: n.get("risk_score", 0.0), reverse=True)[:3]
    targets = [f"{n.get('name')} ({n.get('type')})" for n in top_nodes] if top_nodes else ["No target entities currently loaded"]

    return {
        "report_id": "CNI-INTEL-REPORT-ACTIVE",
        "title": "Active Case Intelligence Summary",
        "case_number": "INV-CASE-ACTIVE",
        "classification": "RESTRICTED // LAW ENFORCEMENT INVESTIGATION SUPPORT",
        "primary_targets": targets,
        "key_findings": [
            f"Active knowledge graph contains {network.get('total_nodes', 0)} total entities and {network.get('total_edges', 0)} relationships.",
            "All findings are dynamically compiled from active ingested evidence feeds."
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
