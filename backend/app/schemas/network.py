from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.entities import EntityResponse
from app.schemas.relationships import RelationshipResponse

class NetworkNode(BaseModel):
    id: str
    label: str
    type: str
    risk_level: str
    risk_score: float
    properties: Dict[str, Any]

class NetworkEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str
    confidence: float
    weight: float
    properties: Dict[str, Any]

class NetworkGraphResponse(BaseModel):
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
    total_nodes: int
    total_edges: int

class ShortestPathResponse(BaseModel):
    found: bool
    path_nodes: List[NetworkNode] = []
    path_edges: List[NetworkEdge] = []
    distance: int = -1
