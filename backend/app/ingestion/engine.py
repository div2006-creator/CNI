import datetime
import hashlib
from typing import Dict, Any, Optional
from app.graph.store import graph_driver
from app.api.evidence import synthetic_evidence
from app.ingestion.cdr_parser import CDRParser
from app.ingestion.financial_parser import FinancialParser
from app.ingestion.fir_parser import FIRParser
from app.ingestion.entity_extractor import EntityExtractor
from app.ingestion.relationship_extractor import RelationshipExtractor
from app.schemas.ingestion import IngestionSummary, ParsedEntity, ParsedRelationship

class IngestionEngine:
    """
    Unified Live Data Ingestion Engine for CNI Intelligence Platform.
    Ingests CDR, UPI/Financial logs, and unstructured FIR reports into the active Knowledge Graph.
    """

    @classmethod
    def ingest_content(
        cls,
        content: str,
        filename: str = "uploaded_feed.csv",
        source_type: Optional[str] = None
    ) -> IngestionSummary:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        # 1. Auto-detect source type if unspecified
        detected_type = (source_type or "").upper()
        if not detected_type or detected_type == "AUTO":
            lower_name = filename.lower()
            if "cdr" in lower_name or "call" in lower_name:
                detected_type = "CDR"
            elif "upi" in lower_name or "bank" in lower_name or "financial" in lower_name or "txn" in lower_name:
                detected_type = "UPI_FINANCIAL"
            elif "fir" in lower_name or "report" in lower_name or lower_name.endswith(".txt"):
                detected_type = "FIR_REPORT"
            else:
                # Content fallback detection
                if "caller" in content.lower() or "calling_number" in content.lower():
                    detected_type = "CDR"
                elif "upi" in content.lower() or "sender" in content.lower() or "vpa" in content.lower():
                    detected_type = "UPI_FINANCIAL"
                else:
                    detected_type = "FIR_REPORT"

        # Generate Evidence Record ID for provenance tracking
        ev_hash = hashlib.md5(f"{filename}:{now}".encode()).hexdigest()[:6]
        evidence_id = f"ev-ingest-{ev_hash}"

        parsed_records = []
        extracted_nodes = []
        extracted_edges = []
        snippet_preview = content[:200].replace("\n", " ") + "..."

        # 2. Execute target parser and extractors based on detected feed type
        if detected_type == "CDR":
            parsed_records = CDRParser.parse(content)
            extracted_nodes = EntityExtractor.extract_from_cdr(parsed_records)
            extracted_edges = RelationshipExtractor.extract_from_cdr(parsed_records, evidence_id=evidence_id)
            title = f"Ingested CDR Telemetry Feed ({filename})"
            source_cat = "CDR"
        elif detected_type == "UPI_FINANCIAL":
            parsed_records = FinancialParser.parse(content)
            extracted_nodes = EntityExtractor.extract_from_financial(parsed_records)
            extracted_edges = RelationshipExtractor.extract_from_financial(parsed_records, evidence_id=evidence_id)
            title = f"Ingested Financial Transfer Log ({filename})"
            source_cat = "BANK_WIRE"
        else:
            # FIR / Unstructured Text
            parsed_fir = FIRParser.parse(content)
            extracted_nodes = EntityExtractor.extract_from_fir(parsed_fir)
            extracted_edges = RelationshipExtractor.extract_from_fir(extracted_nodes, evidence_id=evidence_id)
            parsed_records = [parsed_fir]
            title = f"Ingested FIR Surveillance Report ({filename})"
            source_cat = "SURVEILLANCE_REPORT"

        # 3. Register Nodes & Edges into Active Graph Driver
        new_entity_models = []
        for n in extracted_nodes:
            graph_driver.add_node(n)
            new_entity_models.append(ParsedEntity(
                id=n["id"],
                name=n["name"],
                type=n["type"],
                risk_level=n["risk_level"],
                risk_score=n["risk_score"],
                attributes=n.get("attributes", {}),
                tags=n.get("tags", [])
            ))

        new_rel_models = []
        for e in extracted_edges:
            graph_driver.add_edge(e)
            new_rel_models.append(ParsedRelationship(
                id=e["id"],
                source_id=e["source_id"],
                target_id=e["target_id"],
                type=e["type"],
                confidence=e["confidence"],
                weight=e["weight"],
                attributes=e.get("attributes", {}),
                timestamp=e.get("timestamp"),
                evidence_id=evidence_id
            ))

        # 4. Register Evidence Item for Provenance
        evidence_item = {
            "id": evidence_id,
            "title": title,
            "source_type": source_cat,
            "source_id": evidence_id,
            "source_reference_id": filename,
            "content_snippet": snippet_preview,
            "confidence": 0.94,
            "timestamp": now,
            "created_at": now,
            "extraction_method": "AUTOMATED_INGESTION_ENGINE",
            "linked_entity_ids": [n["id"] for n in extracted_nodes],
            "linked_relationship_ids": [e["id"] for e in extracted_edges]
        }
        synthetic_evidence.insert(0, evidence_item)

        return IngestionSummary(
            status="SUCCESS",
            filename=filename,
            source_type=detected_type,
            total_records_processed=len(parsed_records),
            entities_created_count=len(extracted_nodes),
            relationships_created_count=len(extracted_edges),
            new_entities=new_entity_models,
            new_relationships=new_rel_models,
            evidence_id=evidence_id,
            message=f"Live ingestion completed for '{filename}'. Extracted {len(extracted_nodes)} entities and {len(extracted_edges)} relationships.",
            warnings=[]
        )
