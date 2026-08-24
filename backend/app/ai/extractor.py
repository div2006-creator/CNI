from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseEntityExtractor(ABC):
    """Abstract interface for NLP entity extraction models (spaCy/Transformers integration)."""

    @abstractmethod
    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract entity candidates from raw unstructured intelligence text."""
        pass

    @abstractmethod
    def extract_relationships(self, text: str) -> List[Dict[str, Any]]:
        """Extract relationship triplets from raw unstructured text."""
        pass

class MockNLPService(BaseEntityExtractor):
    """
    Design interface for future ML/NLP models.
    Produces structured entity and relationship outputs ready for human-in-the-loop investigator review.
    """

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        # Rule-based candidate extraction design pattern
        entities = []
        if "Alpha" in text or "Broker" in text:
            entities.append({
                "text": "Subject Alpha",
                "label": "PERSON",
                "confidence": 0.94,
                "suggested_id": "person-101"
            })
        if "Vortex" in text or "Shell" in text:
            entities.append({
                "text": "Vortex Trading Corp",
                "label": "ORGANIZATION",
                "confidence": 0.89,
                "suggested_id": "org-201"
            })
        return entities

    def extract_relationships(self, text: str) -> List[Dict[str, Any]]:
        relationships = []
        if "transfer" in text.lower() or "wire" in text.lower():
            relationships.append({
                "source": "account-301",
                "target": "account-302",
                "relation": "TRANSFERRED_TO",
                "confidence": 0.88
            })
        return relationships
