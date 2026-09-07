from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CentralityItem(BaseModel):
    id: str
    name: str
    type: str
    degree_centrality: float
    betweenness_centrality: float
    is_bridge_node: bool = False

class CommunityItem(BaseModel):
    community_id: str
    name: str
    node_count: int
    member_node_ids: List[str]
    risk_summary: str

class BridgeNodeItem(BaseModel):
    id: str
    name: str
    type: str
    betweenness_centrality: float
    degree_centrality: float
    risk_level: str
    reason: str

class NetworkAnomalyItem(BaseModel):
    id: str
    title: str
    anomaly_type: str
    severity: str
    target_id: str
    description: str
    betweenness_score: float

class NetworkAnalyticsResponse(BaseModel):
    centrality_metrics: List[CentralityItem]
    communities: List[CommunityItem]
    bridge_nodes: List[BridgeNodeItem]
    anomalies: List[NetworkAnomalyItem]

class MoneyFlowStage(BaseModel):
    stage: int
    stage_name: str
    entity_name: str
    entity_type: str
    amount: str
    timestamp: str

class PatternIndicatorItem(BaseModel):
    id: str
    pattern_type: str  # POTENTIAL_LAYERING_INDICATOR, POTENTIAL_SMURFING_INDICATOR, CIRCULAR_TRANSFER
    title: str
    severity: str
    risk_score: float
    description: str
    source_account: str
    target_account: str
    amount: str
    velocity_seconds: int
    intermediary_count: int
    investigative_lead: str
    disclaimer: str

class FinancialAnalyticsResponse(BaseModel):
    summary: Dict[str, Any]
    flow_stages: List[MoneyFlowStage]
    pattern_indicators: List[PatternIndicatorItem]
    financial_nodes: List[Dict[str, Any]]
    financial_edges: List[Dict[str, Any]]
