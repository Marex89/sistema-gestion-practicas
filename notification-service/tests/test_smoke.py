import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestNotificationService:
    """Smoke tests para notification-service"""

    def test_send_notification_no_auth(self, client):
        """Intenta enviar notificación sin autenticación (debe retornar error)"""
        r = client.post(
            "/api/v1/notifications/send",
            json={"destinatario": "test@test.com", "mensaje": "test"}
        )
        assert r.status_code in (401, 403)

    def test_get_history_no_auth(self, client):
        """Intenta consultar historial sin autenticación (debe retornar error)"""
        r = client.get("/api/v1/notifications/history/00000000-0000-0000-0000-000000000000")
        assert r.status_code in (401, 403)
