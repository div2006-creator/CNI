from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class WhatIfSimRequest(BaseModel):
    removed_node_ids: List[str] = Field(default_factory=list)
    removed_edge_ids: List[str] = Field(default_factory=list)

class NetworkImpactMetrics(BaseModel):
    total_nodes_before: int
    total_nodes_after: int
    total_edges_before: int
    total_edges_after: int
    disconnected_clusters_count: int
    impact_summary: str
    affected_entity_ids: List[str]

class WhatIfSimResult(BaseModel):
    simulation_id: str
    removed_nodes: List[str]
    metrics: NetworkImpactMetrics
    original_nodes_count: int
    simulated_nodes_count: int
