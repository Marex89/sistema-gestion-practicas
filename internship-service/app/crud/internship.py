import uuid

from sqlalchemy.orm import Session

from app.models.internship import Acta1, Practica
from app.schemas.internship import Acta1Update, PracticaCreate
from app.services.internship_service import calcular_fecha_termino

# Horas por tipo de práctica (valores por defecto; se pueden sobreescribir si se
# consulta academic-service para obtener los valores de la carrera).
_HORAS_DEFAULT = {"LABORAL": 240, "PROFESIONAL": 360}


def create_practica(
    db: Session, data: PracticaCreate, coordinador_id: uuid.UUID
) -> Practica:
    """
    Crea una Practica junto a su Acta1 vacía.
    La fecha de término se calcula automáticamente usando las horas del tipo.
    """
    horas = _HORAS_DEFAULT.get(data.tipo.upper(), 240)
    fecha_termino = calcular_fecha_termino(data.fecha_inicio, data.tipo, horas)

    practica = Practica(
        alumno_id=data.alumno_id,
        coordinador_id=coordinador_id,
        carrera_id=data.carrera_id,
        centro_practica_id=data.centro_practica_id,
        tipo=data.tipo.upper(),
        estado="PENDIENTE",
        fecha_inicio=data.fecha_inicio,
        fecha_termino_calculada=fecha_termino,
    )
    db.add(practica)
    db.flush()  # obtener el id antes de crear el acta

    acta1 = Acta1(practica_id=practica.id)
    db.add(acta1)

    db.commit()
    db.refresh(practica)
    return practica


def get_practica(db: Session, practica_id: uuid.UUID) -> Practica | None:
    return db.query(Practica).filter(Practica.id == practica_id).first()


def list_practicas(
    db: Session,
    filters: dict,
    skip: int = 0,
    limit: int = 100,
) -> list[Practica]:
    q = db.query(Practica)
    if estado := filters.get("estado"):
        q = q.filter(Practica.estado == estado)
    if carrera_id := filters.get("carrera_id"):
        q = q.filter(Practica.carrera_id == carrera_id)
    if tipo := filters.get("tipo"):
        q = q.filter(Practica.tipo == tipo)
    return q.offset(skip).limit(limit).all()


def update_estado(db: Session, practica: Practica, estado: str) -> Practica:
    practica.estado = estado.upper()
    db.commit()
    db.refresh(practica)
    return practica


def asignar_docente(db: Session, practica: Practica, docente_id: uuid.UUID) -> Practica:
    practica.docente_id = docente_id
    db.commit()
    db.refresh(practica)
    return practica


def update_acta1_alumno(db: Session, acta1: Acta1, data: Acta1Update) -> Acta1:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(acta1, field, value)
    db.commit()
    db.refresh(acta1)
    return acta1


def accept_acta1_docente(db: Session, acta1: Acta1) -> Acta1:
    acta1.aceptada_docente = True
    db.commit()
    db.refresh(acta1)
    return acta1
