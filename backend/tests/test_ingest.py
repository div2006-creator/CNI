from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ingest_routes_registered_once():
    # Test upload and text endpoints directly via TestClient
    res_text = client.post("/api/ingest/text", json={"text": "Test snippet", "title": "test.txt"})
    assert res_text.status_code == 200

    res_upload = client.post("/api/ingest/upload", files={"file": ("test.csv", "caller,called\n111,222", "text/csv")})
    assert res_upload.status_code == 200

def test_text_ingestion_preserves_response_shape():
    response = client.post(
        "/api/ingest/text",
        json={
            "text": "Subject TestAlpha met accused TestBravo at Warehouse Hub 9.",
            "title": "test_fir_report.txt",
            "source_type": "FIR_REPORT",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "SUCCESS"
    assert payload["filename"] == "test_fir_report.txt"
    assert payload["source_type"] == "FIR_REPORT"
    assert "entities_created_count" in payload
    assert "relationships_created_count" in payload
    assert "new_entities" in payload
    assert "new_relationships" in payload
    assert payload["evidence_id"].startswith("ev-ingest-")
