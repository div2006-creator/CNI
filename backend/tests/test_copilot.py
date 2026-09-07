import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.graph.store import graph_driver
from app.copilot.copilot_engine import CopilotEngine

client = TestClient(app)

def test_alpha_delta_connection_query():
    query = "Why are Alpha and Delta connected?"
    res = CopilotEngine.answer_query(query, graph_driver)
    assert "query" in res
    assert "answer" in res
    assert "confidence" in res

def test_hinglish_query_resolution():
    query = "Alpha aur Delta ka connection batao"
    res = CopilotEngine.answer_query(query, graph_driver)
    assert "answer" in res
    assert isinstance(res["reasoning"], list)

def test_indirect_path_query():
    query = "Find indirect connections between Subject Alpha and Subject Charlie"
    res = CopilotEngine.answer_query(query, graph_driver)
    assert "answer" in res
    assert isinstance(res["reasoning"], list)

def test_copilot_api_endpoint():
    payload = {"query": "Why are Alpha and Delta connected?"}
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "confidence" in data
