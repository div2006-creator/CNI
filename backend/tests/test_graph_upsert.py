import pytest
from app.utils.normalization import (
    normalize_phone,
    normalize_upi,
    normalize_account,
    normalize_vehicle,
    normalize_entity_identifier,
)
from app.graph.mock_driver import MockInMemoryGraphDriver
from app.graph.store import graph_driver

def test_normalization_utils():
    # Phone normalization
    assert normalize_phone("+91 9876543210") == "+919876543210"
    assert normalize_phone("9876543210") == "+919876543210"
    assert normalize_phone("919876543210") == "+919876543210"
    assert normalize_phone("+1 (555) 019-2831") == "+15550192831"

    # UPI normalization
    assert normalize_upi("  John.Doe@OKAxis  ") == "john.doe@okaxis"

    # Account normalization
    assert normalize_account(" syn - 994 - 021 ") == "SYN994021"

    # Vehicle normalization
    assert normalize_vehicle(" syn - 9901 ") == "SYN9901"

    # Entity identifier dispatcher
    assert normalize_entity_identifier("PHONE", "9876543210") == "+919876543210"
    assert normalize_entity_identifier("UPI_ID", "  USER@UPI ") == "user@upi"
    assert normalize_entity_identifier("ACCOUNT", " acc - 123 ") == "ACC123"
    assert normalize_entity_identifier("VEHICLE", " dl - 01 - ab ") == "DL01AB"

def test_node_upsert_and_deduplication():
    driver = MockInMemoryGraphDriver()
    
    # 1. Insert new phone node
    phone_node_1 = {
        "id": "phone-test-1",
        "name": "+91 9876543210",
        "type": "PHONE",
        "risk_level": "MEDIUM",
        "risk_score": 0.50,
        "attributes": {"carrier": "Airtel"},
        "tags": ["Prepaid"],
        "source_id": "DS-CDR-01"
    }
    inserted = driver.upsert_node(phone_node_1)
    assert inserted["id"] == "phone-test-1"
    assert inserted["attributes"]["normalized_identifier"] == "+919876543210"
    assert "DS-CDR-01" in inserted["source_ids"]

    # 2. Re-ingest same phone number with different formatting and new source/metadata
    phone_node_dup = {
        "name": "9876543210",
        "type": "PHONE",
        "risk_level": "HIGH",
        "risk_score": 0.80,
        "attributes": {"location": "New Delhi"},
        "tags": ["Target Phone"],
        "source_id": "DS-FIR-02"
    }
    merged = driver.upsert_node(phone_node_dup)
    
    # Must resolve to same logical node ID!
    assert merged["id"] == "phone-test-1"
    assert merged["risk_score"] == 0.80
    assert merged["risk_level"] == "HIGH"
    # Merged attributes
    assert merged["attributes"]["carrier"] == "Airtel"
    assert merged["attributes"]["location"] == "New Delhi"
    # Merged tags
    assert "Prepaid" in merged["tags"]
    assert "Target Phone" in merged["tags"]
    # Multi-source provenance tracking
    assert "DS-CDR-01" in merged["source_ids"]
    assert "DS-FIR-02" in merged["source_ids"]

def test_edge_upsert_and_deduplication():
    driver = MockInMemoryGraphDriver()

    edge_1 = {
        "source_id": "person-101",
        "target_id": "phone-401",
        "type": "USES",
        "confidence": 0.70,
        "weight": 0.50,
        "evidence_id": "ev-100",
        "attributes": {"freq": 10}
    }
    inserted_edge = driver.upsert_edge(edge_1)
    edge_id = inserted_edge["id"]

    # Upsert same edge with new evidence and higher confidence
    edge_dup = {
        "source_id": "person-101",
        "target_id": "phone-401",
        "type": "USES",
        "confidence": 0.95,
        "weight": 0.90,
        "evidence_id": "ev-200",
        "attributes": {"last_active": "2026-09-04"}
    }
    merged_edge = driver.upsert_edge(edge_dup)

    assert merged_edge["id"] == edge_id
    assert merged_edge["confidence"] == 0.95
    assert merged_edge["attributes"]["freq"] == 10
    assert merged_edge["attributes"]["last_active"] == "2026-09-04"
    assert "ev-100" in merged_edge["evidence_ids"]
    assert "ev-200" in merged_edge["evidence_ids"]

def test_shared_graph_store_singleton():
    # Verify store graph_driver is shared
    node_data = {
        "name": "Test Singleton Entity",
        "type": "PERSON",
        "risk_level": "LOW",
        "risk_score": 0.1,
        "attributes": {},
        "tags": ["SingletonTest"]
    }
    upserted = graph_driver.upsert_node(node_data)
    node_id = upserted["id"]

    fetched = graph_driver.get_entity_by_id(node_id)
    assert fetched is not None
    assert fetched["name"] == "Test Singleton Entity"
