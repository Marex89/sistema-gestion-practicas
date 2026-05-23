import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

# Roles válidos del sistema
ROLES = {"SUPER_ADMIN", "JEFE_CARRERA", "COORDINADOR", "DOCENTE", "ALUMNO", "EMPLEADOR"}


class UserCreate(BaseModel):
    rut: str
    nombre: str
    apellido: str
    email: str
    password: str
    rol: str
    carrera_id: uuid.UUID | None = None


class UserUpdate(BaseModel):
    rut: str | None = None
    nombre: str | None = None
    apellido: str | None = None
    email: str | None = None
    password: str | None = None
    rol: str | None = None
    carrera_id: uuid.UUID | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    rut: str
    nombre: str
    apellido: str
    email: str
    rol: str
    carrera_id: uuid.UUID | None
    is_active: bool
    created_at: datetime


class UserList(BaseModel):
    total: int
    skip: int
    limit: int
    items: list[UserResponse]
