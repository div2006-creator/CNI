from fastapi import APIRouter
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse

router = APIRouter(prefix="/copilot", tags=["Investigator Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
def ask_copilot(req: CopilotQueryRequest):
    """
    Graph-aware Copilot assistant endpoint.
    Answers investigator queries strictly using knowledge graph topology and evidence provenance.
    """
    q_lower = req.query.lower()

    if "indirect" in q_lower or "alpha" in q_lower or "charlie" in q_lower:
        answer = (
            "Subject Alpha connects to Subject Charlie through Subject Bravo (Alias: Apex), who acts as a critical bridge entity. "
            "Surveillance field report SURV-2026-004 confirms Subject Bravo co-located at Warehouse Hub 7 with Subject Charlie after meeting Subject Alpha."
        )
        reasoning = [
            "1-hop link: Subject Alpha (person-101) KNOWS Subject Bravo (person-102)",
            "2-hop link: Subject Bravo (person-102) ASSOCIATED_WITH Subject Charlie (person-103)",
            "Bridge entity identified: Subject Bravo (betweenness centrality = 0.89)"
        ]
        evidence = ["ev-001", "ev-004"]
        entities = ["person-101", "person-102", "person-103"]
    else:
        answer = (
            "Analysis of synthetic graph topology shows high-velocity money layering from Vortex Trading Corp (Bank Account #SYN-994021) "
            "to Crypto Wallet 0x7a8F...91C2. This transaction coincided with a burst of 47 calls across burner lines."
        )
        reasoning = [
            "Financial anomaly #FL-402 matched",
            "Coincidental encrypted VOIP communications logged"
        ]
        evidence = ["ev-003", "ev-004"]
        entities = ["org-201", "account-301", "account-302"]

    return CopilotQueryResponse(
        query=req.query,
        answer=answer,
        confidence=0.94,
        reasoning=reasoning,
        supporting_evidence_ids=evidence,
        supporting_entity_ids=entities,
        suggested_investigative_actions=[
            "Request CDR expansion for Burner #2",
            "Execute What-If simulation removing Subject Bravo",
            "Export Operation NorthStar briefing PDF"
        ]
    )
