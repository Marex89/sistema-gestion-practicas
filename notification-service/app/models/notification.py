import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Notificacion(Base):
    __tablename__ = "notificaciones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    # "ACTA1_DISPONIBLE" | "ACTA1_VENCE_MANANA" | "DOCENTE_ASIGNADO" |
    # "INFORME_CARGADO" | "PRACTICA_PROXIMA_VENCER" | "EVALUACION_CERRADA" |
    # "PRACTICAS_SIN_CERRAR"
    tipo: Mapped[str] = mapped_column(String, nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    canal: Mapped[str] = mapped_column(String, default="EMAIL")
    enviada: Mapped[bool] = mapped_column(Boolean, default=False)
    error_msg: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class AlertaManual(Base):
    """Alerta enviada directamente por un coordinador a un alumno."""

    __tablename__ = "alertas_manuales"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    coordinador_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False
    )
    alumno_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    asunto: Mapped[str] = mapped_column(String, nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
