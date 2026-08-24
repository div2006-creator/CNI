"""
Synthetic Dataset Generator for SIH 2026 Criminal Network Intelligence System.
All entities, names, phone numbers, accounts, locations, and events in this dataset are 100% synthetic mock data created for demonstration and testing purposes.
"""

import datetime

def get_synthetic_dataset():
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    t_minus_10d = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=10)).isoformat()
    t_minus_30d = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)).isoformat()

    # Nodes
    nodes = [
        {
            "id": "person-101",
            "name": "Subject Alpha (Alias: The Broker)",
            "type": "PERSON",
            "risk_level": "CRITICAL",
            "risk_score": 0.92,
            "attributes": {"known_aliases": ["Alpha", "Broker"], "status": "Under Interception"},
            "tags": ["Priority Target", "Financial Orchestrator"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.45,
        },
        {
            "id": "person-102",
            "name": "Subject Bravo (Alias: Apex)",
            "type": "PERSON",
            "risk_level": "HIGH",
            "risk_score": 0.85,
            "attributes": {"role": "Logistics Handler & Key Intermediary"},
            "tags": ["Bridge Entity", "Logistics", "Cross-Border"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": True, # Bridge Node connecting Person 101 to Field Group
            "betweenness_centrality": 0.89,
        },
        {
            "id": "person-103",
            "name": "Subject Charlie (Courier)",
            "type": "PERSON",
            "risk_level": "MEDIUM",
            "risk_score": 0.65,
            "attributes": {"role": "Field Operative"},
            "tags": ["Transport"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.20,
        },
        {
            "id": "person-104",
            "name": "Subject Delta (Accountant)",
            "type": "PERSON",
            "risk_level": "HIGH",
            "risk_score": 0.78,
            "attributes": {"role": "Shell Co Administrator"},
            "tags": ["Shell Company", "Finance"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.35,
        },
        {
            "id": "org-201",
            "name": "Vortex Trading Corp (Shell Co)",
            "type": "ORGANIZATION",
            "risk_level": "CRITICAL",
            "risk_score": 0.90,
            "attributes": {"jurisdiction": "Offshore Synthetic Reg", "reg_number": "SYN-882910"},
            "tags": ["Bridge Entity", "Shell Entity", "Money Laundering"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": True,
            "betweenness_centrality": 0.94,
        },
        {
            "id": "org-202",
            "name": "Apex Cargo Solutions",
            "type": "ORGANIZATION",
            "risk_level": "HIGH",
            "risk_score": 0.74,
            "attributes": {"business": "Freight Forwarding"},
            "tags": ["Front Business"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.15,
        },
        {
            "id": "account-301",
            "name": "Bank Account #SYN-994021",
            "type": "ACCOUNT",
            "risk_level": "CRITICAL",
            "risk_score": 0.88,
            "attributes": {"bank_name": "Offshore Commercial Synthetic", "balance_usd": 1450000},
            "tags": ["High-Value Transfers"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.40,
        },
        {
            "id": "account-302",
            "name": "Crypto Wallet 0x7a8F...91C2",
            "type": "ACCOUNT",
            "risk_level": "HIGH",
            "risk_score": 0.81,
            "attributes": {"blockchain": "Synthetic-Chain", "type": "Multi-Sig"},
            "tags": ["Crypto Mixer"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.25,
        },
        {
            "id": "phone-401",
            "name": "+1 (555) 019-2831 (Burner #1)",
            "type": "PHONE",
            "risk_level": "HIGH",
            "risk_score": 0.79,
            "attributes": {"carrier": "Encrypted VOIP Synthetic"},
            "tags": ["Burner", "Encrypted Line"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.30,
        },
        {
            "id": "phone-402",
            "name": "+1 (555) 014-9922 (Burner #2)",
            "type": "PHONE",
            "risk_level": "MEDIUM",
            "risk_score": 0.62,
            "attributes": {"carrier": "Prepaid SIM"},
            "tags": ["Prepaid"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.20,
        },
        {
            "id": "loc-501",
            "name": "Warehouse Hub 7 (Sector 4B)",
            "type": "LOCATION",
            "risk_level": "HIGH",
            "risk_score": 0.77,
            "attributes": {"lat": 34.0522, "lon": -118.2437, "type": "Industrial Site"},
            "tags": ["Staging Location"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.30,
        },
        {
            "id": "veh-601",
            "name": "Black SUV (Plates: SYN-9901)",
            "type": "VEHICLE",
            "risk_level": "MEDIUM",
            "risk_score": 0.60,
            "attributes": {"make": "Synthetic Motors", "color": "Black"},
            "tags": ["Transport"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.10,
        },
        {
            "id": "event-701",
            "name": "Rapid Wire Transfer Event",
            "type": "EVENT",
            "risk_level": "CRITICAL",
            "risk_score": 0.95,
            "attributes": {"amount_usd": 500000, "duration_sec": 120},
            "tags": ["Financial Anomaly"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.50,
        },
        {
            "id": "doc-801",
            "name": "Offshore Incorporation Charter SYN-882",
            "type": "DOCUMENT",
            "risk_level": "HIGH",
            "risk_score": 0.85,
            "attributes": {"file_type": "PDF", "source": "Offshore Public Registry"},
            "tags": ["Legal Document", "Corporate Registry"],
            "created_at": now,
            "updated_at": now,
            "is_bridge_node": False,
            "betweenness_centrality": 0.15,
        }
    ]

    # Relationships with Temporal & Evidence Attributes
    relationships = [
        {
            "id": "rel-01",
            "source_id": "person-101",
            "target_id": "person-102",
            "type": "KNOWS",
            "confidence": 0.95,
            "weight": 1.0,
            "start_time": t_minus_30d,
            "end_time": None,
            "timestamp": t_minus_30d,
            "source_type": "SURVEILLANCE_REPORT",
            "source_reference_id": "SURV-2026-004",
            "evidence_id": "ev-001",
            "attributes": {"relationship_age": "3 years"}
        },
        {
            "id": "rel-02",
            "source_id": "person-101",
            "target_id": "org-201",
            "type": "OWNS",
            "confidence": 0.98,
            "weight": 1.0,
            "start_time": t_minus_30d,
            "end_time": None,
            "timestamp": t_minus_30d,
            "source_type": "CORPORATE_FILING",
            "source_reference_id": "REG-SYN-882",
            "evidence_id": "ev-002",
            "attributes": {"beneficial_ownership": "100%"}
        },
        {
            "id": "rel-03",
            "source_id": "person-104",
            "target_id": "org-201",
            "type": "WORKS_FOR",
            "confidence": 0.90,
            "weight": 0.8,
            "start_time": t_minus_30d,
            "end_time": None,
            "timestamp": t_minus_30d,
            "source_type": "CORPORATE_FILING",
            "source_reference_id": "REG-SYN-882",
            "evidence_id": "ev-002",
            "attributes": {"title": "Chief Financial Admin"}
        },
        {
            "id": "rel-04",
            "source_id": "org-201",
            "target_id": "account-301",
            "type": "OWNS",
            "confidence": 1.0,
            "weight": 1.0,
            "start_time": t_minus_30d,
            "end_time": None,
            "timestamp": t_minus_30d,
            "source_type": "BANK_WIRE",
            "source_reference_id": "BANK-SYN-994",
            "evidence_id": "ev-003",
            "attributes": {}
        },
        {
            "id": "rel-05",
            "source_id": "account-301",
            "target_id": "account-302",
            "type": "TRANSFERRED_TO",
            "confidence": 0.99,
            "weight": 0.95,
            "start_time": t_minus_10d,
            "end_time": t_minus_10d,
            "timestamp": t_minus_10d,
            "source_type": "BANK_WIRE",
            "source_reference_id": "BANK-SYN-994",
            "evidence_id": "ev-003",
            "attributes": {"amount": "$500,000"}
        },
        {
            "id": "rel-06",
            "source_id": "person-101",
            "target_id": "phone-401",
            "type": "USES",
            "confidence": 0.85,
            "weight": 0.9,
            "start_time": t_minus_30d,
            "end_time": None,
            "timestamp": t_minus_30d,
            "source_type": "CDR",
            "source_reference_id": "CDR-VOIP-019",
            "evidence_id": "ev-004",
            "attributes": {}
        },
        {
            "id": "rel-07",
            "source_id": "phone-401",
            "target_id": "phone-402",
            "type": "CALLS",
            "confidence": 0.92,
            "weight": 0.85,
            "start_time": t_minus_10d,
            "end_time": now,
            "timestamp": t_minus_10d,
            "source_type": "CDR",
            "source_reference_id": "CDR-VOIP-019",
            "evidence_id": "ev-004",
            "attributes": {"call_count_30d": 47}
        },
        {
            "id": "rel-08",
            "source_id": "person-102",
            "target_id": "phone-402",
            "type": "USES",
            "confidence": 0.88,
            "weight": 0.9,
            "start_time": t_minus_30d,
            "end_time": None,
            "timestamp": t_minus_30d,
            "source_type": "CDR",
            "source_reference_id": "CDR-VOIP-019",
            "evidence_id": "ev-004",
            "attributes": {}
        },
        {
            "id": "rel-09",
            "source_id": "person-102",
            "target_id": "org-202",
            "type": "WORKS_FOR",
            "confidence": 0.82,
            "weight": 0.7,
            "start_time": t_minus_30d,
            "end_time": None,
            "timestamp": t_minus_30d,
            "source_type": "CORPORATE_FILING",
            "source_reference_id": "REG-APEX-01",
            "evidence_id": "ev-002",
            "attributes": {}
        },
        {
            "id": "rel-10",
            "source_id": "person-103",
            "target_id": "person-102",
            "type": "ASSOCIATED_WITH",
            "confidence": 0.75,
            "weight": 0.6,
            "start_time": t_minus_10d,
            "end_time": None,
            "timestamp": t_minus_10d,
            "source_type": "SURVEILLANCE_REPORT",
            "source_reference_id": "SURV-2026-004",
            "evidence_id": "ev-001",
            "attributes": {}
        },
        {
            "id": "rel-11",
            "source_id": "person-103",
            "target_id": "loc-501",
            "type": "VISITED",
            "confidence": 0.80,
            "weight": 0.7,
            "start_time": t_minus_10d,
            "end_time": now,
            "timestamp": t_minus_10d,
            "source_type": "SURVEILLANCE_REPORT",
            "source_reference_id": "SURV-2026-004",
            "evidence_id": "ev-001",
            "attributes": {"frequency": "Weekly"}
        },
        {
            "id": "rel-12",
            "source_id": "person-102",
            "target_id": "loc-501",
            "type": "LOCATED_AT",
            "confidence": 0.78,
            "weight": 0.7,
            "start_time": t_minus_10d,
            "end_time": now,
            "timestamp": t_minus_10d,
            "source_type": "SURVEILLANCE_REPORT",
            "source_reference_id": "SURV-2026-004",
            "evidence_id": "ev-001",
            "attributes": {"co_location_events": 5}
        },
        {
            "id": "rel-13",
            "source_id": "person-101",
            "target_id": "doc-801",
            "type": "MENTIONED_IN",
            "confidence": 0.95,
            "weight": 0.9,
            "start_time": t_minus_30d,
            "end_time": None,
            "timestamp": t_minus_30d,
            "source_type": "CORPORATE_FILING",
            "source_reference_id": "REG-SYN-882",
            "evidence_id": "ev-002",
            "attributes": {}
        }
    ]

    # Evidence Items
    evidence_items = [
        {
            "id": "ev-001",
            "title": "Surveillance Field Intelligence Report SURV-2026-004",
            "source_type": "SURVEILLANCE_REPORT",
            "source_reference_id": "SURV-2026-004",
            "content_snippet": "Surveillance team observed Subject Alpha meeting Subject Bravo at Safehouse Delta before Subject Bravo traveled to Warehouse Hub 7 to coordinate logistics with Subject Charlie.",
            "confidence": 0.92,
            "timestamp": t_minus_10d,
            "extraction_method": "AUTOMATED_NLP",
            "linked_entity_ids": ["person-101", "person-102", "person-103", "loc-501"],
            "linked_relationship_ids": ["rel-01", "rel-10", "rel-11", "rel-12"]
        },
        {
            "id": "ev-002",
            "title": "Offshore Commercial Corporate Filing REG-SYN-882",
            "source_type": "CORPORATE_FILING",
            "source_reference_id": "REG-SYN-882",
            "content_snippet": "Corporate registration for Vortex Trading Corp lists Subject Alpha as 100% beneficial owner and Subject Delta as Chief Financial Administrator.",
            "confidence": 0.98,
            "timestamp": t_minus_30d,
            "extraction_method": "STRUCTURED_PARSER",
            "linked_entity_ids": ["person-101", "person-104", "org-201", "doc-801"],
            "linked_relationship_ids": ["rel-02", "rel-03", "rel-13"]
        },
        {
            "id": "ev-003",
            "title": "Banking Wire Intercept BANK-SYN-994",
            "source_type": "BANK_WIRE",
            "source_reference_id": "BANK-SYN-994",
            "content_snippet": "Account #SYN-994021 owned by Vortex Trading Corp executed a $500,000 high-velocity wire transfer to Crypto Wallet 0x7a8F...91C2.",
            "confidence": 0.99,
            "timestamp": t_minus_10d,
            "extraction_method": "TRANSACTION_LOG",
            "linked_entity_ids": ["org-201", "account-301", "account-302", "event-701"],
            "linked_relationship_ids": ["rel-04", "rel-05"]
        },
        {
            "id": "ev-004",
            "title": "Cellular Tower Call Detail Record CDR-VOIP-019",
            "source_type": "CDR",
            "source_reference_id": "CDR-VOIP-019",
            "content_snippet": "47 short-duration encrypted voice calls recorded between Burner #1 (used by Subject Alpha) and Burner #2 (used by Subject Bravo).",
            "confidence": 0.94,
            "timestamp": t_minus_10d,
            "extraction_method": "TELEMETRY_LOG",
            "linked_entity_ids": ["person-101", "person-102", "phone-401", "phone-402"],
            "linked_relationship_ids": ["rel-06", "rel-07", "rel-08"]
        }
    ]

    # Entity Resolution Candidates
    resolution_candidates = [
        {
            "id": "res-01",
            "entity_id_1": "person-101",
            "entity_id_2": "person-105-dup",
            "name_1": "Subject Alpha (Alias: The Broker)",
            "name_2": "Alpha Brokerage Corp Rep",
            "type": "PERSON",
            "similarity_score": 0.88,
            "matching_attributes": ["known_aliases", "phone_country_code", "bank_jurisdiction"],
            "status": "PENDING_REVIEW",
            "explanation": "High attribute overlap in burner contact list and offshore bank registration."
        },
        {
            "id": "res-02",
            "entity_id_1": "org-202",
            "entity_id_2": "org-202-dup",
            "name_1": "Apex Cargo Solutions",
            "name_2": "Apex Freight Logistics Ltd",
            "type": "ORGANIZATION",
            "similarity_score": 0.82,
            "matching_attributes": ["business_sector", "director_name"],
            "status": "PENDING_REVIEW",
            "explanation": "Matching director name and freight forwarding sector activity."
        }
    ]

    # Audit Trail
    audit_logs = [
        {
            "id": "aud-01",
            "investigator_id": "INV-MILLER-04",
            "action_type": "SEARCH",
            "target_resource": "Subject Alpha",
            "details": {"query": "Subject Alpha", "result_count": 1},
            "timestamp": now
        },
        {
            "id": "aud-02",
            "investigator_id": "INV-MILLER-04",
            "action_type": "RELATIONSHIP_INSPECTED",
            "target_resource": "rel-05 (TRANSFERRED_TO)",
            "details": {"source": "account-301", "target": "account-302", "evidence_id": "ev-003"},
            "timestamp": now
        },
        {
            "id": "aud-03",
            "investigator_id": "INV-MILLER-04",
            "action_type": "WHAT_IF_EXECUTED",
            "target_resource": "Simulation Node Removal",
            "details": {"removed_nodes": ["person-102"]},
            "timestamp": now
        }
    ]

    # Alerts & Cases
    alerts = [
        {
            "id": "alert-901",
            "title": "Rapid Wire Transfer to Crypto Mixer",
            "pattern_type": "FINANCIAL_ANOMALY",
            "description": "Account #SYN-994021 transferred $500,000 to Crypto Wallet 0x7a8F within 2 minutes of offshore deposit.",
            "severity": "CRITICAL",
            "status": "NEW",
            "risk_score": 0.95,
            "related_entity_ids": ["account-301", "account-302", "org-201"],
            "explanation": "High velocity layered transaction matching money laundering pattern #FL-402.",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "alert-902",
            "title": "Frequent Co-Location at Unregistered Warehouse",
            "pattern_type": "GEOSPATIAL_CLUSTER",
            "description": "Subject Bravo and Subject Charlie logged simultaneous cell tower hits near Warehouse Hub 7 on 5 separate occasions.",
            "severity": "HIGH",
            "status": "UNDER_REVIEW",
            "risk_score": 0.82,
            "related_entity_ids": ["person-102", "person-103", "loc-501"],
            "explanation": "Repeated physical proximity between logistics targets at unlisted industrial facility.",
            "created_at": now,
            "updated_at": now,
        }
    ]

    investigations = [
        {
            "id": "case-801",
            "case_number": "INV-2026-0891",
            "title": "Operation NorthStar",
            "summary": "Investigation into offshore shell companies, encrypted communications, and suspicious financial transfers across regional hubs.",
            "lead_investigator": "Senior Investigator Miller",
            "priority": "URGENT",
            "status": "ACTIVE",
            "assigned_entity_ids": ["person-101", "person-102", "org-201", "account-301"],
            "tags": ["Transnational", "Financial", "Priority"],
            "created_at": now,
            "updated_at": now,
            "notes_count": 14,
        }
    ]

    data_sources = [
        {
            "id": "ds-01",
            "name": "Offshore Bank Registry Wire Logs",
            "source_type": "STRUCTURED_LOGS",
            "description": "Daily automated feed of high-value international financial transactions.",
            "confidence_score": 0.98,
            "status": "ACTIVE",
            "records_ingested": 14250,
            "last_ingested_at": now,
        }
    ]

    return {
        "nodes": nodes,
        "relationships": relationships,
        "evidence_items": evidence_items,
        "resolution_candidates": resolution_candidates,
        "audit_logs": audit_logs,
        "alerts": alerts,
        "investigations": investigations,
        "data_sources": data_sources
    }
