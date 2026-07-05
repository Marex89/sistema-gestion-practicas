import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.crud import notification as crud
from app.db.session import get_db
from app.schemas.notification import (
    AlertaManualCreate,
    AlertaManualResponse,
    NotificacionResponse,
    SendNotificationRequest,
)
from app.services.notification_service import MENSAJES, send_notification

router = APIRouter()


@router.post(
    "/send",
    response_model=NotificacionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enviar notificación (uso interno entre servicios)",
)
async def enviar_notificacion(
    data: SendNotificationRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """
    Genera el mensaje a partir del tipo (usando MENSAJES predefinidos) y lo envía
    al usuario indicado. El campo `context` está reservado para futuras
    interpolaciones de variables en los mensajes.
    """
    mensaje = MENSAJES.get(data.tipo, f"Notificación: {data.tipo}")
    notif = await send_notification(db, str(data.user_id), data.tipo, mensaje)
    return notif


@router.post(
    "/manual-alert",
    response_model=AlertaManualResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enviar alerta manual a un alumno (coordinador)",
)
async def enviar_alerta_manual(
    data: AlertaManualCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("COORDINADOR", "SUPER_ADMIN")),
):
    """El coordinador_id se extrae del header X-User-Id inyectado por el gateway."""
    alerta = crud.create_alerta_manual(db, data, coordinador_id=user["user_id"])
    # Envía notificación por email al alumno con el mensaje personalizado
    await send_notification(db, str(data.alumno_id), "MANUAL_ALERT", data.mensaje)
    return alerta


@router.get(
    "/history/{alumno_id}",
    response_model=list[NotificacionResponse],
    summary="Historial de notificaciones de un alumno (coordinador)",
)
def historial_notificaciones(
    alumno_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("COORDINADOR", "SUPER_ADMIN")),
):
    return crud.list_notificaciones_by_user(db, alumno_id)
