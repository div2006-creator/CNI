import datetime
import hashlib
from typing import Dict, Any, Optional
from app.graph.store import graph_driver
from app.api.evidence import synthetic_evidence
from app.schemas.document import SourceDocument, ProcessingStatus
from app.evidence.document_store import document_store
from app.evidence.conflict_detector import ConflictDetector
from app.ingestion.cdr_parser import CDRParser
from app.ingestion.financial_parser import FinancialParser
from app.ingestion.fir_parser import FIRParser
from app.ingestion.entity_extractor import EntityExtractor
from app.ingestion.relationship_extractor import RelationshipExtractor
from app.schemas.ingestion import IngestionSummary, ParsedEntity, ParsedRelationship
from app.schemas.fact import FactType, EvidenceProvenance

class IngestionEngine:
    """
    Unified Live Data Ingestion Engine for CNI Intelligence Platform.
    Ingests CDR, UPI/Financial logs, and unstructured FIR reports into the active Knowledge Graph.
    Supports case_id scoping, FactType tagging, document tracking, SHA-256 hashing, deterministic
    conflict detection, and granular evidence provenance.
    """

    @classmethod
    def ingest_content(
        cls,
        content: str,
        filename: str = "uploaded_feed.csv",
        source_type: Optional[str] = None,
        case_id: Optional[str] = "DEMO-CASE-001"
    ) -> IngestionSummary:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        effective_case_id = case_id or "DEMO-CASE-001"
        raw_bytes = content.encode('utf-8')
        sha256_hash = hashlib.sha256(raw_bytes).hexdigest()

        doc_id = f"doc-{sha256_hash[:10]}"
        ev_hash = hashlib.md5(f"{doc_id}:{now}".encode()).hexdigest()[:6]
        evidence_id = f"ev-ingest-{ev_hash}"

        # 1. Stage UPLOADED: Create SourceDocument
        source_doc = SourceDocument(
            id=doc_id,
            source_document_id=doc_id,
            case_id=effective_case_id,
            filename=filename,
            source_type=source_type or "UNSTRUCTURED_TEXT",
            content_type="text/csv" if "csv" in filename.lower() else "text/plain",
            mime_type="text/csv" if "csv" in filename.lower() else "text/plain",
            file_size=len(raw_bytes),
            upload_timestamp=now,
            ingested_at=now,
            processing_status=ProcessingStatus.UPLOADED,
            status="UPLOADED",
            content_hash=sha256_hash,
            checksum=sha256_hash,
            original_metadata={"filename": filename, "raw_length": len(content)}
        )
        document_store.add_document(source_doc)

        try:
            # 2. Stage VALIDATING & PARSING: Auto-detect source type and run parser
            source_doc.processing_status = ProcessingStatus.VALIDATING
            document_store.add_document(source_doc)

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
                    if "caller" in content.lower() or "calling_number" in content.lower():
                        detected_type = "CDR"
                    elif "upi" in content.lower() or "sender" in content.lower() or "vpa" in content.lower():
                        detected_type = "UPI_FINANCIAL"
                    else:
                        detected_type = "FIR_REPORT"

            source_doc.source_type = detected_type
            source_doc.processing_status = ProcessingStatus.PARSING
            document_store.add_document(source_doc)

            parsed_records = []
            extracted_nodes = []
            extracted_edges = []
            snippet_preview = content[:200].replace("\n", " ") + "..."

            if detected_type == "CDR":
                parsed_records = CDRParser.parse(content)
                source_doc.record_count = len(parsed_records)

                # 3. Stage EXTRACTING & NORMALIZING
                source_doc.processing_status = ProcessingStatus.EXTRACTING
                document_store.add_document(source_doc)
                extracted_nodes = EntityExtractor.extract_from_cdr(parsed_records, case_id=effective_case_id)

                # 4. Stage LINKING
                source_doc.processing_status = ProcessingStatus.LINKING
                document_store.add_document(source_doc)
                extracted_edges = RelationshipExtractor.extract_from_cdr(parsed_records, evidence_id=evidence_id, case_id=effective_case_id)

                title = f"Ingested CDR Telemetry Feed ({filename})"
                source_cat = "CDR"
                default_fact_type = FactType.DOCUMENT_FACT

            elif detected_type == "UPI_FINANCIAL":
                parsed_records = FinancialParser.parse(content)
                source_doc.record_count = len(parsed_records)

                # 3. Stage EXTRACTING & NORMALIZING
                source_doc.processing_status = ProcessingStatus.EXTRACTING
                document_store.add_document(source_doc)
                extracted_nodes = EntityExtractor.extract_from_financial(parsed_records, case_id=effective_case_id)

                # 4. Stage LINKING
                source_doc.processing_status = ProcessingStatus.LINKING
                document_store.add_document(source_doc)
                extracted_edges = RelationshipExtractor.extract_from_financial(parsed_records, evidence_id=evidence_id, case_id=effective_case_id)

                title = f"Ingested Financial Transfer Log ({filename})"
                source_cat = "BANK_WIRE"
                default_fact_type = FactType.DOCUMENT_FACT

            else:
                parsed_fir = FIRParser.parse(content)
                parsed_records = [parsed_fir]
                source_doc.record_count = 1

                # 3. Stage EXTRACTING & NORMALIZING
                source_doc.processing_status = ProcessingStatus.EXTRACTING
                document_store.add_document(source_doc)
                extracted_nodes = EntityExtractor.extract_from_fir(parsed_fir, case_id=effective_case_id)

                # 4. Stage LINKING
                source_doc.processing_status = ProcessingStatus.LINKING
                document_store.add_document(source_doc)
                extracted_edges = RelationshipExtractor.extract_from_fir(extracted_nodes, evidence_id=evidence_id, case_id=effective_case_id)

                title = f"Ingested FIR Surveillance Report ({filename})"
                source_cat = "SURVEILLANCE_REPORT"
                default_fact_type = FactType.ANALYTICAL_INFERENCE

            # 5. Stage BUILDING_EVIDENCE: Register Nodes & Edges into Active Graph Driver
            source_doc.processing_status = ProcessingStatus.BUILDING_EVIDENCE
            document_store.add_document(source_doc)

            new_entity_models = []
            for n in extracted_nodes:
                n["case_id"] = effective_case_id
                graph_driver.add_node(n, case_id=effective_case_id)
                new_entity_models.append(ParsedEntity(
                    id=n["id"],
                    name=n["name"],
                    type=n["type"],
                    risk_level=n["risk_level"],
                    risk_score=n["risk_score"],
                    attributes=n.get("attributes", {}),
                    tags=n.get("tags", []),
                    case_id=effective_case_id,
                    source_ids=n.get("source_ids", [])
                ))

            new_rel_models = []
            for e in extracted_edges:
                e["case_id"] = effective_case_id
                e["fact_type"] = default_fact_type.value
                e["status"] = e.get("status", "OBSERVED")
                graph_driver.add_edge(e, case_id=effective_case_id)
                new_rel_models.append(ParsedRelationship(
                    id=e["id"],
                    source_id=e["source_id"],
                    target_id=e["target_id"],
                    type=e["type"],
                    confidence=e["confidence"],
                    weight=e["weight"],
                    attributes=e.get("attributes", {}),
                    timestamp=e.get("timestamp"),
                    evidence_id=evidence_id,
                    case_id=effective_case_id,
                    fact_type=default_fact_type,
                    status=e["status"]
                ))

            provenance_info = EvidenceProvenance(
                source_document_id=doc_id,
                line_number=1,
                row_number=1,
                start_offset=0,
                end_offset=min(200, len(content)),
                snippet=snippet_preview
            )

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
                "linked_relationship_ids": [e["id"] for e in extracted_edges],
                "case_id": effective_case_id,
                "fact_type": default_fact_type.value,
                "source_document_id": doc_id,
                "provenance": provenance_info.model_dump()
            }
            synthetic_evidence.insert(0, evidence_item)

            # 6. Stage CHECKING_CONFLICTS: Run ConflictDetector
            source_doc.processing_status = ProcessingStatus.CHECKING_CONFLICTS
            document_store.add_document(source_doc)

            # Fetch active nodes/edges for this case to check cross-record conflicts
            case_graph = graph_driver.get_network_graph(case_id=effective_case_id)
            case_nodes = case_graph.get("nodes", [])
            case_edges = case_graph.get("edges", [])

            detected_conflicts = ConflictDetector.detect_conflicts(
                case_id=effective_case_id,
                entities=case_nodes,
                relationships=case_edges,
                evidence_items=synthetic_evidence
            )
            for conf in detected_conflicts:
                synthetic_evidence.insert(0, conf)

            # 7. Stage COMPLETED
            source_doc.processing_status = ProcessingStatus.COMPLETED
            source_doc.status = "COMPLETED"
            document_store.add_document(source_doc)

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
                message=f"Live ingestion completed for '{filename}' in case '{effective_case_id}'. Extracted {len(extracted_nodes)} entities, {len(extracted_edges)} relationships, and detected {len(detected_conflicts)} potential conflicts.",
                warnings=[],
                case_id=effective_case_id,
                source_document_id=doc_id,
                conflicts_detected_count=len(detected_conflicts)
            )

        except Exception as err:
            source_doc.processing_status = ProcessingStatus.FAILED
            source_doc.status = "FAILED"
            source_doc.processing_error = str(err)
            document_store.add_document(source_doc)
            raise err

