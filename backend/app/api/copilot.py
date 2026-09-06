from fastapi import APIRouter
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.graph.store import graph_driver
from app.copilot.copilot_engine import CopilotEngine

router = APIRouter(prefix="/copilot", tags=["Investigator Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
def ask_copilot(req: CopilotQueryRequest):
    """
    Graph-aware Copilot assistant endpoint.
    Answers investigator queries strictly using knowledge graph topology and evidence provenance.
    """
    return CopilotEngine.answer_query(req.query, graph_driver)

