import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.reports.dossier_engine import DossierEngine

client = TestClient(app)


def test_dossier_generation_completeness():
    dossier = DossierEngine.generate_dossier("INV-2026-0891")
    
    assert dossier["case_metadata"]["case_id"] == "INV-2026-0891"
    assert "disclaimer" in dossier["case_metadata"]
    assert "INVESTIGATION SUPPORT ONLY" in dossier["case_metadata"]["disclaimer"]
    
    assert dossier["executive_summary"]["total_entities_analyzed"] >= 5
    assert len(dossier["target_entity_profiles"]) >= 1
    assert "evidentiary_signals_and_confidence" in dossier
    assert "financial_intelligence_summary" in dossier
    assert "investigator_verification_audit_log" in dossier
    
    # Check fingerprint presence
    assert "integrity_fingerprint" in dossier
    assert dossier["integrity_fingerprint"].startswith("sha256:")


def test_dossier_integrity_verification_and_tampering():
    dossier = DossierEngine.generate_dossier("INV-2026-0891")
    
    # 1. Verify original intact dossier
    verification = DossierEngine.verify_dossier(dossier)
    assert verification["valid"] is True
    assert "Integrity verified" in verification["reason"]
    
    # 2. Tamper with a field
    tampered_dossier = dict(dossier)
    tampered_dossier["executive_summary"]["total_entities_analyzed"] = 9999
    
    tamper_result = DossierEngine.verify_dossier(tampered_dossier)
    assert tamper_result["valid"] is False
    assert "TAMPER WARNING" in tamper_result["reason"]


def test_reports_api_endpoints():
    # 1. GET dossier endpoint
    res = client.get("/api/reports/dossier/INV-2026-0891")
    assert res.status_code == 200
    data = res.json()
    assert data["case_metadata"]["case_id"] == "INV-2026-0891"
    assert "integrity_fingerprint" in data
    
    # 2. POST generate-hash endpoint
    sample_payload = {"test_key": "test_val", "score": 100}
    res_hash = client.post("/api/reports/generate-hash", json=sample_payload)
    assert res_hash.status_code == 200
    hash_data = res_hash.json()
    assert "integrity_fingerprint" in hash_data
    assert hash_data["hash_algorithm"] == "SHA-256"
    
    # 3. POST verify-hash endpoint
    dossier_to_verify = data
    res_verify = client.post("/api/reports/verify-hash", json=dossier_to_verify)
    assert res_verify.status_code == 200
    v_data = res_verify.json()
    assert v_data["valid"] is True
