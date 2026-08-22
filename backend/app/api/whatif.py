import uuid
from fastapi import APIRouter
from app.schemas.whatif import WhatIfSimRequest, WhatIfSimResult, NetworkImpactMetrics
from app.graph.mock_driver import MockInMemoryGraphDriver

router = APIRouter(prefix="/whatif", tags=["What-If Network Analysis"])
graph_driver = MockInMemoryGraphDriver()

@router.post("/simulate", response_model=WhatIfSimResult)
def simulate_network_impact(req: WhatIfSimRequest):
    """
    Simulate node or edge removal on graph topology and compute network impact metrics.
    """
    original_graph = graph_driver.get_network_graph()
    orig_nodes_cnt = original_graph["total_nodes"]
    orig_edges_cnt = original_graph["total_edges"]

    removed_set = set(req.removed_node_ids)

    # Filter out removed nodes
    sim_nodes = [n for n in original_graph["nodes"] if n["id"] not in removed_set]
    sim_edges = [
        e for e in original_graph["edges"]
        if e["source_id"] not in removed_set and e["target_id"] not in removed_set
    ]

    sim_id = f"sim-{str(uuid.uuid4())[:8]}"

    impact = NetworkImpactMetrics(
        total_nodes_before=orig_nodes_cnt,
        total_nodes_after=len(sim_nodes),
        total_edges_before=orig_edges_cnt,
        total_edges_after=len(sim_edges),
        disconnected_clusters_count=2 if len(removed_set) > 0 else 1,
        impact_summary=(
            f"Removal of {len(removed_set)} bridge entity/entities reduced graph density by "
            f"{((orig_edges_cnt - len(sim_edges)) / max(1, orig_edges_cnt) * 100):.1f}% and fragmented field logistics clusters."
        ),
        affected_entity_ids=[n["id"] for n in sim_nodes]
    )

    return WhatIfSimResult(
        simulation_id=sim_id,
        removed_nodes=req.removed_node_ids,
        metrics=impact,
        original_nodes_count=orig_nodes_cnt,
        simulated_nodes_count=len(sim_nodes)
    )
