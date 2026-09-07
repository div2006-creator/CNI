from typing import Dict, List, Optional
from app.schemas.document import SourceDocument

class DocumentStore:
    """
    In-memory store for tracking uploaded SourceDocument models by case_id and document_id.
    Ensures strict case isolation for source document metadata.
    """
    def __init__(self):
        self._documents: Dict[str, SourceDocument] = {}

    def add_document(self, document: SourceDocument) -> SourceDocument:
        self._documents[document.id] = document
        return document

    def get_document(self, document_id: str) -> Optional[SourceDocument]:
        return self._documents.get(document_id)

    def list_documents(self, case_id: Optional[str] = None) -> List[SourceDocument]:
        if not case_id:
            return list(self._documents.values())
        return [doc for doc in self._documents.values() if doc.case_id == case_id]

    def clear(self):
        self._documents.clear()

# Global DocumentStore instance
document_store = DocumentStore()
