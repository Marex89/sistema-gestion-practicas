import uuid

from pydantic import BaseModel, ConfigDict

# ---------------------------------------------------------------------------
# Sede
# ---------------------------------------------------------------------------


class SedeCreate(BaseModel):
    nombre: str
    is_active: bool = True


class SedeUpdate(BaseModel):
    nombre: str | None = None
    is_active: bool | None = None


class SedeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nombre: str
    is_active: bool


# ---------------------------------------------------------------------------
# Carrera
# ---------------------------------------------------------------------------


class CarreraCreate(BaseModel):
    nombre: str
    sede_id: uuid.UUID
    horas_laboral: int = 240
    horas_profesional: int = 360
    is_active: bool = True


class CarreraUpdate(BaseModel):
    nombre: str | None = None
    sede_id: uuid.UUID | None = None
    horas_laboral: int | None = None
    horas_profesional: int | None = None
    is_active: bool | None = None


class CarreraResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nombre: str
    sede_id: uuid.UUID
    horas_laboral: int
    horas_profesional: int
    is_active: bool


# ---------------------------------------------------------------------------
# CentroPractica
# ---------------------------------------------------------------------------


class CentroPracticaCreate(BaseModel):
    nombre: str
    giro: str | None = None
    nombre_gerente: str | None = None
    telefono: str | None = None
    correo: str | None = None
    nombre_contacto: str | None = None
    correo_contacto: str | None = None
    direccion: str | None = None
    is_active: bool = True


class CentroPracticaUpdate(BaseModel):
    nombre: str | None = None
    giro: str | None = None
    nombre_gerente: str | None = None
    telefono: str | None = None
    correo: str | None = None
    nombre_contacto: str | None = None
    correo_contacto: str | None = None
    direccion: str | None = None
    is_active: bool | None = None


class CentroPracticaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    nombre: str
    giro: str | None
    nombre_gerente: str | None
    telefono: str | None
    correo: str | None
    nombre_contacto: str | None
    correo_contacto: str | None
    direccion: str | None
    is_active: bool
