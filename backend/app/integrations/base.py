import logging
import asyncio
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

class BaseEnrichmentProvider(ABC):
    def __init__(self, name: str, enabled: bool = True, timeout: float = 10.0):
        self.name = name
        self.enabled = enabled
        self.timeout = timeout

    @abstractmethod
    async def enrich(self, query: Any, case_id: str) -> Dict[str, Any]:
        """Execute enrichment request for a specific case."""
        pass

    def mask_secret(self, secret: Optional[str]) -> str:
        """Helper to mask sensitive API keys in logs."""
        if not secret:
            return "<none>"
        if len(secret) <= 6:
            return "***"
        return f"{secret[:3]}***{secret[-3:]}"
