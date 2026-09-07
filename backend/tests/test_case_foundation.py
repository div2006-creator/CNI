import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.graph.store import graph_driver
from app.schemas.fact import FactType, EvidenceProvenance
from app.schemas.evidence import EvidenceCreate
from app.schemas.predictive import InvestigatorReviewRequest, ReviewAction
from app.predictive.review_service import InvestigatorReviewService

client = TestClient(app)

def test_fact_type_enum_and_provenance_schema():
    assert FactType.DOCUMENT_FACT.value == "DOCUMENT_FACT"
    assert FactType.ANALYTICAL_INFERENCE.value == "ANALYTICAL_INFERENCE"
    assert FactType.UNRESOLVED_CONFLICT.value == "UNRESOLVED_CONFLICT"

    provenance = EvidenceProvenance(
        source_document_id="doc-fir-001",
        page_number=3,
        line_number=42,
        start_offset=120,
        end_offset=240,
        row_number=15
    )
    assert provenance.source_document_id == "doc-fir-001"
    assert provenance.line_number == 42
    assert provenance.start_offset == 120

def test_case_isolation_in_graph_driver():
    # Insert node & edge for CASE-ALPHA
    node_a = {
        "id": "person-alpha-1",
        "name": "Target Alpha",
        "type": "PERSON",
        "risk_score": 0.85,
        "risk_level": "HIGH",
        "case_id": "CASE-ALPHA"
    }
    node_a_2 = {
        "id": "phone-alpha-2",
        "name": "+91 9999911111",
        "type": "PHONE",
        "risk_score": 0.60,
        "risk_level": "MEDIUM",
        "case_id": "CASE-ALPHA"
    }
    edge_a = {
        "id": "rel-alpha-1",
        "source_id": "person-alpha-1",
        "target_id": "phone-alpha-2",
        "type": "USES",
        "case_id": "CASE-ALPHA",
        "fact_type": "DOCUMENT_FACT"
    }

    # Insert node & edge for CASE-BETA
    node_b = {
        "id": "person-beta-1",
        "name": "Target Beta",
        "type": "PERSON",
        "risk_score": 0.90,
        "risk_level": "CRITICAL",
        "case_id": "CASE-BETA"
    }
    node_b_2 = {
        "id": "phone-beta-2",
        "name": "+91 8888822222",
        "type": "PHONE",
        "risk_score": 0.70,
        "risk_level": "HIGH",
        "case_id": "CASE-BETA"
    }
    edge_b = {
        "id": "rel-beta-1",
        "source_id": "person-beta-1",
        "target_id": "phone-beta-2",
        "type": "USES",
        "case_id": "CASE-BETA",
        "fact_type": "DOCUMENT_FACT"
    }

    graph_driver.upsert_node(node_a, case_id="CASE-ALPHA")
    graph_driver.upsert_node(node_a_2, case_id="CASE-ALPHA")
    graph_driver.upsert_edge(edge_a, case_id="CASE-ALPHA")

    graph_driver.upsert_node(node_b, case_id="CASE-BETA")
    graph_driver.upsert_node(node_b_2, case_id="CASE-BETA")
    graph_driver.upsert_edge(edge_b, case_id="CASE-BETA")

    # Fetch CASE-ALPHA graph
    alpha_graph = graph_driver.get_network_graph(case_id="CASE-ALPHA")
    alpha_node_ids = {n["id"] for n in alpha_graph["nodes"]}
    alpha_edge_ids = {e["id"] for e in alpha_graph["edges"]}

    assert "person-alpha-1" in alpha_node_ids
    assert "phone-alpha-2" in alpha_node_ids
    assert "rel-alpha-1" in alpha_edge_ids
    assert "person-beta-1" not in alpha_node_ids
    assert "rel-beta-1" not in alpha_edge_ids

    # Fetch CASE-BETA graph
    beta_graph = graph_driver.get_network_graph(case_id="CASE-BETA")
    beta_node_ids = {n["id"] for n in beta_graph["nodes"]}
    beta_edge_ids = {e["id"] for e in beta_graph["edges"]}

    assert "person-beta-1" in beta_node_ids
    assert "phone-beta-2" in beta_node_ids
    assert "rel-beta-1" in beta_edge_ids
    assert "person-alpha-1" not in beta_node_ids
    assert "rel-alpha-1" not in beta_edge_ids

def test_cross_case_entity_canonical_identity():
    # Same phone number appearing in CASE-1 and CASE-2
    shared_phone_c1 = {
        "id": "shared-phone-100",
        "name": "+91 9876500000",
        "type": "PHONE",
        "case_id": "CASE-1"
    }
    shared_phone_c2 = {
        "name": "+91 9876500000",
        "type": "PHONE",
        "case_id": "CASE-2"
    }

    n1 = graph_driver.upsert_node(shared_phone_c1, case_id="CASE-1")
    n2 = graph_driver.upsert_node(shared_phone_c2, case_id="CASE-2")

    # Should reuse same canonical node ID
    assert n1["id"] == n2["id"]
    # Should record both cases in case_ids
    merged_node = graph_driver.nodes[n1["id"]]
    assert "CASE-1" in merged_node["case_ids"]
    assert "CASE-2" in merged_node["case_ids"]

def test_investigator_review_status_persistence():
    cand_data = {
        "candidate_id": "cand-test-99",
        "source_entity_id": "person-alpha-1",
        "source_entity_name": "Target Alpha",
        "target_entity_id": "person-beta-1",
        "target_entity_name": "Target Beta",
        "candidate_score": 0.88,
        "suggested_relationship_type": "ASSOCIATED_WITH",
        "case_id": "CASE-TEST"
    }

    req = InvestigatorReviewRequest(
        candidate_id="cand-test-99",
        action=ReviewAction.CONFIRM,
        investigator_id="INV-LEAD-01",
        notes="Verified via overlapping call records.",
        case_id="CASE-TEST"
    )

    res = InvestigatorReviewService.process_review(req, cand_data)
    assert res["status"] == "CONFIRMED"
    assert res["created_relationship_id"] is not None

    # Check updated edge in graph_driver
    edge = graph_driver.edges.get(res["created_relationship_id"])
    assert edge is not None
    assert edge["status"] == "SUPPORTED"
    assert edge["fact_type"] == "ANALYTICAL_INFERENCE"
    assert edge["case_id"] == "CASE-TEST"

def test_ingestion_api_supports_case_id():
    text_payload = {
        "text": "Subject Gamma (+91 9111122222) transferred funds to Account ACC-9900.",
        "title": "Field Surveillance Report 401",
        "source_type": "FIR_REPORT",
        "case_id": "CASE-GAMMA-01"
    }

    res = client.post("/api/ingest/text", json=text_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["case_id"] == "CASE-GAMMA-01"
