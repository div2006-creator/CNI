import logging
import re
import httpx
from typing import Dict, Any, Optional, List
from app.config import settings
from app.integrations.base import BaseEnrichmentProvider
from app.schemas.enrichment import (
    AIDocumentAnalysisResult,
    ExtractedEntityItem,
    ExtractedRelationshipItem
)
from app.schemas.fact import FactType, EvidenceProvenance

logger = logging.getLogger(__name__)

# Banned terms in automated AI extractions per legal safety guidelines
BANNED_AUTOMATED_LABELS = ["criminal", "guilty", "convicted", "terrorist", "murderer"]

class AIDocumentAnalyzerProvider(BaseEnrichmentProvider):
    def __init__(self, provider: Optional[str] = None, api_key: Optional[str] = None, enabled: bool = True, timeout: float = 15.0):
        super().__init__(name="AIDocumentAnalyzer", enabled=enabled, timeout=timeout)
        self.provider = provider or settings.AI_PROVIDER
        self.api_key = api_key or settings.AI_API_KEY

    async def enrich(self, document_text: str, case_id: str, document_id: Optional[str] = None) -> AIDocumentAnalysisResult:
        logger.info(f"Analyzing document of length {len(document_text)} for case {case_id} via provider '{self.provider}'")

        if not self.enabled or self.provider == "mock":
            return self._analyze_rule_based_mock(document_text, case_id, document_id)

        try:
            # If external LLM API is configured
            if self.provider == "openai" and self.api_key:
                return await self._analyze_with_openai(document_text, case_id, document_id)
            else:
                return self._analyze_rule_based_mock(document_text, case_id, document_id)
        except Exception as e:
            logger.warning(f"AI Analyzer API failed ({str(e)}), falling back to structured analytical extraction.")
            return self._analyze_rule_based_mock(document_text, case_id, document_id)

    async def _analyze_with_openai(self, document_text: str, case_id: str, document_id: Optional[str]) -> AIDocumentAnalysisResult:
        # Placeholder for external LLM client request with structured JSON schema format
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        prompt = (
            "You are an analytical assistant for intelligence analysis. Extract entities and relationships. "
            "Output JSON with summary, risk_level, extracted_entities, extracted_relationships. "
            "Do NOT mark anyone as guilty, criminal, or convicted."
        )
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": document_text[:3000]}
            ],
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                # Parse and sanitize output against safety constraints
                return self._parse_llm_json_response(content, document_text, case_id, document_id)

        return self._analyze_rule_based_mock(document_text, case_id, document_id)

    def _analyze_rule_based_mock(self, text: str, case_id: str, document_id: Optional[str]) -> AIDocumentAnalysisResult:
        """Deterministic NLP analytical parser with exact character offset provenance."""
        extracted_entities: List[ExtractedEntityItem] = []
        extracted_relationships: List[ExtractedRelationshipItem] = []

        # Find names (Capitalized pairs)
        person_matches = list(re.finditer(r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b', text))
        found_names = []
        for match in person_matches:
            name = match.group(1)
            # Skip safe exclusions
            if name.lower() in ["crime network", "intelligence platform", "first information", "state of"]:
                continue
            if name not in found_names:
                found_names.append(name)
                extracted_entities.append(ExtractedEntityItem(
                    entity_name=name,
                    entity_type="PERSON",
                    start_char=match.start(),
                    end_char=match.end(),
                    confidence=0.82
                ))

        # Find phone numbers
        phone_matches = list(re.finditer(r'\b(?:\+91|0)?[6-9]\d{9}\b', text))
        for match in phone_matches:
            extracted_entities.append(ExtractedEntityItem(
                entity_name=match.group(0),
                entity_type="PHONE",
                start_char=match.start(),
                end_char=match.end(),
                confidence=0.90
            ))

        # Find UPI / Financial IDs
        upi_matches = list(re.finditer(r'\b[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+\b', text))
        for match in upi_matches:
            extracted_entities.append(ExtractedEntityItem(
                entity_name=match.group(0),
                entity_type="UPI_ID",
                start_char=match.start(),
                end_char=match.end(),
                confidence=0.88
            ))

        # Build relationships between discovered names if 2 or more exist
        if len(found_names) >= 2:
            extracted_relationships.append(ExtractedRelationshipItem(
                source_entity=found_names[0],
                target_entity=found_names[1],
                relationship_type="ASSOCIATE_OF",
                confidence=0.75,
                fact_type=FactType.ANALYTICAL_INFERENCE
            ))

        # Calculate risk level based on key phrases
        risk_level = "MEDIUM"
        if any(w in text.lower() for w in ["hawala", "syndicate", "extortion", "arms", "explosive"]):
            risk_level = "HIGH"
        elif any(w in text.lower() for w in ["terror", "kingpin", "cartel"]):
            risk_level = "CRITICAL"
        elif len(extracted_entities) < 2:
            risk_level = "LOW"

        # Sanitize entities/relationships for banned labels
        self._sanitize_extraction_labels(extracted_entities, extracted_relationships)

        provenance = EvidenceProvenance(
            source_document_id=document_id or f"DOC-AI-{case_id[:10]}",
            start_offset=0,
            end_offset=len(text),
            snippet=text[:100]
        )


        return AIDocumentAnalysisResult(
            summary=f"AI analytical extraction identified {len(extracted_entities)} potential entities and {len(extracted_relationships)} inferred relationships from document text.",
            risk_level=risk_level,
            extracted_entities=extracted_entities,
            extracted_relationships=extracted_relationships,
            source_type="AI_EXTRACTION",
            fact_type=FactType.ANALYTICAL_INFERENCE,
            case_id=case_id,
            provenance=provenance
        )

    def _sanitize_extraction_labels(self, entities: List[ExtractedEntityItem], relationships: List[ExtractedRelationshipItem]):
        """Ensure no automated AI output applies criminal/guilty determinations."""
        for ent in entities:
            for banned in BANNED_AUTOMATED_LABELS:
                if banned in ent.entity_type.lower():
                    ent.entity_type = "SUSPECT_PERSON"
        for rel in relationships:
            for banned in BANNED_AUTOMATED_LABELS:
                if banned in rel.relationship_type.lower():
                    rel.relationship_type = "ALLEGED_ASSOCIATE"
