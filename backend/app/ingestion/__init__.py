"""
Ingestion Package for AI-Powered Criminal Network Intelligence & Relationship Analysis System.
Provides parsers for CDR CSV, UPI/Financial CSV, and FIR text reports, entity & relationship extractors, and unified ingestion engine.
"""

from app.ingestion.engine import IngestionEngine

__all__ = ["IngestionEngine"]
