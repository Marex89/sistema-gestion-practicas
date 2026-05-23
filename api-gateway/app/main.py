from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.proxy.router import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create a shared AsyncClient on startup and cleanly close it on shutdown."""
    app.state.http_client = httpx.AsyncClient(timeout=30.0)
    yield
    await app.state.http_client.aclose()


app = FastAPI(
    title="API Gateway",
    description="Punto de entrada único para el sistema de gestión de prácticas.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # No se usan cookies; JWT va en Authorization header
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

app.include_router(router)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """Liveness probe — no authentication required."""
    return {"status": "ok"}
