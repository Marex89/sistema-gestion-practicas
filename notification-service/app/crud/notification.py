import uuid

from sqlalchemy.orm import Session

from app.models.notification import AlertaManual, Notificacion
from app.schemas.notification import AlertaManualCreate, NotificacionCreate


def create_notificacion(db: Session, data: NotificacionCreate) -> Notificacion:
    obj = Notificacion(**data.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_notificacion(db: Session, notif_id: uuid.UUID) -> Notificacion | None:
    return db.query(Notificacion).filter(Notificacion.id == notif_id).first()


def list_notificaciones_by_user(db: Session, user_id: uuid.UUID) -> list[Notificacion]:
    return (
        db.query(Notificacion)
        .filter(Notificacion.user_id == user_id)
        .order_by(Notificacion.created_at.desc())
        .all()
    )


def create_alerta_manual(
    db: Session, data: AlertaManualCreate, coordinador_id: str
) -> AlertaManual:
    obj = AlertaManual(
        coordinador_id=uuid.UUID(coordinador_id),
        alumno_id=data.alumno_id,
        asunto=data.asunto,
        mensaje=data.mensaje,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
