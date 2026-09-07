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
        return entities

    def extract_relationships(self, text: str) -> List[Dict[str, Any]]:
        relationships = []
        return relationships
