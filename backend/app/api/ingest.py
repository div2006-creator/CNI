from typing import Optional, List
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.ingestion.engine import IngestionEngine
from app.schemas.ingestion import IngestionSummary, TextInputIngest
from app.schemas.document import SourceDocument
from app.evidence.document_store import document_store

router = APIRouter(prefix="/ingest", tags=["Live Data Ingestion Engine"])


@router.post("/upload", response_model=IngestionSummary)
async def upload_and_ingest_file(
    file: UploadFile = File(...),
    source_type: Optional[str] = Form(None),
    case_id: Optional[str] = Form(None)
):
    """
    Ingest a CDR CSV, UPI/Financial transaction CSV, or FIR report text file.
    Extracts entities & relationships and immediately updates the active Knowledge Graph scoped by case_id.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a valid filename.")

    try:
        content_bytes = await file.read()
        content_str = content_bytes.decode("utf-8", errors="ignore")

        summary = IngestionEngine.ingest_content(
            content=content_str,
            filename=file.filename,
            source_type=source_type,
            case_id=case_id or "DEMO-CASE-001"
        )
        return summary
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
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
            source_type=payload.source_type or "FIR_REPORT",
            case_id=payload.case_id or "DEMO-CASE-001"
        )
        return summary
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to ingest text snippet: {str(exc)}")


@router.get("/documents", response_model=List[SourceDocument])
def list_source_documents(case_id: Optional[str] = None):
    """
    Retrieve ingested SourceDocument records scoped by case_id.
    """
    return document_store.list_documents(case_id=case_id)

