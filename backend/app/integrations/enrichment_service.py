import logging
import asyncio
from typing import Dict, Any, Tuple, List, Optional
from app.config import settings
from app.integrations.geocoding.nominatim import NominatimGeocodingProvider
from app.integrations.news.public_news import PublicNewsProvider
from app.integrations.ai.ai_analyzer import AIDocumentAnalyzerProvider
from app.schemas.enrichment import (
    GeocodingResult,
    PublicNewsResult,
    AIDocumentAnalysisResult,
    EnrichmentStatus
)

logger = logging.getLogger(__name__)

class EnrichmentService:
    def __init__(self):
        self.geocoding_provider = NominatimGeocodingProvider(enabled=settings.GEOCODING_ENABLED)
        self.news_provider = PublicNewsProvider(enabled=settings.NEWS_API_ENABLED)
        self.ai_provider = AIDocumentAnalyzerProvider(enabled=settings.AI_EXTRACTION_ENABLED)
        self._cache: Dict[Tuple[str, str], Any] = {}
        self._cache_lock = asyncio.Lock()

    async def geocode_location(self, query: str, case_id: str) -> GeocodingResult:
        cache_key = ("geocoding", query.strip().lower())
        async with self._cache_lock:
            if cache_key in self._cache:
                cached: GeocodingResult = self._cache[cache_key]
                # Guarantee case isolation by updating case_id on cache return
                result = cached.model_copy(update={"case_id": case_id})
                return result

        result = await self.geocoding_provider.enrich(query, case_id)
        async with self._cache_lock:
            self._cache[cache_key] = result
        return result

    async def search_public_news(self, keywords: str, case_id: str, language: str = "en") -> PublicNewsResult:
        cache_key = ("news", f"{keywords.strip().lower()}:{language}")
        async with self._cache_lock:
            if cache_key in self._cache:
                cached: PublicNewsResult = self._cache[cache_key]
                result = cached.model_copy(update={"case_id": case_id})
                return result

        result = await self.news_provider.enrich(keywords, case_id, language=language)
        async with self._cache_lock:
            self._cache[cache_key] = result
        return result

    async def analyze_document_ai(self, document_text: str, case_id: str, document_id: Optional[str] = None) -> AIDocumentAnalysisResult:
        # Document analysis is executed per document instance
        return await self.ai_provider.enrich(document_text, case_id, document_id=document_id)

    async def get_status(self) -> List[EnrichmentStatus]:
        return [
            EnrichmentStatus(
                provider="NominatimGeocoding",
                enabled=self.geocoding_provider.enabled,
                status="ACTIVE" if self.geocoding_provider.enabled else "DISABLED",
                details=f"User-Agent: {settings.NOMINATIM_USER_AGENT}"
            ),
            EnrichmentStatus(
                provider="PublicNewsSearch",
                enabled=self.news_provider.enabled,
                status="ACTIVE" if self.news_provider.enabled and self.news_provider.api_key else "OFFLINE_FALLBACK",
                details="API Key configured" if self.news_provider.api_key else "No API Key provided, using open-source fallback mode."
            ),
            EnrichmentStatus(
                provider="AIDocumentAnalyzer",
                enabled=self.ai_provider.enabled,
                status="ACTIVE" if self.ai_provider.enabled else "DISABLED",
                details=f"Provider: {self.ai_provider.provider}"
            )
        ]

    async def clear_cache(self):
        async with self._cache_lock:
            self._cache.clear()

enrichment_service = EnrichmentService()
