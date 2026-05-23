import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DocumentoCreate(BaseModel):
    practica_id: Optional[uuid.UUID] = None
    carrera_id: Optional[uuid.UUID] = None
    nombre: str
    tipo: str
    filename: str
    tamanio_kb: Optional[int] = None
    mimetype: Optional[str] = None
    subido_por: uuid.UUID


class DocumentoResponse(BaseModel):
    id: uuid.UUID
    practica_id: Optional[uuid.UUID] = None
    carrera_id: Optional[uuid.UUID] = None
    nombre: str
    tipo: str
    filename: str
    tamanio_kb: Optional[int] = None
    mimetype: Optional[str] = None
    subido_por: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
