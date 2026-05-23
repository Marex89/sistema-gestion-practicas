import asyncio
import logging
import smtplib
from concurrent.futures import ThreadPoolExecutor
from email.mime.text import MIMEText

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.notification import Notificacion
from app.schemas.notification import NotificacionCreate

logger = logging.getLogger(__name__)

_executor = ThreadPoolExecutor(max_workers=4)

MENSAJES: dict[str, str] = {
    "ACTA1_DISPONIBLE": "Tu Acta 1 de práctica está disponible para completar. Tienes 5 días.",
    "ACTA1_VENCE_MANANA": "Mañana vence el plazo para completar tu Acta 1.",
    "DOCENTE_ASIGNADO": "Se te ha asignado como profesor guía de una práctica.",
    "INFORME_CARGADO": "Un alumno ha cargado su informe de práctica.",
    "PRACTICA_PROXIMA_VENCER": "Una práctica está próxima a su fecha de término.",
    "EVALUACION_CERRADA": "Se ha cerrado un acta de evaluación.",
    "PRACTICAS_SIN_CERRAR": "Existen prácticas sin cerrar próximas a vencer.",
}


def send_email_sync(to: str, subject: str, body: str) -> bool:
    """
    Envía email con smtplib. Retorna True si éxito, False si falla.
    Si smtp_user está vacío (modo dev), solo imprime en consola.
    """
    if not settings.smtp_user:
        print(f"[DEV EMAIL] To: {to}, Subject: {subject}")
        return True

    try:
        msg = MIMEText(body, "plain", "utf-8")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_from
        msg["To"] = to

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, [to], msg.as_string())

        return True
    except Exception as exc:
        logger.error("Error enviando email a %s: %s", to, exc)
        return False


async def _get_user_email(user_id: str) -> str | None:
    """Obtiene el email del usuario consultando el auth-service."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.auth_service_url}/api/v1/users/{user_id}/email"
            )
            if resp.status_code == 200:
                return resp.json().get("email")
    except Exception as exc:
        logger.error("Error obteniendo email para user_id=%s: %s", user_id, exc)
    return None


async def send_notification(
    db: Session,
    user_id: str,
    tipo: str,
    mensaje: str,
) -> Notificacion:
    """
    Crea el registro en BD y envía el email al destinatario.
    El email del usuario se obtiene consultando el auth-service.
    """
    from app.crud.notification import create_notificacion  # local import evita ciclos

    notif = create_notificacion(
        db,
        NotificacionCreate(user_id=user_id, tipo=tipo, mensaje=mensaje),  # type: ignore[arg-type]
    )

    email = await _get_user_email(user_id)
    if email:
        loop = asyncio.get_running_loop()
        success = await loop.run_in_executor(
            _executor,
            send_email_sync,
            email,
            f"Notificación: {tipo}",
            mensaje,
        )
        if success:
            notif.enviada = True
        else:
            notif.error_msg = "Fallo al enviar email"
    else:
        notif.error_msg = "No se pudo obtener el email del usuario"

    db.commit()
    db.refresh(notif)
    return notif
