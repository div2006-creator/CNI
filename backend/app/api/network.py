from fastapi import APIRouter, Query
from typing import List, Optional
from app.schemas.network import NetworkGraphResponse, ShortestPathResponse, NetworkNode, NetworkEdge
from app.graph.mock_driver import MockInMemoryGraphDriver

router = APIRouter(prefix="/network", tags=["Network Analysis"])
graph_driver = MockInMemoryGraphDriver()

@router.get("", response_model=NetworkGraphResponse)
def get_network_graph(
    min_risk: float = Query(0.0, ge=0.0, le=1.0, description="Minimum risk score threshold"),
    entity_types: Optional[List[str]] = Query(None, description="Entity types filter list")
):
    """Fetch network graph formatted for visual graph renders (Cytoscape.js)."""
    raw = graph_driver.get_network_graph(entity_types=entity_types, min_risk=min_risk)

    nodes = [
        NetworkNode(
            id=n["id"],
            label=n["name"],
            type=n["type"],
            risk_level=n["risk_level"],
            risk_score=n["risk_score"],
            properties=n.get("attributes", {})
        )
        for n in raw["nodes"]
    ]

    edges = [
        NetworkEdge(
            id=e["id"],
            source=e["source_id"],
            target=e["target_id"],
            type=e["type"],
            confidence=e["confidence"],
            weight=e["weight"],
            properties=e.get("attributes", {})
        )
        for e in raw["edges"]
    ]

    return NetworkGraphResponse(
        nodes=nodes,
        edges=edges,
        total_nodes=len(nodes),
        total_edges=len(edges)
    )

@router.get("/subgraph/{entity_id}", response_model=NetworkGraphResponse)
def get_entity_subgraph(
    entity_id: str,
    depth: int = Query(1, ge=1, le=3, description="Exploration depth")
):
    """Fetch N-hop connection graph surrounding a target entity."""
    raw = graph_driver.get_entity_neighbors(entity_id=entity_id, depth=depth)

    nodes = [
        NetworkNode(
            id=n["id"],
            label=n["name"],
            type=n["type"],
            risk_level=n["risk_level"],
            risk_score=n["risk_score"],
            properties=n.get("attributes", {})
        )
        for n in raw["nodes"]
    ]

    edges = [
        NetworkEdge(
            id=e["id"],
            source=e["source_id"],
            target=e["target_id"],
            type=e["type"],
            confidence=e["confidence"],
            weight=e["weight"],
            properties=e.get("attributes", {})
        )
        for e in raw["edges"]
    ]

    return NetworkGraphResponse(
        nodes=nodes,
        edges=edges,
        total_nodes=len(nodes),
        total_edges=len(edges)
    )

@router.get("/shortest-path", response_model=ShortestPathResponse)
def get_shortest_path(
    source_id: str = Query(..., description="Source entity ID"),
    target_id: str = Query(..., description="Target entity ID")
):
    """Compute the shortest investigative link path between two entities."""
    raw_path = graph_driver.find_shortest_path(source_id=source_id, target_id=target_id)
    if not raw_path["found"]:
        return ShortestPathResponse(found=False, path_nodes=[], path_edges=[], distance=-1)

    nodes = [
        NetworkNode(
            id=n["id"],
            label=n["name"],
            type=n["type"],
            risk_level=n["risk_level"],
            risk_score=n["risk_score"],
            properties=n.get("attributes", {})
        )
        for n in raw_path["path_nodes"]
    ]

    edges = [
        NetworkEdge(
            id=e["id"],
            source=e["source_id"],
            target=e["target_id"],
            type=e["type"],
            confidence=e["confidence"],
            weight=e["weight"],
            properties=e.get("attributes", {})
        )
        for e in raw_path["path_edges"]
    ]

    return ShortestPathResponse(
        found=True,
        path_nodes=nodes,
        path_edges=edges,
        distance=raw_path["distance"]
    )
