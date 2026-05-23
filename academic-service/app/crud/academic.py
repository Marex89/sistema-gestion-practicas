import uuid

from sqlalchemy.orm import Session

from app.models.academic import Carrera, CentroPractica, Sede
from app.schemas.academic import (
    CarreraCreate,
    CarreraUpdate,
    CentroPracticaCreate,
    CentroPracticaUpdate,
    SedeCreate,
    SedeUpdate,
)

# ---------------------------------------------------------------------------
# Sede
# ---------------------------------------------------------------------------


def get_sede_by_id(db: Session, sede_id: uuid.UUID) -> Sede | None:
    return db.query(Sede).filter(Sede.id == sede_id).first()


def list_sedes(
    db: Session, skip: int = 0, limit: int = 100, only_active: bool = True
) -> list[Sede]:
    q = db.query(Sede)
    if only_active:
        q = q.filter(Sede.is_active.is_(True))
    return q.offset(skip).limit(limit).all()


def create_sede(db: Session, data: SedeCreate) -> Sede:
    sede = Sede(**data.model_dump())
    db.add(sede)
    db.commit()
    db.refresh(sede)
    return sede


def update_sede(db: Session, sede: Sede, data: SedeUpdate) -> Sede:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sede, field, value)
    db.commit()
    db.refresh(sede)
    return sede


def deactivate_sede(db: Session, sede: Sede) -> Sede:
    sede.is_active = False
    db.commit()
    db.refresh(sede)
    return sede


# ---------------------------------------------------------------------------
# Carrera
# ---------------------------------------------------------------------------


def get_carrera_by_id(db: Session, carrera_id: uuid.UUID) -> Carrera | None:
    return db.query(Carrera).filter(Carrera.id == carrera_id).first()


def list_carreras(
    db: Session, skip: int = 0, limit: int = 100, only_active: bool = True
) -> list[Carrera]:
    q = db.query(Carrera)
    if only_active:
        q = q.filter(Carrera.is_active.is_(True))
    return q.offset(skip).limit(limit).all()


def create_carrera(db: Session, data: CarreraCreate) -> Carrera:
    carrera = Carrera(**data.model_dump())
    db.add(carrera)
    db.commit()
    db.refresh(carrera)
    return carrera


def update_carrera(db: Session, carrera: Carrera, data: CarreraUpdate) -> Carrera:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(carrera, field, value)
    db.commit()
    db.refresh(carrera)
    return carrera


def deactivate_carrera(db: Session, carrera: Carrera) -> Carrera:
    carrera.is_active = False
    db.commit()
    db.refresh(carrera)
    return carrera


# ---------------------------------------------------------------------------
# CentroPractica
# ---------------------------------------------------------------------------


def get_centro_by_id(db: Session, centro_id: uuid.UUID) -> CentroPractica | None:
    return db.query(CentroPractica).filter(CentroPractica.id == centro_id).first()


def list_centros(
    db: Session, skip: int = 0, limit: int = 100, only_active: bool = True
) -> list[CentroPractica]:
    q = db.query(CentroPractica)
    if only_active:
        q = q.filter(CentroPractica.is_active.is_(True))
    return q.offset(skip).limit(limit).all()


def create_centro(db: Session, data: CentroPracticaCreate) -> CentroPractica:
    centro = CentroPractica(**data.model_dump())
    db.add(centro)
    db.commit()
    db.refresh(centro)
    return centro


def update_centro(
    db: Session, centro: CentroPractica, data: CentroPracticaUpdate
) -> CentroPractica:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(centro, field, value)
    db.commit()
    db.refresh(centro)
    return centro


def deactivate_centro(db: Session, centro: CentroPractica) -> CentroPractica:
    centro.is_active = False
    db.commit()
    db.refresh(centro)
    return centro
