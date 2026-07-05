import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.crud import academic as crud
from app.db.session import get_db
from app.schemas.academic import (
    CarreraCreate,
    CarreraResponse,
    CarreraUpdate,
    CentroPracticaCreate,
    CentroPracticaResponse,
    CentroPracticaUpdate,
    SedeCreate,
    SedeResponse,
    SedeUpdate,
)

# ---------------------------------------------------------------------------
# Sedes
# ---------------------------------------------------------------------------

sedes_router = APIRouter(prefix="/sedes", tags=["Sedes"])


@sedes_router.get("/", response_model=list[SedeResponse])
def list_sedes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    return crud.list_sedes(db, skip=skip, limit=limit)


@sedes_router.post(
    "/", response_model=SedeResponse, status_code=status.HTTP_201_CREATED
)
def create_sede(
    data: SedeCreate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("COORDINADOR", "JEFE_CARRERA", "SUPER_ADMIN")),
):
    return crud.create_sede(db, data)


@sedes_router.get("/{sede_id}", response_model=SedeResponse)
def get_sede(
    sede_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    sede = crud.get_sede_by_id(db, sede_id)
    if not sede:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sede no encontrada"
        )
    return sede


@sedes_router.patch("/{sede_id}", response_model=SedeResponse)
def update_sede(
    sede_id: uuid.UUID,
    data: SedeUpdate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("COORDINADOR", "JEFE_CARRERA", "SUPER_ADMIN")),
):
    sede = crud.get_sede_by_id(db, sede_id)
    if not sede:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sede no encontrada"
        )
    return crud.update_sede(db, sede, data)


@sedes_router.patch("/{sede_id}/deactivate", response_model=SedeResponse)
def deactivate_sede(
    sede_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("JEFE_CARRERA", "SUPER_ADMIN")),
):
    sede = crud.get_sede_by_id(db, sede_id)
    if not sede:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Sede no encontrada"
        )
    return crud.deactivate_sede(db, sede)


# ---------------------------------------------------------------------------
# Carreras
# ---------------------------------------------------------------------------

carreras_router = APIRouter(prefix="/carreras", tags=["Carreras"])


@carreras_router.get("/", response_model=list[CarreraResponse])
def list_carreras(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    return crud.list_carreras(db, skip=skip, limit=limit)


@carreras_router.post(
    "/", response_model=CarreraResponse, status_code=status.HTTP_201_CREATED
)
def create_carrera(
    data: CarreraCreate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("COORDINADOR", "JEFE_CARRERA", "SUPER_ADMIN")),
):
    return crud.create_carrera(db, data)


@carreras_router.get("/{carrera_id}", response_model=CarreraResponse)
def get_carrera(
    carrera_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    carrera = crud.get_carrera_by_id(db, carrera_id)
    if not carrera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Carrera no encontrada"
        )
    return carrera


@carreras_router.patch("/{carrera_id}", response_model=CarreraResponse)
def update_carrera(
    carrera_id: uuid.UUID,
    data: CarreraUpdate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("COORDINADOR", "JEFE_CARRERA", "SUPER_ADMIN")),
):
    carrera = crud.get_carrera_by_id(db, carrera_id)
    if not carrera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Carrera no encontrada"
        )
    return crud.update_carrera(db, carrera, data)


@carreras_router.patch("/{carrera_id}/deactivate", response_model=CarreraResponse)
def deactivate_carrera(
    carrera_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("JEFE_CARRERA", "SUPER_ADMIN")),
):
    carrera = crud.get_carrera_by_id(db, carrera_id)
    if not carrera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Carrera no encontrada"
        )
    return crud.deactivate_carrera(db, carrera)


# ---------------------------------------------------------------------------
# Centros de Práctica
# ---------------------------------------------------------------------------

centros_router = APIRouter(prefix="/centros", tags=["Centros de Práctica"])


@centros_router.get("/", response_model=list[CentroPracticaResponse])
def list_centros(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    return crud.list_centros(db, skip=skip, limit=limit)


@centros_router.post(
    "/", response_model=CentroPracticaResponse, status_code=status.HTTP_201_CREATED
)
def create_centro(
    data: CentroPracticaCreate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("COORDINADOR", "JEFE_CARRERA", "SUPER_ADMIN")),
):
    return crud.create_centro(db, data)


@centros_router.get("/{centro_id}", response_model=CentroPracticaResponse)
def get_centro(
    centro_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    centro = crud.get_centro_by_id(db, centro_id)
    if not centro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Centro no encontrado"
        )
    return centro


@centros_router.patch("/{centro_id}", response_model=CentroPracticaResponse)
def update_centro(
    centro_id: uuid.UUID,
    data: CentroPracticaUpdate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("COORDINADOR", "JEFE_CARRERA", "SUPER_ADMIN")),
):
    centro = crud.get_centro_by_id(db, centro_id)
    if not centro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Centro no encontrado"
        )
    return crud.update_centro(db, centro, data)


@centros_router.patch("/{centro_id}/deactivate", response_model=CentroPracticaResponse)
def deactivate_centro(
    centro_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("JEFE_CARRERA", "SUPER_ADMIN")),
):
    centro = crud.get_centro_by_id(db, centro_id)
    if not centro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Centro no encontrado"
        )
    return crud.deactivate_centro(db, centro)
