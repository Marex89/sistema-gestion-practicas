import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_roles
from app.crud import evaluation as crud
from app.db.session import get_db
from app.schemas.evaluation import (
    ActaFinalResponse,
    EvaluacionDesempenoCreate,
    EvaluacionDesempenoResponse,
    EvaluacionDesempenoUpdate,
    EvaluacionInformeCreate,
    EvaluacionInformeResponse,
    EvaluacionInformeUpdate,
    ParametroEvaluacionResponse,
    ParametroEvaluacionUpdate,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Evaluación de Desempeño (empleador)
# ---------------------------------------------------------------------------


@router.post(
    "/desempeno",
    response_model=EvaluacionDesempenoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear evaluación de desempeño",
)
def crear_evaluacion_desempeno(
    data: EvaluacionDesempenoCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("EMPLEADOR", "COORDINADOR", "ADMIN")),
):
    return crud.create_evaluacion_desempeno(db, data)


@router.get(
    "/desempeno/{eval_id}",
    response_model=EvaluacionDesempenoResponse,
    summary="Obtener evaluación de desempeño",
)
def obtener_evaluacion_desempeno(
    eval_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = crud.get_evaluacion_desempeno(db, eval_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evaluación no encontrada"
        )
    return obj


@router.patch(
    "/desempeno/{eval_id}",
    response_model=EvaluacionDesempenoResponse,
    summary="Actualizar items de evaluación de desempeño",
)
def actualizar_evaluacion_desempeno(
    eval_id: uuid.UUID,
    data: EvaluacionDesempenoUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = crud.get_evaluacion_desempeno(db, eval_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evaluación no encontrada"
        )
    if obj.estado == "CERRADA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede modificar una evaluación cerrada.",
        )
    return crud.update_evaluacion_desempeno(db, obj, data)


@router.post(
    "/desempeno/{eval_id}/cerrar",
    response_model=EvaluacionDesempenoResponse,
    summary="Cerrar evaluación de desempeño",
)
def cerrar_evaluacion_desempeno(
    eval_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = crud.get_evaluacion_desempeno(db, eval_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evaluación no encontrada"
        )
    if obj.estado == "CERRADA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La evaluación ya está cerrada.",
        )
    return crud.cerrar_evaluacion(db, obj)


# ---------------------------------------------------------------------------
# Evaluación de Informe (docente)
# ---------------------------------------------------------------------------


@router.post(
    "/informe",
    response_model=EvaluacionInformeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear evaluación de informe",
)
def crear_evaluacion_informe(
    data: EvaluacionInformeCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("DOCENTE", "COORDINADOR", "ADMIN")),
):
    return crud.create_evaluacion_informe(db, data)


@router.get(
    "/informe/{eval_id}",
    response_model=EvaluacionInformeResponse,
    summary="Obtener evaluación de informe",
)
def obtener_evaluacion_informe(
    eval_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = crud.get_evaluacion_informe(db, eval_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evaluación no encontrada"
        )
    return obj


@router.patch(
    "/informe/{eval_id}",
    response_model=EvaluacionInformeResponse,
    summary="Actualizar items de evaluación de informe",
)
def actualizar_evaluacion_informe(
    eval_id: uuid.UUID,
    data: EvaluacionInformeUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = crud.get_evaluacion_informe(db, eval_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evaluación no encontrada"
        )
    if obj.estado == "CERRADA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede modificar una evaluación cerrada.",
        )
    return crud.update_evaluacion_informe(db, obj, data)


@router.post(
    "/informe/{eval_id}/cerrar",
    response_model=EvaluacionInformeResponse,
    summary="Cerrar evaluación de informe",
)
def cerrar_evaluacion_informe(
    eval_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = crud.get_evaluacion_informe(db, eval_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evaluación no encontrada"
        )
    if obj.estado == "CERRADA":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La evaluación ya está cerrada.",
        )
    return crud.cerrar_evaluacion(db, obj)


# ---------------------------------------------------------------------------
# Acta Final
# ---------------------------------------------------------------------------


@router.get(
    "/acta-final/{practica_id}",
    response_model=ActaFinalResponse,
    summary="Obtener acta final de una práctica",
)
def obtener_acta_final(
    practica_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return crud.get_or_create_acta_final(db, practica_id)


@router.post(
    "/acta-final/{practica_id}/validar",
    response_model=ActaFinalResponse,
    summary="Validar acta final (coordinador)",
)
def validar_acta_final(
    practica_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("COORDINADOR", "ADMIN")),
):
    acta = crud.get_or_create_acta_final(db, practica_id)
    if acta.nota_final is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El acta no tiene nota final calculada. Asegúrese de cerrar ambas evaluaciones primero.",
        )
    acta.validada_por = uuid.UUID(user["user_id"])
    acta.validada_en = datetime.utcnow()
    db.commit()
    db.refresh(acta)
    return acta


# ---------------------------------------------------------------------------
# Parámetros de evaluación por carrera
# ---------------------------------------------------------------------------


@router.get(
    "/parametros/{carrera_id}",
    response_model=ParametroEvaluacionResponse,
    summary="Obtener parámetros de evaluación de una carrera",
)
def obtener_parametros(
    carrera_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    from app.models.evaluation import ParametroEvaluacion

    obj = crud.get_parametros_by_carrera(db, carrera_id)
    if not obj:
        # Devuelve los valores por defecto sin persistir
        obj = ParametroEvaluacion(id=uuid.uuid4(), carrera_id=carrera_id)
    return obj


@router.put(
    "/parametros/{carrera_id}",
    response_model=ParametroEvaluacionResponse,
    summary="Actualizar parámetros de evaluación (coordinador)",
)
def actualizar_parametros(
    carrera_id: uuid.UUID,
    data: ParametroEvaluacionUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("COORDINADOR", "ADMIN")),
):
    return crud.create_or_update_parametros(db, carrera_id, data)
