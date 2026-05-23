import pytest
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Base de datos SQLite en memoria para tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"

engine_test = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Crea todas las tablas antes de la suite de tests y las elimina al terminar."""
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def db_session():
    """Sesión de BD limpia por test (con rollback al finalizar)."""
    connection = engine_test.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db_session):
    """TestClient con la sesión de BD de test inyectada."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# Headers de ejemplo para simular el API Gateway
HEADERS_COORDINADOR = {
    "X-User-Id": "00000000-0000-0000-0000-000000000001",
    "X-User-Role": "COORDINADOR",
}
HEADERS_DOCENTE = {
    "X-User-Id": "00000000-0000-0000-0000-000000000002",
    "X-User-Role": "DOCENTE",
}
HEADERS_ALUMNO = {
    "X-User-Id": "00000000-0000-0000-0000-000000000003",
    "X-User-Role": "ALUMNO",
}
HEADERS_JEFE = {
    "X-User-Id": "00000000-0000-0000-0000-000000000004",
    "X-User-Role": "JEFE_CARRERA",
}
