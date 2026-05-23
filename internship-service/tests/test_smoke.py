import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestInternshipService:
    """Smoke tests para internship-service"""

    def test_list_practicas_no_auth(self, client):
        """Intenta listar prácticas sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/internships")
        assert r.status_code in (401, 403)

    def test_create_practica_no_auth(self, client):
        """Intenta crear práctica sin autenticación (debe retornar error)"""
        r = client.post(
            "/api/v1/internships",
            json={
                "alumno_id": "00000000-0000-0000-0000-000000000000",
                "coordinador_id": "00000000-0000-0000-0000-000000000000",
                "centro_practica_id": "00000000-0000-0000-0000-000000000000",
                "carrera_id": "00000000-0000-0000-0000-000000000000",
            }
        )
        assert r.status_code in (401, 403)
