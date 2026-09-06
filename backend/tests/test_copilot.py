import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.graph.store import graph_driver
from app.copilot.copilot_engine import CopilotEngine

client = TestClient(app)

def test_alpha_delta_connection_query():
    query = "Why are Alpha and Delta connected?"
    res = CopilotEngine.answer_query(query, graph_driver)

    assert res["confidence"] == 0.74
    assert "Alpha and Delta have a possible association" in res["answer"]
    assert len(res["reasoning"]) >= 3
    assert len(res["contradicting_evidence"]) >= 1
    assert "location mismatch" in res["contradicting_evidence"][0].lower()
    assert res["recommended_action"] == "Review the Aug 17 location record."

def test_hinglish_query_resolution():
    query = "Alpha aur Delta ka connection batao"
    res = CopilotEngine.answer_query(query, graph_driver)
    assert res["confidence"] == 0.74
    assert len(res["reasoning"]) >= 3

def test_indirect_path_query():
    query = "Find indirect connections between Subject Alpha and Subject Charlie"
    res = CopilotEngine.answer_query(query, graph_driver)
    assert res["confidence"] == 0.94
    assert "Subject Bravo" in res["answer"]

def test_copilot_api_endpoint():
    payload = {"query": "Why are Alpha and Delta connected?"}
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["confidence"] == 0.74
    assert len(data["contradicting_evidence"]) >= 1
    assert data["recommended_action"] == "Review the Aug 17 location record."
