import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings
from app.integrations.geocoding.nominatim import NominatimGeocodingProvider
from app.integrations.news.public_news import PublicNewsProvider
from app.integrations.ai.ai_analyzer import AIDocumentAnalyzerProvider
from app.integrations.enrichment_service import EnrichmentService, enrichment_service
from app.schemas.fact import FactType

client = TestClient(app)

# Helper runner
def run_async(coro):
    return asyncio.run(coro)

# 1. Nominatim Geocoding Mock Transport Test
def test_nominatim_geocoding_mock_transport():
    async def _test():
        provider = NominatimGeocodingProvider(enabled=True)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = [{
            "lat": "19.0760",
            "lon": "72.8777",
            "display_name": "Mumbai, Maharashtra, India",
            "boundingbox": ["18.9", "19.2", "72.7", "73.0"],
            "address": {"city": "Mumbai", "country": "India"}
        }]

        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response
            res = await provider.enrich("Mumbai Police HQ", case_id="CASE-TEST-101")
            assert res.lat == 19.0760
            assert res.lon == 72.8777
            assert res.display_name == "Mumbai, Maharashtra, India"
            assert res.case_id == "CASE-TEST-101"
            assert res.source_type == "GEOCODING_ENRICHMENT"
            # Verify User-Agent header was set
            headers = mock_get.call_args.kwargs.get("headers", {})
            assert "User-Agent" in headers
            assert "CNI-Intelligence-Platform" in headers["User-Agent"]
    run_async(_test())

# 2. Nominatim Offline Fallback Test
def test_nominatim_geocoding_offline_fallback():
    async def _test():
        provider = NominatimGeocodingProvider(enabled=False)
        res = await provider.enrich("Delhi Gate", case_id="CASE-TEST-102")
        assert res.case_id == "CASE-TEST-102"
        assert "Delhi" in res.display_name
        assert "MOCK-GEO" in res.provenance.source_document_id

    run_async(_test())

# 3. Nominatim Non-Fact Classification Test
def test_nominatim_non_fact_classification():
    async def _test():
        provider = NominatimGeocodingProvider(enabled=False)
        res = await provider.enrich("Bangalore", case_id="CASE-TEST-103")
        assert res.fact_type == FactType.ANALYTICAL_INFERENCE
        assert res.fact_type != FactType.DOCUMENT_FACT
    run_async(_test())

# 4. Public News Mock Transport Test
def test_public_news_mock_transport():
    async def _test():
        provider = PublicNewsProvider(api_key="test-api-key-xyz123", enabled=True)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "articles": [
                {
                    "title": "Financial Investigation Opened",
                    "url": "https://news.example.com/item1",
                    "description": "Authorities investigate suspicious wire transfer.",
                    "source": {"name": "Financial Times Digest"},
                    "publishedAt": "2026-08-01T12:00:00Z"
                }
            ]
        }

        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response
            res = await provider.enrich("Hawala", case_id="CASE-TEST-104")
            assert res.total_results == 1
            assert res.articles[0].title == "Financial Investigation Opened"
            assert res.articles[0].publisher == "Financial Times Digest"
            assert res.case_id == "CASE-TEST-104"
            # Verify API key param was sent
            params = mock_get.call_args.kwargs.get("params", {})
            assert params.get("apiKey") == "test-api-key-xyz123"
    run_async(_test())

# 5. Public News Fallback Mode Test
def test_public_news_fallback_mode():
    async def _test():
        provider = PublicNewsProvider(api_key="", enabled=True)
        res = await provider.enrich("Money Laundering", case_id="CASE-TEST-105")
        assert res.total_results >= 1
        assert "FALLBACK" in res.disclaimer
        assert res.case_id == "CASE-TEST-105"
    run_async(_test())

# 6. Public News Disclaimer and Classification Test
def test_public_news_disclaimer_and_classification():
    async def _test():
        provider = PublicNewsProvider(api_key="", enabled=True)
        res = await provider.enrich("Syndicate", case_id="CASE-TEST-106")
        assert res.source_type == "EXTERNAL_PUBLIC_SOURCE"
        assert res.fact_type == FactType.ANALYTICAL_INFERENCE
        assert "unverified third-party" in res.disclaimer.lower()
    run_async(_test())

# 7. AI Analyzer Rule-Based Extraction Test
def test_ai_analyzer_rule_based():
    async def _test():
        provider = AIDocumentAnalyzerProvider(provider="mock", enabled=True)
        text = "FIR report against Rahul Sharma (Phone: 9876543210). Transfer to rahul@upi."
        res = await provider.enrich(text, case_id="CASE-TEST-107", document_id="DOC-99")
        assert len(res.extracted_entities) >= 2
        ent_names = [e.entity_name for e in res.extracted_entities]
        assert "Rahul Sharma" in ent_names
        assert "9876543210" in ent_names
        assert res.provenance.source_document_id == "DOC-99"
    run_async(_test())

# 8. AI Analyzer OpenAI Integration Mock Test
def test_ai_analyzer_openai_mock():
    async def _test():
        provider = AIDocumentAnalyzerProvider(provider="openai", api_key="sk-test-key", enabled=True)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "choices": [{
                "message": {
                    "content": '{"summary":"Extracted key entities.","risk_level":"HIGH","extracted_entities":[],"extracted_relationships":[]}'
                }
            }]
        }

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_response
            res = await provider.enrich("Sample text", case_id="CASE-TEST-108")
            assert res.case_id == "CASE-TEST-108"
            assert res.source_type == "AI_EXTRACTION"
    run_async(_test())

# 9. AI Analyzer Banned Label Sanitization Test
def test_ai_analyzer_banned_label_sanitization():
    async def _test():
        provider = AIDocumentAnalyzerProvider(provider="mock", enabled=True)
        text = "Suspect Amit Kumar is accused of extortion."
        res = await provider.enrich(text, case_id="CASE-TEST-109")
        for e in res.extracted_entities:
            assert "criminal" not in e.entity_type.lower()
            assert "guilty" not in e.entity_type.lower()
        for r in res.extracted_relationships:
            assert "criminal" not in r.relationship_type.lower()
            assert "guilty" not in r.relationship_type.lower()
    run_async(_test())

# 10. AI Analyzer Character Offsets Test
def test_ai_analyzer_character_offsets():
    async def _test():
        provider = AIDocumentAnalyzerProvider(provider="mock", enabled=True)
        text = "Report on Rajesh Kumar near airport."
        res = await provider.enrich(text, case_id="CASE-TEST-110")
        for e in res.extracted_entities:
            assert e.start_char >= 0
            assert e.end_char > e.start_char
            assert text[e.start_char:e.end_char] == e.entity_name
    run_async(_test())

# 11. AI Analyzer Safety Disclaimer Test
def test_ai_analyzer_safety_disclaimer():
    async def _test():
        provider = AIDocumentAnalyzerProvider(provider="mock", enabled=True)
        res = await provider.enrich("Text", case_id="CASE-TEST-111")
        assert "analytical inferences" in res.safety_disclaimer.lower()
        assert "human investigator verification" in res.safety_disclaimer.lower()
    run_async(_test())

# 12. Enrichment Service Caching Test
def test_enrichment_service_caching():
    async def _test():
        service = EnrichmentService()
        await service.clear_cache()
        res1 = await service.geocode_location("Mumbai Central", case_id="CASE-A")
        res2 = await service.geocode_location("Mumbai Central", case_id="CASE-A")
        assert res1.display_name == res2.display_name
    run_async(_test())

# 13. Enrichment Service Case Isolation Test
def test_enrichment_service_case_isolation():
    async def _test():
        service = EnrichmentService()
        await service.clear_cache()
        res_a = await service.geocode_location("Connaught Place", case_id="CASE-ALPHA")
        assert res_a.case_id == "CASE-ALPHA"

        res_b = await service.geocode_location("Connaught Place", case_id="CASE-BETA")
        assert res_b.case_id == "CASE-BETA"
        assert res_b.case_id != "CASE-ALPHA"
    run_async(_test())

# 14. Enrichment Status Endpoint Test
def test_enrichment_status_endpoint():
    response = client.get("/api/enrichment/status")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 3
    providers = [p["provider"] for p in data]
    assert "NominatimGeocoding" in providers
    assert "PublicNewsSearch" in providers
    assert "AIDocumentAnalyzer" in providers

# 15. Geocoding API Endpoint Test
def test_geocoding_api_endpoint():
    payload = {"query": "Marine Drive, Mumbai", "case_id": "API-CASE-001"}
    response = client.post("/api/enrichment/geocoding", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "API-CASE-001"
    assert data["source_type"] == "GEOCODING_ENRICHMENT"
    assert data["fact_type"] == "ANALYTICAL_INFERENCE"

# 16. News API Endpoint Test
def test_news_api_endpoint():
    payload = {"keywords": "UPI syndicate", "case_id": "API-CASE-002"}
    response = client.post("/api/enrichment/news", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "API-CASE-002"
    assert data["source_type"] == "EXTERNAL_PUBLIC_SOURCE"
    assert "disclaimer" in data

# 17. AI Analyze API Endpoint Test
def test_ai_analyze_api_endpoint():
    payload = {
        "document_text": "FIR #102: Statement of Witness Suresh Patel against Rajesh Verma (+919876543210).",
        "case_id": "API-CASE-003",
        "document_id": "DOC-FIR-102"
    }
    response = client.post("/api/enrichment/ai-analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "API-CASE-003"
    assert data["source_type"] == "AI_EXTRACTION"
    assert data["fact_type"] == "ANALYTICAL_INFERENCE"
    assert "safety_disclaimer" in data

# 18. External Data Never Marks Relationship Supported Test
def test_external_data_never_marks_relationship_supported():
    async def _test():
        service = EnrichmentService()
        news_res = await service.search_public_news("Criminal Record Suspect", case_id="CASE-SAFE-01")
        ai_res = await service.analyze_document_ai("Suspect accused of crime.", case_id="CASE-SAFE-01")

        assert news_res.fact_type == FactType.ANALYTICAL_INFERENCE
        assert ai_res.fact_type == FactType.ANALYTICAL_INFERENCE
        for r in ai_res.extracted_relationships:
            assert r.fact_type == FactType.ANALYTICAL_INFERENCE
    run_async(_test())
