import os
from typing import List
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "AI Criminal Network Intelligence System"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    SECRET_KEY: str = "development-secret-key-change-in-prod"
    ALGORITHM: str = "HS256"

    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "intel_network_db"

    # Graph
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"
    USE_MOCK_GRAPH: bool = True

    # AI / NLP
    NLP_MODEL_NAME: str = "en_core_web_sm"
    ENTITY_CONFIDENCE_THRESHOLD: float = 0.75
    PATTERN_RISK_THRESHOLD: float = 0.60

    model_config = ConfigDict(env_file=".env", extra="ignore")

settings = Settings()
