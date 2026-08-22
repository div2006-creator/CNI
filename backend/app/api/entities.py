from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.entities import EntityResponse, EntityCreate, EntityType, RiskLevel
from app.graph.mock_driver import MockInMemoryGraphDriver

router = APIRouter(prefix="/entities", tags=["Entities"])
graph_driver = MockInMemoryGraphDriver()

@router.get("", response_model=List[EntityResponse])
def get_entities(
    type: Optional[EntityType] = Query(None, description="Filter by entity type"),
    min_risk: float = Query(0.0, ge=0.0, le=1.0, description="Minimum risk score threshold"),
    search: Optional[str] = Query(None, description="Search query string")
):
    """Retrieve tracked entities with optional search and type filtering."""
    raw_graph = graph_driver.get_network_graph(
        entity_types=[type.value] if type else None,
        min_risk=min_risk
    )
    nodes = raw_graph["nodes"]

    if search:
        s_lower = search.lower()
        nodes = [n for n in nodes if s_lower in n["name"].lower() or any(s_lower in t.lower() for t in n.get("tags", []))]

    results = []
    for n in nodes:
        entity_data = graph_driver.get_entity_by_id(n["id"])
        if entity_data:
            results.append(entity_data)
    return results

@router.get("/{entity_id}", response_model=EntityResponse)
def get_entity_detail(entity_id: str):
    """Fetch detailed metadata and connection count for a specific entity."""
    entity = graph_driver.get_entity_by_id(entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_id}' not found.")
    return entity

@router.post("", response_model=EntityResponse, status_code=201)
def create_entity(entity: EntityCreate):
    """Create a new entity record in the system."""
    import uuid, datetime
    new_id = f"entity-{str(uuid.uuid4())[:8]}"
    now = datetime.datetime.utcnow().isoformat() + "Z"
    node_data = {
        "id": new_id,
        "name": entity.name,
        "type": entity.type.value,
        "risk_level": entity.risk_level.value,
        "risk_score": entity.risk_score,
        "attributes": entity.attributes,
        "tags": entity.tags,
        "created_at": now,
        "updated_at": now,
        "connection_count": 0
    }
    graph_driver.add_node(node_data)
    return node_data
