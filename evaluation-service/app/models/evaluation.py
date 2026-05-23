import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import JSON, DateTime, Float, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ParametroEvaluacion(Base):
    __tablename__ = "parametros_evaluacion"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Referencia externa; unique garantiza un registro por carrera
    carrera_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, unique=True
    )
    pct_informe: Mapped[float] = mapped_column(Float, default=0.6)
    pct_empleador: Mapped[float] = mapped_column(Float, default=0.4)


class EvaluacionDesempeno(Base):
    """Completada por el empleador."""

    __tablename__ = "evaluaciones_desempeno"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    practica_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    evaluador_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    tipo_evaluador: Mapped[str] = mapped_column(String, default="EMPLEADOR")
    # Lista de {criterio, puntaje_obtenido, puntaje_max}
    items: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    nota: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    # "BORRADOR" | "CERRADA"
    estado: Mapped[str] = mapped_column(String, default="BORRADOR")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class EvaluacionInforme(Base):
    """Completada por el docente."""

    __tablename__ = "evaluaciones_informe"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    practica_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    docente_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    items: Mapped[Optional[Any]] = mapped_column(JSON, nullable=True)
    nota: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    estado: Mapped[str] = mapped_column(String, default="BORRADOR")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class ActaFinal(Base):
    __tablename__ = "actas_finales"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    practica_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, unique=True
    )
    nota_informe: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nota_empleador: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nota_final: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    validada_por: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    validada_en: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
