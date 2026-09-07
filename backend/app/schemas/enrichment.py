from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.fact import FactType, EvidenceProvenance

class GeocodingQuery(BaseModel):
    query: str = Field(..., description="Location address, city, or landmark string")
    case_id: str = Field(..., description="Associated case identifier")

class GeocodingResult(BaseModel):
    query: str
    display_name: str
    lat: float
    lon: float
    boundingbox: Optional[List[str]] = None
    address_details: Optional[Dict[str, Any]] = None
    confidence: float = Field(0.85, ge=0.0, le=1.0)
    source_type: str = "GEOCODING_ENRICHMENT"
    fact_type: FactType = FactType.ANALYTICAL_INFERENCE
    case_id: str
    provenance: EvidenceProvenance

class NewsSearchQuery(BaseModel):
    keywords: str = Field(..., description="Keywords to search in public news")
    case_id: str = Field(..., description="Associated case identifier")
    language: Optional[str] = "en"

class NewsArticle(BaseModel):
    title: str
    url: str
    snippet: str
    publisher: str
    published_at: Optional[str] = None

class PublicNewsResult(BaseModel):
    query: str
    total_results: int
    articles: List[NewsArticle] = Field(default_factory=list)
    confidence: float = Field(0.70, ge=0.0, le=1.0)
    source_type: str = "EXTERNAL_PUBLIC_SOURCE"
    fact_type: FactType = FactType.ANALYTICAL_INFERENCE
    case_id: str
    disclaimer: str = "External public news search results represent third-party reports, not verified document facts."

class AIDocumentAnalysisQuery(BaseModel):
    document_text: str = Field(..., min_length=1, description="Raw text of the document to analyze")
    case_id: str = Field(..., description="Associated case identifier")
    document_id: Optional[str] = None

class ExtractedEntityItem(BaseModel):
    entity_name: str
    entity_type: str
    start_char: int
    end_char: int
    confidence: float = Field(..., ge=0.0, le=1.0)

class ExtractedRelationshipItem(BaseModel):
    source_entity: str
    target_entity: str
    relationship_type: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    fact_type: FactType = FactType.ANALYTICAL_INFERENCE

class AIDocumentAnalysisResult(BaseModel):
    summary: str
    risk_level: str  # e.g., LOW, MEDIUM, HIGH, CRITICAL
    extracted_entities: List[ExtractedEntityItem] = Field(default_factory=list)
    extracted_relationships: List[ExtractedRelationshipItem] = Field(default_factory=list)
    source_type: str = "AI_EXTRACTION"
    fact_type: FactType = FactType.ANALYTICAL_INFERENCE
    case_id: str
    provenance: EvidenceProvenance
    safety_disclaimer: str = "AI extractions are analytical inferences and require human investigator verification before being converted into evidence or legal determinations."

class EnrichmentStatus(BaseModel):
    provider: str
    enabled: bool
    status: str
    details: Optional[str] = None
