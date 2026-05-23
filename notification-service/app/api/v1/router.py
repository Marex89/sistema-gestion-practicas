from fastapi import APIRouter

from app.api.v1.endpoints.notification import router as notification_router

router = APIRouter()

router.include_router(
    notification_router,
    prefix="/notifications",
    tags=["Notificaciones"],
)
