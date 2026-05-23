import uuid
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.evaluation import (
    ActaFinal,
    EvaluacionDesempeno,
    EvaluacionInforme,
    ParametroEvaluacion,
)
from app.schemas.evaluation import (
    EvaluacionDesempenoCreate,
    EvaluacionDesempenoUpdate,
    EvaluacionInformeCreate,
    EvaluacionInformeUpdate,
    ParametroEvaluacionUpdate,
)
from app.services.evaluation_service import calcular_nota, calcular_nota_final

# ---------------------------------------------------------------------------
# ParametroEvaluacion
# ---------------------------------------------------------------------------


def get_parametros_by_carrera(
    db: Session, carrera_id: uuid.UUID
) -> ParametroEvaluacion | None:
    return (
        db.query(ParametroEvaluacion)
        .filter(ParametroEvaluacion.carrera_id == carrera_id)
        .first()
    )


def create_or_update_parametros(
    db: Session, carrera_id: uuid.UUID, data: ParametroEvaluacionUpdate
) -> ParametroEvaluacion:
    obj = get_parametros_by_carrera(db, carrera_id)
    if obj is None:
        obj = ParametroEvaluacion(carrera_id=carrera_id)
        db.add(obj)
    if data.pct_informe is not None:
        obj.pct_informe = data.pct_informe
    if data.pct_empleador is not None:
        obj.pct_empleador = data.pct_empleador
    db.commit()
    db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# EvaluacionDesempeno
# ---------------------------------------------------------------------------


def create_evaluacion_desempeno(
    db: Session, data: EvaluacionDesempenoCreate
) -> EvaluacionDesempeno:
    obj = EvaluacionDesempeno(**data.model_dump())
    if obj.items:
        obj.nota = calcular_nota(obj.items)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_evaluacion_desempeno(
    db: Session, eval_id: uuid.UUID
) -> EvaluacionDesempeno | None:
    return (
        db.query(EvaluacionDesempeno).filter(EvaluacionDesempeno.id == eval_id).first()
    )


def update_evaluacion_desempeno(
    db: Session, obj: EvaluacionDesempeno, data: EvaluacionDesempenoUpdate
) -> EvaluacionDesempeno:
    if data.items is not None:
        obj.items = data.items
        obj.nota = calcular_nota(data.items)
    db.commit()
    db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# EvaluacionInforme
# ---------------------------------------------------------------------------


def create_evaluacion_informe(
    db: Session, data: EvaluacionInformeCreate
) -> EvaluacionInforme:
    obj = EvaluacionInforme(**data.model_dump())
    if obj.items:
        obj.nota = calcular_nota(obj.items)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_evaluacion_informe(db: Session, eval_id: uuid.UUID) -> EvaluacionInforme | None:
    return db.query(EvaluacionInforme).filter(EvaluacionInforme.id == eval_id).first()


def update_evaluacion_informe(
    db: Session, obj: EvaluacionInforme, data: EvaluacionInformeUpdate
) -> EvaluacionInforme:
    if data.items is not None:
        obj.items = data.items
        obj.nota = calcular_nota(data.items)
    db.commit()
    db.refresh(obj)
    return obj


# ---------------------------------------------------------------------------
# Cierre genérico (aplica a ambos tipos de evaluación)
# ---------------------------------------------------------------------------


def cerrar_evaluacion(db: Session, eval_obj: EvaluacionDesempeno | EvaluacionInforme):
    """
    Valida que la evaluación esté completa (items not null, nota calculada)
    y cambia el estado a "CERRADA".
    """
    if eval_obj.items is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La evaluación no tiene items registrados. No se puede cerrar.",
        )
    if eval_obj.nota is None:
        eval_obj.nota = calcular_nota(eval_obj.items)
    eval_obj.estado = "CERRADA"
    db.commit()
    db.refresh(eval_obj)
    return eval_obj


# ---------------------------------------------------------------------------
# ActaFinal
# ---------------------------------------------------------------------------


def get_acta_final(db: Session, practica_id: uuid.UUID) -> ActaFinal | None:
    return db.query(ActaFinal).filter(ActaFinal.practica_id == practica_id).first()


def get_or_create_acta_final(db: Session, practica_id: uuid.UUID) -> ActaFinal:
    """
    Recupera (o crea) el acta final de una práctica y sincroniza las notas
    desde las evaluaciones cerradas más recientes.
    """
    acta = get_acta_final(db, practica_id)
    if acta is None:
        acta = ActaFinal(practica_id=practica_id)
        db.add(acta)

    # Toma la evaluación de desempeño cerrada más reciente
    desempeno = (
        db.query(EvaluacionDesempeno)
        .filter(
            EvaluacionDesempeno.practica_id == practica_id,
            EvaluacionDesempeno.estado == "CERRADA",
        )
        .order_by(EvaluacionDesempeno.created_at.desc())
        .first()
    )
    # Toma la evaluación de informe cerrada más reciente
    informe = (
        db.query(EvaluacionInforme)
        .filter(
            EvaluacionInforme.practica_id == practica_id,
            EvaluacionInforme.estado == "CERRADA",
        )
        .order_by(EvaluacionInforme.created_at.desc())
        .first()
    )

    if desempeno:
        acta.nota_empleador = desempeno.nota
    if informe:
        acta.nota_informe = informe.nota

    # Calcula nota final cuando ambas notas están disponibles
    if acta.nota_informe is not None and acta.nota_empleador is not None:
        # Intenta obtener parámetros; usa defaults si no existen
        parametros = ParametroEvaluacion()
        # Asegurar valores numéricos por defecto si los atributos son None
        pct_informe = getattr(parametros, "pct_informe", None)
        pct_empleador = getattr(parametros, "pct_empleador", None)
        if pct_informe is None:
            pct_informe = 0.6
        if pct_empleador is None:
            pct_empleador = 0.4
        class _P:
            pass
        _p = _P()
        _p.pct_informe = pct_informe
        _p.pct_empleador = pct_empleador
        acta.nota_final = calcular_nota_final(
            acta.nota_informe, acta.nota_empleador, _p
        )

    db.commit()
    db.refresh(acta)
    return acta
