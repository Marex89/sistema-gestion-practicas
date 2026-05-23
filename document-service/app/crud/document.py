import uuid

from sqlalchemy.orm import Session

from app.models.document import Documento
from app.schemas.document import DocumentoCreate


def create_documento(db: Session, data: DocumentoCreate) -> Documento:
    obj = Documento(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_by_id(db: Session, doc_id: uuid.UUID) -> Documento | None:
    return db.query(Documento).filter(Documento.id == doc_id).first()


def list_by_practica(db: Session, practica_id: uuid.UUID) -> list[Documento]:
    return (
        db.query(Documento)
        .filter(Documento.practica_id == practica_id)
        .order_by(Documento.created_at.desc())
        .all()
    )


def list_material_apoyo(db: Session, carrera_id: uuid.UUID) -> list[Documento]:
    return (
        db.query(Documento)
        .filter(
            Documento.tipo == "MATERIAL_APOYO",
            Documento.carrera_id == carrera_id,
        )
        .order_by(Documento.created_at.desc())
        .all()
    )
