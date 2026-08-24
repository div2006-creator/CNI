from fastapi import APIRouter, Query
from typing import Optional, List
from app.schemas.network import NetworkGraphResponse, NetworkNode, NetworkEdge
from app.graph.store import graph_driver

router = APIRouter(prefix="/timeline", tags=["Temporal Graph Analysis"])

@router.get("", response_model=NetworkGraphResponse)
def get_temporal_graph(
    start_date: Optional[str] = Query(None, description="Filter start ISO date"),
    end_date: Optional[str] = Query(None, description="Filter end ISO date")
):
    """Retrieve temporal network graph state bounded by date range filters."""
    raw = graph_driver.get_network_graph()

    edges = raw["edges"]
    if start_date:
        edges = [e for e in edges if e.get("timestamp", "9999") >= start_date or e.get("start_time", "9999") >= start_date]
    if end_date:
        edges = [e for e in edges if e.get("timestamp", "0000") <= end_date or e.get("start_time", "0000") <= end_date]

    valid_node_ids = set()
    for e in edges:
        valid_node_ids.add(e["source_id"])
        valid_node_ids.add(e["target_id"])

    nodes = [n for n in raw["nodes"] if n["id"] in valid_node_ids or not (start_date or end_date)]

    return NetworkGraphResponse(
        nodes=[
            NetworkNode(
                id=n["id"],
                label=n["name"],
                type=n["type"],
                risk_level=n["risk_level"],
                risk_score=n["risk_score"],
                properties=n.get("attributes", {})
            )
            for n in nodes
        ],
        edges=[
            NetworkEdge(
                id=e["id"],
                source=e["source_id"],
                target=e["target_id"],
                type=e["type"],
                confidence=e["confidence"],
                weight=e["weight"],
                properties=e.get("attributes", {})
            )
            for e in edges
        ],
        total_nodes=len(nodes),
        total_edges=len(edges)
    )
