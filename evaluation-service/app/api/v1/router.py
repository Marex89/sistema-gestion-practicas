from fastapi import APIRouter

from app.api.v1.endpoints.evaluation import router as evaluation_router

router = APIRouter()

router.include_router(
    evaluation_router,
    prefix="/evaluations",
    tags=["Evaluaciones"],
)
