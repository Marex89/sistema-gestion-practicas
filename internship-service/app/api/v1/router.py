from fastapi import APIRouter

from app.api.v1.endpoints.internship import router as internship_router

router = APIRouter()

router.include_router(internship_router)
