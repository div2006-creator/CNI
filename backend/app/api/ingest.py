from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.ingestion.engine import IngestionEngine
from app.schemas.ingestion import IngestionSummary, TextInputIngest

router = APIRouter(prefix="/ingest", tags=["Live Data Ingestion Engine"])


@router.post("/upload", response_model=IngestionSummary)
async def upload_and_ingest_file(
    file: UploadFile = File(...),
    source_type: Optional[str] = Form(None)
):
    """
    Ingest a CDR CSV, UPI/Financial transaction CSV, or FIR report text file.
    Extracts entities & relationships and immediately updates the active Knowledge Graph.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a valid filename.")

    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8", errors="ignore")

        summary = IngestionEngine.ingest_content(
            content=content_str,
            filename=file.filename,
            source_type=source_type
        )
        return summary
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to ingest file '{file.filename}': {str(exc)}")


@router.post("/text", response_model=IngestionSummary)
def ingest_raw_text(payload: TextInputIngest):
    """
    Ingest raw text snippet (FIR report / field surveillance notes) directly.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    try:
        summary = IngestionEngine.ingest_content(
            content=payload.text,
            filename=payload.title or "field_report.txt",
            source_type=payload.source_type or "FIR_REPORT"
        )
        return summary
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to ingest text snippet: {str(exc)}")
