from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
import uuid, datetime
from app.schemas.evidence import EvidenceResponse, EvidenceCreate, RelationshipEvidenceExplanation
from app.graph.store import graph_driver
from app.evidence.confidence import ConfidenceEngine
from data.synthetic.seed_data import get_synthetic_dataset

router = APIRouter(prefix="/evidence", tags=["Evidence & Provenance"])
synthetic_evidence: List[dict] = get_synthetic_dataset().get("evidence_items", [])

@router.get("", response_model=List[EvidenceResponse])
def list_evidence():
    """Retrieve evidence items linked to graph relationships and entity extractions."""
    return [
        {
            **item,
            "created_at": item.get("created_at", item.get("timestamp", datetime.datetime.now(datetime.timezone.utc).isoformat()))
        }
        for item in synthetic_evidence
    ]

@router.get("/relationship/{relationship_id}", response_model=RelationshipEvidenceExplanation)
def get_relationship_evidence_explanation(relationship_id: str):
    """
    Returns an explainable evidence dossier and confidence score breakdown for a specific relationship.
    Evaluates supporting evidence (✓), contradicting evidence (⚠), source reliability ratings, and timeline.
    """
    target_edge = graph_driver.edges.get(relationship_id)

    if not target_edge:
        # Search by source/target ID match
        for e in graph_driver.edges.values():
            if (e["source_id"] in relationship_id and e["target_id"] in relationship_id) or \
               (e["source_id"] == relationship_id or e["target_id"] == relationship_id):
                target_edge = e
                break

    if not target_edge and graph_driver.edges:
        target_edge = next(iter(graph_driver.edges.values()))

    if not target_edge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relationship '{relationship_id}' not found in Knowledge Graph."
        )



    # Find linked evidence items
    linked_evidence = []
    for item in synthetic_evidence:
        rel_ids = item.get("linked_relationship_ids", [])
        if target_edge["id"] in rel_ids or target_edge.get("evidence_id") == item["id"] or target_edge.get("source_id") == item["source_id"]:
            ev_copy = dict(item)
            ev_copy["created_at"] = item.get("created_at", item.get("timestamp", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            linked_evidence.append(ev_copy)

    # Calculate common neighbors count for graph signal
    src_nbrs = set(n["id"] for n in graph_driver.get_entity_neighbors(target_edge["source_id"], depth=1).get("nodes", []))
    tgt_nbrs = set(n["id"] for n in graph_driver.get_entity_neighbors(target_edge["target_id"], depth=1).get("nodes", []))
    common_cnt = len(src_nbrs.intersection(tgt_nbrs) - {target_edge["source_id"], target_edge["target_id"]})

    explanation = ConfidenceEngine.evaluate_relationship(
        relationship=target_edge,
        linked_evidence_items=linked_evidence,
        common_neighbors_count=common_cnt
    )
    return explanation

@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence_detail(evidence_id: str):
    """Retrieve details for a specific evidence item."""
    for item in synthetic_evidence:
        if item["id"] == evidence_id or item["source_id"] == evidence_id:
            res = dict(item)
            res["created_at"] = item.get("created_at", item.get("timestamp", datetime.datetime.now(datetime.timezone.utc).isoformat()))
            return res
    raise HTTPException(status_code=404, detail=f"Evidence '{evidence_id}' not found.")

@router.post("", response_model=EvidenceResponse, status_code=201)
def attach_new_evidence(evidence_in: EvidenceCreate):
    """
    Attach and merge a new evidence record into the system without destroying existing evidence.
    """
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    new_id = f"ev-{str(uuid.uuid4())[:8]}"

    new_item = {
        "id": new_id,
        "title": evidence_in.title,
        "source_type": evidence_in.source_type.upper(),
        "source_id": evidence_in.source_id,
        "content_snippet": evidence_in.content_snippet,
        "confidence": evidence_in.confidence,
        "timestamp": evidence_in.timestamp or now,
        "extraction_method": evidence_in.extraction_method,
        "linked_entity_ids": evidence_in.linked_entity_ids,
        "linked_relationship_ids": evidence_in.linked_relationship_ids,
        "reliability_level": evidence_in.reliability_level or "HIGH",
        "created_at": now
    }
    synthetic_evidence.append(new_item)

    # Link evidence to graph relationships if specified
    for rel_id in evidence_in.linked_relationship_ids:
        edge = None
        for e in graph_driver.get_network_graph()["edges"]:
            if e["id"] == rel_id:
                edge = e
                break
        if edge:
            edge_copy = dict(edge)
            evidence_ids = set(edge_copy.get("evidence_ids", []))
            evidence_ids.add(new_id)
            edge_copy["evidence_ids"] = list(evidence_ids)
            graph_driver.upsert_edge(edge_copy)

    return new_item

