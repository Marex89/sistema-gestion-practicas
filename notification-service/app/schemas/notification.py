import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Notificacion
# ---------------------------------------------------------------------------


class NotificacionCreate(BaseModel):
    user_id: uuid.UUID
    tipo: str
    mensaje: str


class NotificacionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    tipo: str
    mensaje: str
    canal: str
    enviada: bool
    error_msg: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# AlertaManual
# ---------------------------------------------------------------------------


class AlertaManualCreate(BaseModel):
    alumno_id: uuid.UUID
    asunto: str
    mensaje: str


class AlertaManualResponse(BaseModel):
    id: uuid.UUID
    coordinador_id: uuid.UUID
    alumno_id: uuid.UUID
    asunto: str
    mensaje: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Request body para el endpoint /send (usado por otros servicios internamente)
# ---------------------------------------------------------------------------


class SendNotificationRequest(BaseModel):
    user_id: uuid.UUID
    tipo: str
    context: dict[str, Any] = {}
