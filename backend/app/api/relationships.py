from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.relationships import RelationshipResponse, RelationshipCreate, RelationshipType
from app.graph.mock_driver import MockInMemoryGraphDriver

router = APIRouter(prefix="/relationships", tags=["Relationships"])
graph_driver = MockInMemoryGraphDriver()

@router.get("", response_model=List[RelationshipResponse])
def get_relationships(
    source_id: Optional[str] = Query(None, description="Filter by source entity ID"),
    target_id: Optional[str] = Query(None, description="Filter by target entity ID"),
    type: Optional[RelationshipType] = Query(None, description="Filter by relationship type")
):
    """Retrieve relationship edges with source/target metadata."""
    raw_graph = graph_driver.get_network_graph()
    edges = raw_graph["edges"]

    if source_id:
        edges = [e for e in edges if e["source_id"] == source_id]
    if target_id:
        edges = [e for e in edges if e["target_id"] == target_id]
    if type:
        edges = [e for e in edges if e["type"] == type.value]

    results = []
    for e in edges:
        src_node = graph_driver.get_entity_by_id(e["source_id"])
        tgt_node = graph_driver.get_entity_by_id(e["target_id"])
        res = dict(e)
        res["source_name"] = src_node["name"] if src_node else e["source_id"]
        res["target_name"] = tgt_node["name"] if tgt_node else e["target_id"]
        results.append(res)

    return results

@router.post("", response_model=RelationshipResponse, status_code=201)
def create_relationship(relationship: RelationshipCreate):
    """Register a new connection edge between two entities."""
    import uuid
    new_id = f"rel-{str(uuid.uuid4())[:8]}"
    edge_data = {
        "id": new_id,
        "source_id": relationship.source_id,
        "target_id": relationship.target_id,
        "type": relationship.type.value,
        "confidence": relationship.confidence,
        "weight": relationship.weight,
        "attributes": relationship.attributes,
        "first_seen": relationship.first_seen,
        "last_seen": relationship.last_seen,
    }
    graph_driver.add_edge(edge_data)
    src_node = graph_driver.get_entity_by_id(relationship.source_id)
    tgt_node = graph_driver.get_entity_by_id(relationship.target_id)
    res = dict(edge_data)
    res["source_name"] = src_node["name"] if src_node else relationship.source_id
    res["target_name"] = tgt_node["name"] if tgt_node else relationship.target_id
    return res
