import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

# ---------------------------------------------------------------------------
# Practica
# ---------------------------------------------------------------------------


class PracticaCreate(BaseModel):
    alumno_id: uuid.UUID
    carrera_id: uuid.UUID
    tipo: str  # "LABORAL" | "PROFESIONAL"
    fecha_inicio: date
    centro_practica_id: uuid.UUID | None = None


class PracticaUpdate(BaseModel):
    estado: str | None = None
    docente_id: uuid.UUID | None = None
    fecha_termino_confirmada: date | None = None


class PracticaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    alumno_id: uuid.UUID
    coordinador_id: uuid.UUID
    docente_id: uuid.UUID | None
    carrera_id: uuid.UUID
    centro_practica_id: uuid.UUID | None
    tipo: str
    estado: str
    fecha_inicio: date
    fecha_termino_calculada: date | None
    fecha_termino_confirmada: date | None
    created_at: datetime


# ---------------------------------------------------------------------------
# Acta1
# ---------------------------------------------------------------------------


class Acta1Update(BaseModel):
    """Campos que puede completar el alumno (todos opcionales)."""

    direccion_centro: str | None = None
    departamento: str | None = None
    nombre_jefe_directo: str | None = None
    cargo_jefe_directo: str | None = None
    contacto_correo: str | None = None
    contacto_telefono: str | None = None
    practica_a_distancia: bool | None = None
    tareas_principales: str | None = None
    foto_url: str | None = None
    fecha_limite_alumno: date | None = None
    completada_alumno: bool | None = None


class Acta1Response(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    practica_id: uuid.UUID
    direccion_centro: str | None
    departamento: str | None
    nombre_jefe_directo: str | None
    cargo_jefe_directo: str | None
    contacto_correo: str | None
    contacto_telefono: str | None
    practica_a_distancia: bool
    tareas_principales: str | None
    foto_url: str | None
    completada_alumno: bool
    aceptada_docente: bool
    fecha_limite_alumno: date | None
