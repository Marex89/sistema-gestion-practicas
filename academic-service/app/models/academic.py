import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Sede(Base):
    __tablename__ = "sedes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    carreras: Mapped[list["Carrera"]] = relationship("Carrera", back_populates="sede")


class Carrera(Base):
    __tablename__ = "carreras"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    sede_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sedes.id"), nullable=False
    )
    horas_laboral: Mapped[int] = mapped_column(Integer, default=240, nullable=False)
    horas_profesional: Mapped[int] = mapped_column(Integer, default=360, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    sede: Mapped["Sede"] = relationship("Sede", back_populates="carreras")


class CentroPractica(Base):
    __tablename__ = "centros_practica"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    giro: Mapped[str | None] = mapped_column(String, nullable=True)
    nombre_gerente: Mapped[str | None] = mapped_column(String, nullable=True)
    telefono: Mapped[str | None] = mapped_column(String, nullable=True)
    correo: Mapped[str | None] = mapped_column(String, nullable=True)
    nombre_contacto: Mapped[str | None] = mapped_column(String, nullable=True)
    correo_contacto: Mapped[str | None] = mapped_column(String, nullable=True)
    direccion: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
