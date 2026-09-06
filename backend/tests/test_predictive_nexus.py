import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.graph.store import graph_driver
from app.predictive.nexus_engine import PredictiveNexusEngine
from app.predictive.review_service import InvestigatorReviewService

client = TestClient(app)

def test_nexus_engine_candidate_generation():
    candidates = PredictiveNexusEngine.generate_candidate_links(graph_driver)
    assert len(candidates) >= 1

    cand = candidates[0]
    assert cand["score_percentage"] == 74
    assert cand["classification_label"] == "Possible association"
    assert len(cand["signals"]) >= 4
    assert any(s["signal_name"] == "Shared location" for s in cand["signals"])
    assert any(s["signal_name"] == "Communication pattern" for s in cand["signals"])

def test_investigator_review_confirm():
    payload = {
        "candidate_id": "cand-nexus-01",
        "action": "CONFIRM",
        "investigator_id": "INV-MILLER-04",
        "notes": "Verified via surveillance field log match."
    }
    response = client.post("/api/predictive/review", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "CONFIRMED"
    assert data["created_relationship_id"] is not None
    assert "audit_id" in data

    # Verify edge was inserted into knowledge graph
    rel_id = data["created_relationship_id"]
    assert rel_id in graph_driver.edges

def test_investigator_review_reject():
    payload = {
        "candidate_id": "cand-nexus-02",
        "action": "REJECT",
        "investigator_id": "INV-MILLER-04",
        "notes": "False positive."
    }
    response = client.post("/api/predictive/review", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "REJECTED"

def test_get_predictive_candidates_endpoint():
    response = client.get("/api/predictive/candidates")
    assert response.status_code == 200
    candidates = response.json()
    assert len(candidates) >= 1
    assert candidates[0]["candidate_score"] == 0.74
