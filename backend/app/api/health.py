from fastapi import APIRouter
from app.config import settings
import datetime

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health_status():
    """Returns system health, app metadata, and active database mode."""
    return {
        "status": "HEALTHY",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "graph_driver": "MockInMemoryGraphDriver" if settings.USE_MOCK_GRAPH else "Neo4jGraphDriver",
        "database_status": {
            "postgres": "CONFIGURED_STANDBY",
            "neo4j": "MOCK_MODE_ACTIVE" if settings.USE_MOCK_GRAPH else "CONNECTED"
        }
    }
