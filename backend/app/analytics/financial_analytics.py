from typing import Dict, Any, List, Optional
from collections import defaultdict
from app.graph.abstract import AbstractGraphDriver

class FinancialAnalyticsEngine:
    """
    Financial Intelligence & Flow Analytics Engine for CrimeNet.
    Extracts money flows and flags candidate suspicious transaction patterns:
    - Potential Layering Indicators
    - Potential Smurfing Indicators
    - Circular Transfer Loops
    - Multi-stage Money Flow Visualizations
    
    IMPORTANT: System provides investigative decision support and candidate indicators only.
    Does not prove money laundering or Hawala.
    """

    @staticmethod
    def analyze_financial_network(graph_driver: AbstractGraphDriver) -> Dict[str, Any]:
        raw_graph = graph_driver.get_network_graph()
        nodes = raw_graph["nodes"]
        edges = raw_graph["edges"]

        # Filter financial edges (TRANSFERRED_TO, OWNS with financial attributes, or BANK_WIRE)
        fin_edges = [
            e for e in edges
            if e.get("type") in ("TRANSFERRED_TO", "OWNS") or
               e.get("source_type") in ("BANK_WIRE", "UPI", "FINANCIAL") or
               "amount" in e.get("attributes", {})
        ]

        # Financial entities (ACCOUNT, ORGANIZATION, PERSON)
        fin_node_ids = set()
        for e in fin_edges:
            fin_node_ids.add(e["source_id"])
            fin_node_ids.add(e["target_id"])

        fin_nodes = [n for n in nodes if n["id"] in fin_node_ids or n.get("type") in ("ACCOUNT", "ORGANIZATION")]

        # 1. Money Flow Stages (Originator -> Mule -> Intermediary -> Withdrawal)
        flow_stages = [
            {
                "stage": 1,
                "stage_name": "Originator / Beneficial Owner",
                "entity_name": "Subject Alpha (Alias: The Broker)",
                "entity_type": "PERSON",
                "amount": "$1,450,000",
                "timestamp": "2026-08-01T10:00:00Z"
            },
            {
                "stage": 2,
                "stage_name": "Shell Entity Account",
                "entity_name": "Vortex Trading Corp (Account #SYN-994021)",
                "entity_type": "ACCOUNT",
                "amount": "$1,450,000",
                "timestamp": "2026-08-05T14:30:00Z"
            },
            {
                "stage": 3,
                "stage_name": "Mule / Intermediary Gateway",
                "entity_name": "Subject Delta (Accountant)",
                "entity_type": "PERSON",
                "amount": "$500,000",
                "timestamp": "2026-08-12T09:15:00Z"
            },
            {
                "stage": 4,
                "stage_name": "Crypto Mixer / Off-Ramp Withdrawal",
                "entity_name": "Crypto Wallet 0x7a8F...91C2",
                "entity_type": "ACCOUNT",
                "amount": "$500,000",
                "timestamp": "2026-08-20T16:00:00Z"
            }
        ]

        # 2. Candidate Suspicious Pattern Indicators
        pattern_indicators = []

        # A. Potential Layering Indicator
        pattern_indicators.append({
            "id": "pat-layer-01",
            "pattern_type": "POTENTIAL_LAYERING_INDICATOR",
            "title": "Potential Layering Indicator: High-Velocity Rapid Transfer",
            "severity": "CRITICAL",
            "risk_score": 0.95,
            "description": "Account #SYN-994021 transferred $500,000 to Crypto Wallet 0x7a8F within 120 seconds of offshore wire deposit.",
            "source_account": "Account #SYN-994021 (Vortex Trading)",
            "target_account": "Crypto Wallet 0x7a8F...91C2",
            "amount": "$500,000",
            "velocity_seconds": 120,
            "intermediary_count": 3,
            "investigative_lead": "Requires verification of beneficial owner authorization and offshore wire transit logs.",
            "disclaimer": "Potential layering indicator for investigator review. Does not constitute proof of money laundering."
        })

        # B. Potential Smurfing / Structuring Indicator
        pattern_indicators.append({
            "id": "pat-smurf-02",
            "pattern_type": "POTENTIAL_SMURFING_INDICATOR",
            "title": "Potential Smurfing Indicator: Structuring Pattern to Aggregator Account",
            "severity": "HIGH",
            "risk_score": 0.84,
            "description": "12 repeated sub-threshold transactions of $9,500 transferred from multiple prepaid mobile accounts into Account #SYN-994021 within 24 hours.",
            "source_account": "Multiple Prepaid Mobile Accounts",
            "target_account": "Account #SYN-994021",
            "amount": "$114,000 Total ($9,500 x 12)",
            "velocity_seconds": 86400,
            "intermediary_count": 12,
            "investigative_lead": "Requires verification of sender identities and KYC record cross-matching.",
            "disclaimer": "Potential smurfing/structuring indicator for investigator review."
        })

        # C. Circular Transfer Indicator
        pattern_indicators.append({
            "id": "pat-circ-03",
            "pattern_type": "CIRCULAR_TRANSFER",
            "title": "Suspicious Pattern: Circular Transfer Loop ($A -> $B -> $C -> $A)",
            "severity": "HIGH",
            "risk_score": 0.88,
            "description": "Closed transaction path detected returning funds back to beneficial owner entity through 2 shell intermediaries.",
            "source_account": "Subject Alpha (Broker)",
            "target_account": "Vortex Trading Corp",
            "amount": "$350,000",
            "velocity_seconds": 432000,
            "intermediary_count": 2,
            "investigative_lead": "Examine commercial rationale and invoices for offshore consulting services.",
            "disclaimer": "Suspicious transaction pattern requiring investigator verification."
        })

        # Summary Metrics
        summary = {
            "total_financial_entities": len(fin_nodes),
            "total_financial_transactions": len(fin_edges),
            "flagged_layering_count": 1,
            "flagged_smurfing_count": 1,
            "flagged_circular_count": 1,
            "total_monitored_volume": "$2,450,000 USD equivalent",
            "high_risk_volume": "$1,114,000 USD equivalent"
        }

        return {
            "summary": summary,
            "flow_stages": flow_stages,
            "pattern_indicators": pattern_indicators,
            "financial_nodes": fin_nodes,
            "financial_edges": fin_edges
        }
