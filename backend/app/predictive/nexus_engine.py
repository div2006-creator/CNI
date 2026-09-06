from typing import Dict, Any, List
from app.graph.abstract import AbstractGraphDriver

class PredictiveNexusEngine:
    """
    Predictive Nexus Engine for CrimeNet.
    Identifies candidate hidden relationships across graph entities, calculates transparent link scores,
    and formats explainable signal contributions.
    """

    @staticmethod
    def generate_candidate_links(graph_driver: AbstractGraphDriver) -> List[Dict[str, Any]]:
        raw_graph = graph_driver.get_network_graph()
        nodes = raw_graph["nodes"]
        edges = raw_graph["edges"]

        # Default synthetic candidate pair (Alpha to Delta) per master specification
        alpha_node = next((n for n in nodes if n["id"] == "person-101"), {"id": "person-101", "name": "Subject Alpha (Broker)", "type": "PERSON"})
        delta_node = next((n for n in nodes if n["id"] == "person-104"), {"id": "person-104", "name": "Subject Delta (Accountant)", "type": "PERSON"})
        bravo_node = next((n for n in nodes if n["id"] == "person-102"), {"id": "person-102", "name": "Subject Bravo (Apex)", "type": "PERSON"})
        charlie_node = next((n for n in nodes if n["id"] == "person-103"), {"id": "person-103", "name": "Subject Charlie (Courier)", "type": "PERSON"})

        candidates = [
            {
                "candidate_id": "cand-nexus-01",
                "source_entity_id": alpha_node["id"],
                "source_entity_name": alpha_node.get("name", "Subject Alpha"),
                "source_entity_type": alpha_node.get("type", "PERSON"),
                "target_entity_id": delta_node["id"],
                "target_entity_name": delta_node.get("name", "Subject Delta"),
                "target_entity_type": delta_node.get("type", "PERSON"),
                "candidate_score": 0.74,
                "score_percentage": 74,
                "suggested_relationship_type": "ASSOCIATED_WITH",
                "classification_label": "Possible association",
                "signals": [
                    {
                        "signal_name": "Shared location",
                        "contribution_percentage": 22.0,
                        "description": "22% contribution — Co-location overlap near Safehouse Delta and industrial sector."
                    },
                    {
                        "signal_name": "Communication pattern",
                        "contribution_percentage": 19.0,
                        "description": "19% contribution — Indirect VOIP burner call frequency and common phone contact lists."
                    },
                    {
                        "signal_name": "Financial proximity",
                        "contribution_percentage": 17.0,
                        "description": "17% contribution — Joint beneficial ownership and administrative roles in Vortex Trading Corp."
                    },
                    {
                        "signal_name": "Common connections",
                        "contribution_percentage": 16.0,
                        "description": "16% contribution — 2 common 1-hop graph neighbors (Subject Bravo & Vortex Trading Corp)."
                    }
                ],
                "reasons": [
                    "Shared location (22%)",
                    "Communication pattern (19%)",
                    "Financial proximity (17%)",
                    "Common connections (16%)"
                ],
                "status": "PENDING_REVIEW",
                "investigative_lead": "Verify Aug 17 cell tower hit mismatch and inspect corporate filing REG-SYN-882.",
                "disclaimer": "Possible association candidate for investigator review. Requires verification. Does not constitute proof of guilt."
            },
            {
                "candidate_id": "cand-nexus-02",
                "source_entity_id": alpha_node["id"],
                "source_entity_name": alpha_node.get("name", "Subject Alpha"),
                "source_entity_type": alpha_node.get("type", "PERSON"),
                "target_entity_id": charlie_node["id"],
                "target_entity_name": charlie_node.get("name", "Subject Charlie"),
                "target_entity_type": charlie_node.get("type", "PERSON"),
                "candidate_score": 0.68,
                "score_percentage": 68,
                "suggested_relationship_type": "COORDINATED_WITH",
                "classification_label": "Candidate relationship",
                "signals": [
                    {
                        "signal_name": "Shared location",
                        "contribution_percentage": 25.0,
                        "description": "25% contribution — Frequent visits to Warehouse Hub 7."
                    },
                    {
                        "signal_name": "Common connections",
                        "contribution_percentage": 23.0,
                        "description": "23% contribution — Linked directly via Subject Bravo (Logistics Handler)."
                    },
                    {
                        "signal_name": "Temporal correlation",
                        "contribution_percentage": 20.0,
                        "description": "20% contribution — Synchronized movement patterns logged during transport operations."
                    }
                ],
                "reasons": [
                    "Shared location (25%)",
                    "Common connections (23%)",
                    "Temporal correlation (20%)"
                ],
                "status": "PENDING_REVIEW",
                "investigative_lead": "Conduct field surveillance at Warehouse Hub 7 during scheduled transport windows.",
                "disclaimer": "Candidate relationship lead. Requires verification."
            }
        ]

        return candidates
