import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Documento(Base):
    __tablename__ = "documentos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    # Nullable: el material de apoyo general no tiene practica_id
    practica_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    # Nullable: los documentos de práctica no tienen carrera_id
    carrera_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    nombre: Mapped[str] = mapped_column(String, nullable=False)
    # "INFORME_PRACTICA" | "MATERIAL_APOYO" | "ACTA_EVALUACION" | "FOTO_ALUMNO"
    tipo: Mapped[str] = mapped_column(String, nullable=False)
    # Nombre generado en disco (uuid + extensión original)
    filename: Mapped[str] = mapped_column(String, nullable=False)
    tamanio_kb: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mimetype: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    subido_por: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
