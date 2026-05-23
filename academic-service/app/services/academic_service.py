"""
Capa de servicio para academic-service.
Expone funciones de validación y consulta que otros servicios pueden usar
vía llamadas HTTP (e.g., internship-service consultando las horas de práctica).
"""

import uuid

from sqlalchemy.orm import Session

from app.crud.academic import (
    get_carrera_by_id,
    get_sede_by_id,
)


def validate_sede_activa(db: Session, sede_id: uuid.UUID) -> bool:
    """Verifica que una sede exista y esté activa."""
    sede = get_sede_by_id(db, sede_id)
    return sede is not None and sede.is_active


def validate_carrera_activa(db: Session, carrera_id: uuid.UUID) -> bool:
    """Verifica que una carrera exista y esté activa."""
    carrera = get_carrera_by_id(db, carrera_id)
    return carrera is not None and carrera.is_active


def get_horas_practica(db: Session, carrera_id: uuid.UUID, tipo: str) -> int | None:
    """
    Devuelve las horas requeridas según tipo de práctica para una carrera.
    tipo: 'LABORAL' | 'PROFESIONAL'
    Retorna None si la carrera no existe o el tipo es inválido.
    """
    carrera = get_carrera_by_id(db, carrera_id)
    if carrera is None:
        return None
    if tipo == "LABORAL":
        return carrera.horas_laboral
    if tipo == "PROFESIONAL":
        return carrera.horas_profesional
    return None
