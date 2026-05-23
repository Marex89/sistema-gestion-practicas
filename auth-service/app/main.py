from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar modelos para que Base los registre antes del create_all
import app.models.user  # noqa: F401
from app.api.v1.router import api_router
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: crear tablas si no existen
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: nada que limpiar por ahora


app = FastAPI(
    title="Auth Service",
    description="Microservicio de identidad y acceso. Gestiona usuarios y emite JWT.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok", "service": "auth-service"}
