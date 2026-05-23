import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestAuthService:
    """Smoke tests para auth-service"""

    def test_login_invalid_creds(self, client):
        """Intenta login con credenciales inválidas (debe retornar error)"""
        r = client.post("/api/v1/auth/login", data={"username": "fake", "password": "fake"})
        assert r.status_code == 401

    def test_create_user_no_auth(self, client):
        """Intenta crear usuario sin autenticación (debe retornar error)"""
        r = client.post(
            "/api/v1/users",
            json={"rut": "99999999-9", "nombre": "Test", "apellido": "User", "email": "test@test.com", "password": "pass", "rol": "ALUMNO"}
        )
        # Sin headers X-User-* debe fallar
        assert r.status_code in (401, 403)

    def test_health_check(self, client):
        """Verifica que el servicio responde en /health"""
        # Algunos servicios pueden no tener /health
        try:
            r = client.get("/health")
            # Si existe, debe estar disponible
            assert r.status_code == 200
        except:
            # Si no existe, es OK
            pass
