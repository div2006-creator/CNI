from fastapi import APIRouter
from app.graph.store import graph_driver

router = APIRouter(prefix="/reports", tags=["Reports"])

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
