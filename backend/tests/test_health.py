from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "app_name" in data

def test_entities_endpoint():
    response = client.get("/api/entities")
    assert response.status_code == 200
    entities = response.json()
    assert isinstance(entities, list)
    assert len(entities) > 0

def test_network_endpoint():
    response = client.get("/api/network")
    assert response.status_code == 200
    graph = response.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert graph["total_nodes"] > 0
