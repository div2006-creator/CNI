import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.evidence.reliability import get_source_reliability, ReliabilityLevel
from app.evidence.confidence import ConfidenceEngine
from app.graph.store import graph_driver

client = TestClient(app)

def test_source_reliability_mapping():
    level, weight = get_source_reliability("CDR")
    assert level == ReliabilityLevel.HIGH
    assert weight == 0.95

    level_fin, weight_fin = get_source_reliability("BANK_WIRE")
    assert level_fin == ReliabilityLevel.HIGH
    assert weight_fin == 0.95

    level_soc, weight_soc = get_source_reliability("SOCIAL_MEDIA")
    assert level_soc == ReliabilityLevel.LOW
    assert weight_soc == 0.40

def test_confidence_engine_evaluation():
    rel = {
        "id": "rel-test-99",
        "source_id": "person-101",
        "target_id": "person-104",
        "type": "ASSOCIATED_WITH",
        "start_time": "2026-08-01T00:00:00Z",
        "attributes": {
            "call_count_30d": 25,
            "co_location_events": 4,
            "amount": "$500,000",
            "location_mismatch": "Location mismatch on Aug 17"
        }
    }
    evidence_items = [
        {
            "id": "ev-test-1",
            "title": "Call Detail Intercept",
            "source_type": "CDR",
            "content_snippet": "Calls logged between subjects.",
            "timestamp": "2026-08-01T10:00:00Z"
        },
        {
            "id": "ev-test-2",
            "title": "Wire Record",
            "source_type": "BANK_WIRE",
            "content_snippet": "Bank wire transfer completed.",
            "timestamp": "2026-08-05T14:00:00Z"
        }
    ]

    res = ConfidenceEngine.evaluate_relationship(
        relationship=rel,
        linked_evidence_items=evidence_items,
        common_neighbors_count=2
    )

    assert res["relationship_id"] == "rel-test-99"
    assert res["confidence_percentage"] > 0
    assert len(res["score_breakdown"]) >= 5
    assert any("Communication pattern" in s["signal_name"] for s in res["score_breakdown"])
    assert any("Contradiction penalty" in s["signal_name"] for s in res["score_breakdown"])
    assert len(res["supporting_evidence"]) >= 3
    assert len(res["contradicting_evidence"]) >= 1
    assert len(res["timeline"]) == 2

def test_relationship_evidence_endpoint():
    graph_driver.upsert_edge({"id": "rel-01", "source_id": "p1", "target_id": "p2", "type": "ASSOCIATED_WITH"})
    # Test GET /api/evidence/relationship/rel-01
    response = client.get("/api/evidence/relationship/rel-01")
    assert response.status_code == 200
    data = response.json()
    assert "overall_confidence" in data
    assert "score_breakdown" in data
    assert "supporting_evidence" in data
    assert "source_reliability" in data


def test_create_and_merge_evidence():
    payload = {
        "title": "New Field Intelligence Intercept",
        "source_type": "CDR",
        "source_id": "CDR-2026-X99",
        "content_snippet": "Intercepted encrypted call metadata between targets.",
        "confidence": 0.95,
        "timestamp": "2026-09-04T10:00:00Z",
        "extraction_method": "AUTOMATED_NLP",
        "linked_entity_ids": ["person-101", "person-102"],
        "linked_relationship_ids": ["rel-01"]
    }
    response = client.post("/api/evidence", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Field Intelligence Intercept"
    assert "id" in data
