import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.crud import internship as crud
from app.db.session import get_db
from app.schemas.internship import (
    Acta1Response,
    Acta1Update,
    PracticaCreate,
    PracticaResponse,
    PracticaUpdate,
)
from app.services.internship_service import notify_event

router = APIRouter(prefix="/internships", tags=["Internships"])


@router.post("/", response_model=PracticaResponse, status_code=status.HTTP_201_CREATED)
def create_practica(
    data: PracticaCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("COORDINADOR", "SUPER_ADMIN")),
):
    """Crea una nueva práctica. Solo COORDINADOR o ADMIN."""
    coordinador_id = uuid.UUID(user["user_id"])
    practica = crud.create_practica(db, data, coordinador_id)
    notify_event(
        "PRACTICA_CREADA",
        {"practica_id": str(practica.id), "alumno_id": str(practica.alumno_id)},
    )
    return practica


@router.get("/", response_model=list[PracticaResponse])
def list_practicas(
    estado: str | None = Query(default=None),
    carrera_id: uuid.UUID | None = Query(default=None),
    tipo: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    """Lista prácticas con filtros opcionales."""
    filters: dict = {}
    if estado:
        filters["estado"] = estado
    if carrera_id:
        filters["carrera_id"] = carrera_id
    if tipo:
        filters["tipo"] = tipo
    return crud.list_practicas(db, filters=filters, skip=skip, limit=limit)


@router.get("/{practica_id}", response_model=PracticaResponse)
def get_practica(
    practica_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    practica = crud.get_practica(db, practica_id)
    if not practica:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Práctica no encontrada"
        )
    return practica


@router.patch("/{practica_id}/estado", response_model=PracticaResponse)
def update_estado(
    practica_id: uuid.UUID,
    data: PracticaUpdate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("COORDINADOR", "JEFE_CARRERA", "SUPER_ADMIN")),
):
    practica = crud.get_practica(db, practica_id)
    if not practica:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Práctica no encontrada"
        )
    if not data.estado:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Se requiere el campo 'estado'",
        )
    practica = crud.update_estado(db, practica, data.estado)
    notify_event(
        "PRACTICA_ESTADO_ACTUALIZADO",
        {"practica_id": str(practica.id), "nuevo_estado": practica.estado},
    )
    return practica


@router.patch("/{practica_id}/docente", response_model=PracticaResponse)
def asignar_docente(
    practica_id: uuid.UUID,
    data: PracticaUpdate,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_roles("COORDINADOR", "SUPER_ADMIN")),
):
    practica = crud.get_practica(db, practica_id)
    if not practica:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Práctica no encontrada"
        )
    if not data.docente_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Se requiere el campo 'docente_id'",
        )
    practica = crud.asignar_docente(db, practica, data.docente_id)
    notify_event(
        "DOCENTE_ASIGNADO",
        {"practica_id": str(practica.id), "docente_id": str(practica.docente_id)},
    )
    return practica


@router.get("/{practica_id}/acta1", response_model=Acta1Response)
def get_acta1(
    practica_id: uuid.UUID,
    db: Session = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    practica = crud.get_practica(db, practica_id)
    if not practica:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Práctica no encontrada"
        )
    if not practica.acta1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Acta1 no encontrada"
        )
    return practica.acta1


@router.patch("/{practica_id}/acta1", response_model=Acta1Response)
def update_acta1_alumno(
    practica_id: uuid.UUID,
    data: Acta1Update,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("ALUMNO")),
):
    """El alumno completa el Acta1."""
    practica = crud.get_practica(db, practica_id)
    if not practica:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Práctica no encontrada"
        )
    if not practica.acta1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Acta1 no encontrada"
        )
    # Verificar que el alumno es el propietario de la práctica
    if str(practica.alumno_id) != user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="No es tu práctica"
        )
    return crud.update_acta1_alumno(db, practica.acta1, data)


@router.post("/{practica_id}/acta1/accept", response_model=Acta1Response)
def accept_acta1_docente(
    practica_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("DOCENTE")),
):
    """El docente acepta el Acta1."""
    practica = crud.get_practica(db, practica_id)
    if not practica:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Práctica no encontrada"
        )
    if not practica.acta1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Acta1 no encontrada"
        )
    # Verificar que el docente es el asignado a la práctica
    if str(practica.docente_id) != user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="No eres el docente asignado"
        )
    acta1 = crud.accept_acta1_docente(db, practica.acta1)
    notify_event(
        "ACTA1_ACEPTADA",
        {"practica_id": str(practica.id), "docente_id": user["user_id"]},
    )
    return acta1
