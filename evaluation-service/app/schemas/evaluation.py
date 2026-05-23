import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel

# ---------------------------------------------------------------------------
# ParametroEvaluacion
# ---------------------------------------------------------------------------


class ParametroEvaluacionUpdate(BaseModel):
    pct_informe: Optional[float] = None
    pct_empleador: Optional[float] = None


class ParametroEvaluacionResponse(BaseModel):
    id: uuid.UUID
    carrera_id: uuid.UUID
    pct_informe: float
    pct_empleador: float

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# EvaluacionDesempeno
# ---------------------------------------------------------------------------


class EvaluacionDesempenoCreate(BaseModel):
    practica_id: uuid.UUID
    evaluador_id: uuid.UUID
    tipo_evaluador: str = "EMPLEADOR"
    items: Optional[list[dict[str, Any]]] = None


class EvaluacionDesempenoUpdate(BaseModel):
    items: Optional[list[dict[str, Any]]] = None


class EvaluacionDesempenoResponse(BaseModel):
    id: uuid.UUID
    practica_id: uuid.UUID
    evaluador_id: uuid.UUID
    tipo_evaluador: str
    items: Optional[list[Any]] = None
    nota: Optional[float] = None
    estado: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# EvaluacionInforme
# ---------------------------------------------------------------------------


class EvaluacionInformeCreate(BaseModel):
    practica_id: uuid.UUID
    docente_id: uuid.UUID
    items: Optional[list[dict[str, Any]]] = None


class EvaluacionInformeUpdate(BaseModel):
    items: Optional[list[dict[str, Any]]] = None


class EvaluacionInformeResponse(BaseModel):
    id: uuid.UUID
    practica_id: uuid.UUID
    docente_id: uuid.UUID
    items: Optional[list[Any]] = None
    nota: Optional[float] = None
    estado: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# ActaFinal
# ---------------------------------------------------------------------------


class ActaFinalResponse(BaseModel):
    id: uuid.UUID
    practica_id: uuid.UUID
    nota_informe: Optional[float] = None
    nota_empleador: Optional[float] = None
    nota_final: Optional[float] = None
    validada_por: Optional[uuid.UUID] = None
    validada_en: Optional[datetime] = None

    model_config = {"from_attributes": True}
