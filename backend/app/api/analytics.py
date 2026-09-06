from fastapi import APIRouter
from app.schemas.analytics import NetworkAnalyticsResponse, FinancialAnalyticsResponse
from app.graph.store import graph_driver
from app.analytics.network_analytics import NetworkAnalyticsEngine
from app.analytics.financial_analytics import FinancialAnalyticsEngine

router = APIRouter(prefix="/analytics", tags=["Network & Financial Analytics"])

@router.get("/network", response_model=NetworkAnalyticsResponse)
def get_network_analytics():
    """
    Computes graph network centrality, community detection clusters,
    bridge node identification, and topological anomalies.
    """
    return NetworkAnalyticsEngine.compute_network_analytics(graph_driver)

@router.get("/financial", response_model=FinancialAnalyticsResponse)
def get_financial_analytics():
    """
    Extracts financial transaction network, candidate layering indicators,
    candidate smurfing indicators, circular transfer patterns, and money flow stage breakdown.
    """
    return FinancialAnalyticsEngine.analyze_financial_network(graph_driver)
