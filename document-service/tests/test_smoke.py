import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestDocumentService:
    """Smoke tests para document-service"""

    def test_list_documents_no_auth(self, client):
        """Intenta listar documentos sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/documents")
        assert r.status_code in (401, 403)

    def test_upload_document_no_auth(self, client):
        """Intenta cargar documento sin autenticación (debe retornar error)"""
        r = client.post("/api/v1/documents", data={"tipo": "informe"})
        assert r.status_code in (401, 403)

    def test_download_document_no_auth(self, client):
        """Intenta descargar documento sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/documents/00000000-0000-0000-0000-000000000000")
        assert r.status_code in (401, 403)
