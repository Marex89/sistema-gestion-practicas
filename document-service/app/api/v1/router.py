from fastapi import APIRouter

from app.api.v1.endpoints.document import router as document_router

router = APIRouter()

router.include_router(
    document_router,
    prefix="/documents",
    tags=["Documentos"],
)
