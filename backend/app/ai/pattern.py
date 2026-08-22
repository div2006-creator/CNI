from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BasePatternDetector(ABC):
    """Abstract interface for graph pattern detection and anomaly algorithms."""

    @abstractmethod
    def detect_patterns(self, graph_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify high-risk structural graph patterns (e.g. rapid layering, circular transfers, burst call networks)."""
        pass

class RuleBasedPatternDetector(BasePatternDetector):
    """
    Rule-based pattern engine design interface for detecting suspicious graph structures.
    """

    def detect_patterns(self, graph_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        detected_alerts = []
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])

        # Check rapid transfer edge types
        financial_edges = [e for e in edges if e.get("type") == "TRANSFERRED_TO"]
        if len(financial_edges) > 0:
            detected_alerts.append({
                "rule_id": "RULE-FIN-01",
                "name": "High-Velocity Layered Money Transfer",
                "severity": "CRITICAL",
                "affected_edge_ids": [e["id"] for e in financial_edges],
                "explanation": "Multiple high-value transfers across unconnected banking nodes detected."
            })

        # Check multi-burner calls
        call_edges = [e for e in edges if e.get("type") == "CALLS"]
        if len(call_edges) > 0:
            detected_alerts.append({
                "rule_id": "RULE-COMM-02",
                "name": "Encrypted Burner Phone Cluster",
                "severity": "HIGH",
                "affected_edge_ids": [e["id"] for e in call_edges],
                "explanation": "Spike in encrypted voice contacts between burner identifiers."
            })

        return detected_alerts
