import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestAcademicService:
    """Smoke tests para academic-service"""

    def test_list_sedes_no_auth(self, client):
        """Intenta listar sedes sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/academic/sedes")
        assert r.status_code in (401, 403)

    def test_list_carreras_no_auth(self, client):
        """Intenta listar carreras sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/academic/carreras")
        assert r.status_code in (401, 403)

    def test_list_centros_no_auth(self, client):
        """Intenta listar centros sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/academic/centros")
        assert r.status_code in (401, 403)

    def test_create_sede_no_auth(self, client):
        """Intenta crear sede sin autenticación (debe retornar error)"""
        r = client.post("/api/v1/academic/sedes", json={"nombre": "Test"})
        assert r.status_code in (401, 403)
