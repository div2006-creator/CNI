import logging
from typing import List
from fastapi import APIRouter, HTTPException, status, Query
from app.schemas.enrichment import (
    GeocodingQuery,
    GeocodingResult,
    NewsSearchQuery,
    PublicNewsResult,
    AIDocumentAnalysisQuery,
    AIDocumentAnalysisResult,
    EnrichmentStatus
)
from app.integrations.enrichment_service import enrichment_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enrichment", tags=["external-enrichment"])

@router.post("/geocoding", response_model=GeocodingResult)
async def geocode_location(query: GeocodingQuery):
    """Geocode a location query to latitude/longitude with OpenStreetMap/Nominatim."""
    try:
        return await enrichment_service.geocode_location(query.query, query.case_id)
    except Exception as e:
        logger.error(f"Geocoding endpoint error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Geocoding failed: {str(e)}")

@router.post("/news", response_model=PublicNewsResult)
async def search_public_news(query: NewsSearchQuery):
    """Search external public news reports for investigative keywords."""
    try:
        return await enrichment_service.search_public_news(query.keywords, query.case_id, language=query.language or "en")
    except Exception as e:
        logger.error(f"Public news endpoint error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Public news search failed: {str(e)}")

@router.post("/ai-analyze", response_model=AIDocumentAnalysisResult)
async def analyze_document_ai(query: AIDocumentAnalysisQuery):
    """Analyze raw document text with AI NLP parser for analytical inferences."""
    try:
        return await enrichment_service.analyze_document_ai(query.document_text, query.case_id, query.document_id)
    except Exception as e:
        logger.error(f"AI document analysis endpoint error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI document analysis failed: {str(e)}")

@router.get("/status", response_model=List[EnrichmentStatus])
async def get_enrichment_status():
    """Get status of configured external enrichment providers."""
    return await enrichment_service.get_status()

@router.post("/clear-cache")
async def clear_enrichment_cache():
    """Clear internal enrichment cache."""
    await enrichment_service.clear_cache()
    return {"message": "Enrichment cache cleared successfully."}
