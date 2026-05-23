from fastapi import APIRouter

from app.api.v1.endpoints.academic import carreras_router, centros_router, sedes_router

router = APIRouter(prefix="/academic")

router.include_router(sedes_router)
router.include_router(carreras_router)
router.include_router(centros_router)
