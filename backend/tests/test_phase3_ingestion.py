import pytest
from app.ingestion.engine import IngestionEngine
from app.graph.store import graph_driver
from app.evidence.document_store import document_store
from app.api.evidence import synthetic_evidence
from app.schemas.fact import FactType

def test_case_isolation_entities_and_relationships():
    """
    1. Case A ingestion does not appear in Case B.
    2. Entities from different cases do not merge accidentally.
    3. Relationships remain case-scoped.
    """
    cdr_a = "calling_number,called_number,duration,timestamp,cell_tower\n9876543210,9123456780,120,2026-09-05T10:00:00Z,Tower-Alpha"
    cdr_b = "calling_number,called_number,duration,timestamp,cell_tower\n9876543210,9123456780,120,2026-09-05T10:00:00Z,Tower-Alpha"

    summary_a = IngestionEngine.ingest_content(content=cdr_a, filename="case_a.csv", case_id="TEST-CASE-A")
    summary_b = IngestionEngine.ingest_content(content=cdr_b, filename="case_b.csv", case_id="TEST-CASE-B")

    graph_a = graph_driver.get_network_graph(case_id="TEST-CASE-A")
    graph_b = graph_driver.get_network_graph(case_id="TEST-CASE-B")

    # Nodes in Case A should have case_id TEST-CASE-A
    assert all(n.get("case_id") == "TEST-CASE-A" for n in graph_a["nodes"])
    assert all(n.get("case_id") == "TEST-CASE-B" for n in graph_b["nodes"])

    # Node IDs in Case A and Case B should be isolated (different hashes due to case_id prefixing)
    node_ids_a = set(n["id"] for n in graph_a["nodes"])
    node_ids_b = set(n["id"] for n in graph_b["nodes"])
    assert len(node_ids_a.intersection(node_ids_b)) == 0

    # Edges must be case-scoped
    assert all(e.get("case_id") == "TEST-CASE-A" for e in graph_a["edges"])
    assert all(e.get("case_id") == "TEST-CASE-B" for e in graph_b["edges"])

def test_source_document_and_sha256_hash():
    """
    5. Source documents remain case-scoped.
    12. File hash is generated from actual content.
    """
    content = "calling_number,called_number,duration\n9998887776,9998887775,60"
    summary = IngestionEngine.ingest_content(content=content, filename="test_hash.csv", case_id="TEST-CASE-HASH")

    doc = document_store.get_document(summary.source_document_id)
    assert doc is not None
    assert doc.case_id == "TEST-CASE-HASH"
    assert doc.content_hash is not None
    assert len(doc.content_hash) == 64  # SHA-256 hex string length

    # Scoped retrieval
    docs_hash_case = document_store.list_documents(case_id="TEST-CASE-HASH")
    assert len(docs_hash_case) == 1
    assert docs_hash_case[0].id == doc.id

def test_intra_case_deduplication():
    """
    8. Duplicate records inside the SAME case still deduplicate correctly.
    """
    cdr_dup = """calling_number,called_number,duration,timestamp
9876500001,9876500002,100,2026-09-05T12:00:00Z
9876500001,9876500002,200,2026-09-05T13:00:00Z"""

    summary = IngestionEngine.ingest_content(content=cdr_dup, filename="cdr_dup.csv", case_id="TEST-CASE-DUP")
    graph = graph_driver.get_network_graph(case_id="TEST-CASE-DUP")

    # There should only be 2 nodes created for phone 9876500001 and 9876500002
    assert len(graph["nodes"]) == 2

def test_fact_type_and_relationship_status():
    """
    9. FactType is preserved (DOCUMENT_FACT vs ANALYTICAL_INFERENCE).
    10. Relationship status is preserved (OBSERVED vs CANDIDATE).
    """
    cdr_content = "calling_number,called_number,duration\n9876511111,9876522222,45"
    summary_cdr = IngestionEngine.ingest_content(content=cdr_content, filename="cdr_fact.csv", case_id="TEST-CASE-FACTS")

    graph_cdr = graph_driver.get_network_graph(case_id="TEST-CASE-FACTS")
    edge_cdr = graph_cdr["edges"][0]
    assert edge_cdr["status"] == "OBSERVED"
    assert edge_cdr["fact_type"] == FactType.DOCUMENT_FACT.value

    fir_content = "Subject John Doe was seen with Subject Jane Smith near Sector 4 Safehouse."
    summary_fir = IngestionEngine.ingest_content(content=fir_content, filename="fir_fact.txt", case_id="TEST-CASE-FACTS")

    graph_fir = graph_driver.get_network_graph(case_id="TEST-CASE-FACTS")
    fir_edges = [e for e in graph_fir["edges"] if e.get("source_type") == "FIR_REPORT"]
    assert len(fir_edges) > 0
    assert fir_edges[0]["status"] == "CANDIDATE"
    assert fir_edges[0]["fact_type"] == FactType.ANALYTICAL_INFERENCE.value

def test_provenance_tracking():
    """
    11. Provenance survives ingestion (line/row numbers, character offsets).
    """
    content = "sender_acc,receiver_acc,amount\nuser1@bank,user2@bank,50000"
    summary = IngestionEngine.ingest_content(content=content, filename="provenance_test.csv", case_id="TEST-CASE-PROV")

    # Check evidence provenance item in synthetic_evidence
    ev_item = next((ev for ev in synthetic_evidence if ev["id"] == summary.evidence_id), None)
    assert ev_item is not None
    prov = ev_item.get("provenance", {})
    assert prov.get("source_document_id") == summary.source_document_id
    assert prov.get("line_number") is not None

def test_invalid_content_raises_error():
    """
    13. Failed parsing does not create fabricated entities (raises error on empty/invalid content).
    """
    invalid_content = "invalid garbage data with no phone numbers, accounts, or call fields"
    with pytest.raises(ValueError):
        IngestionEngine.ingest_content(content=invalid_content, filename="bad_cdr.csv", source_type="CDR", case_id="TEST-CASE-ERR")

def test_demo_mode_independence():
    """
    14. Demo Mode (DEMO-CASE-001) still works independently.
    """
    demo_graph = graph_driver.get_network_graph(case_id="DEMO-CASE-001")
    assert demo_graph["total_nodes"] > 0
    assert demo_graph["total_edges"] > 0
