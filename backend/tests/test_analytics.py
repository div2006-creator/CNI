import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.graph.store import graph_driver
from app.analytics.network_analytics import NetworkAnalyticsEngine
from app.analytics.financial_analytics import FinancialAnalyticsEngine

client = TestClient(app)

def test_network_analytics_engine():
    res = NetworkAnalyticsEngine.compute_network_analytics(graph_driver)
    assert "centrality_metrics" in res
    assert "communities" in res
    assert "bridge_nodes" in res
    assert "anomalies" in res

    assert len(res["centrality_metrics"]) > 0
    assert len(res["communities"]) > 0
    assert len(res["bridge_nodes"]) > 0

    # Verify bridge node has betweenness centrality
    b_node = res["bridge_nodes"][0]
    assert "betweenness_centrality" in b_node
    assert b_node["betweenness_centrality"] > 0.0

def test_financial_analytics_engine():
    res = FinancialAnalyticsEngine.analyze_financial_network(graph_driver)
    assert "summary" in res
    assert "flow_stages" in res
    assert "pattern_indicators" in res

    assert len(res["flow_stages"]) == 4
    assert len(res["pattern_indicators"]) >= 3

    # Check for layering indicator
    layering = next(p for p in res["pattern_indicators"] if p["pattern_type"] == "POTENTIAL_LAYERING_INDICATOR")
    assert layering is not None
    assert "disclaimer" in layering
    assert "does not constitute proof" in layering["disclaimer"].lower() or "investigator review" in layering["disclaimer"].lower()

    # Check for smurfing indicator
    smurfing = next(p for p in res["pattern_indicators"] if p["pattern_type"] == "POTENTIAL_SMURFING_INDICATOR")
    assert smurfing is not None

def test_network_analytics_endpoint():
    response = client.get("/api/analytics/network")
    assert response.status_code == 200
    data = response.json()
    assert "centrality_metrics" in data
    assert "communities" in data
    assert "bridge_nodes" in data

def test_financial_analytics_endpoint():
    response = client.get("/api/analytics/financial")
    assert response.status_code == 200
    data = response.json()
    assert "flow_stages" in data
    assert "pattern_indicators" in data
    assert "summary" in data
