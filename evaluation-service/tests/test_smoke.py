import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestEvaluationService:
    """Smoke tests para evaluation-service"""

    def test_list_evaluaciones_no_auth(self, client):
        """Intenta listar evaluaciones sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/evaluations")
        assert r.status_code in (401, 403)

    def test_create_evaluacion_no_auth(self, client):
        """Intenta crear evaluación sin autenticación (debe retornar error)"""
        r = client.post(
            "/api/v1/evaluations/desempeno",
            json={"practica_id": "00000000-0000-0000-0000-000000000000"}
        )
        assert r.status_code in (401, 403)

    def test_get_acta_final_no_auth(self, client):
        """Intenta consultar acta final sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/evaluations/acta-final/00000000-0000-0000-0000-000000000000")
        assert r.status_code in (401, 403)
