import logging
from datetime import date, timedelta
from math import ceil

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def calcular_fecha_termino(fecha_inicio: date, tipo: str, horas: int) -> date:
    """
    Calcula la fecha de término sumando días hábiles equivalentes.

    horas_por_dia=8, días_semana=5 (lun-vie).
    dias_habiles = ceil(horas / 8)
    Suma esos días hábiles desde fecha_inicio (sin contar el propio día de inicio).
    """
    horas_por_dia = 8
    dias_habiles_necesarios = ceil(horas / horas_por_dia)

    fecha_actual = fecha_inicio
    dias_contados = 0

    while dias_contados < dias_habiles_necesarios:
        fecha_actual += timedelta(days=1)
        # weekday(): 0=lunes … 4=viernes, 5=sábado, 6=domingo
        if fecha_actual.weekday() < 5:
            dias_contados += 1

    return fecha_actual


def notify_event(event_type: str, context: dict) -> None:
    """
    Envía una notificación al notification-service mediante HTTP POST.
    Los errores se registran pero no se propagan para no bloquear el flujo principal.
    """
    url = f"{settings.notification_service_url}/api/v1/notifications"
    payload = {"event_type": event_type, "context": context}
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        logger.warning(
            "notify_event: fallo al notificar evento '%s': %s", event_type, exc
        )
