import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Practica(Base):
    __tablename__ = "practicas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Referencias externas (auth-service y academic-service)
    alumno_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    coordinador_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False
    )
    docente_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    carrera_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    centro_practica_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    tipo: Mapped[str] = mapped_column(
        String, nullable=False
    )  # "LABORAL" | "PROFESIONAL"
    estado: Mapped[str] = mapped_column(String, default="PENDIENTE", nullable=False)

    fecha_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_termino_calculada: Mapped[date | None] = mapped_column(Date, nullable=True)
    fecha_termino_confirmada: Mapped[date | None] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    acta1: Mapped["Acta1 | None"] = relationship(
        "Acta1", back_populates="practica", uselist=False
    )


class Acta1(Base):
    __tablename__ = "actas1"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    practica_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("practicas.id"), unique=True, nullable=False
    )

    direccion_centro: Mapped[str | None] = mapped_column(String, nullable=True)
    departamento: Mapped[str | None] = mapped_column(String, nullable=True)
    nombre_jefe_directo: Mapped[str | None] = mapped_column(String, nullable=True)
    cargo_jefe_directo: Mapped[str | None] = mapped_column(String, nullable=True)
    contacto_correo: Mapped[str | None] = mapped_column(String, nullable=True)
    contacto_telefono: Mapped[str | None] = mapped_column(String, nullable=True)
    practica_a_distancia: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    tareas_principales: Mapped[str | None] = mapped_column(String, nullable=True)
    foto_url: Mapped[str | None] = mapped_column(String, nullable=True)
    completada_alumno: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    aceptada_docente: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    fecha_limite_alumno: Mapped[date | None] = mapped_column(Date, nullable=True)

    practica: Mapped["Practica"] = relationship("Practica", back_populates="acta1")
