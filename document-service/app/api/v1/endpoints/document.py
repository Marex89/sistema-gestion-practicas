import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_current_user, require_roles
from app.crud import document as crud
from app.db.session import get_db
from app.schemas.document import DocumentoCreate, DocumentoResponse
from app.services.document_service import (
    ALLOWED_DOCUMENT_FORMATS,
    ALLOWED_PHOTO_FORMATS,
    save_file,
    validate_format,
)

router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subir documento de práctica",
)
async def upload_documento(
    file: UploadFile = File(...),
    practica_id: Optional[uuid.UUID] = Form(None),
    tipo: str = Form(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    allowed = (
        ALLOWED_PHOTO_FORMATS if tipo == "FOTO_ALUMNO" else ALLOWED_DOCUMENT_FORMATS
    )
    max_kb = (
        settings.max_photo_size_kb
        if tipo == "FOTO_ALUMNO"
        else settings.max_file_size_kb
    )

    if not validate_format(file.content_type or "", allowed):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Formato no permitido: {file.content_type}",
        )

    filename, size_kb, mimetype = await save_file(file, settings.storage_path, max_kb)

    data = DocumentoCreate(
        practica_id=practica_id,
        nombre=file.filename or filename,
        tipo=tipo,
        filename=filename,
        tamanio_kb=size_kb,
        mimetype=mimetype,
        subido_por=uuid.UUID(user["user_id"]),
    )
    return crud.create_documento(db, data)


@router.get(
    "/practica/{practica_id}",
    response_model=list[DocumentoResponse],
    summary="Listar documentos de una práctica",
)
def list_documentos_practica(
    practica_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return crud.list_by_practica(db, practica_id)


@router.post(
    "/material-apoyo",
    response_model=DocumentoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subir material de apoyo (coordinador)",
)
async def upload_material_apoyo(
    file: UploadFile = File(...),
    carrera_id: Optional[uuid.UUID] = Form(None),
    nombre: str = Form(...),
    db: Session = Depends(get_db),
    user: dict = Depends(require_roles("COORDINADOR", "ADMIN")),
):
    if not validate_format(file.content_type or "", ALLOWED_DOCUMENT_FORMATS):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Formato no permitido: {file.content_type}",
        )

    filename, size_kb, mimetype = await save_file(
        file, settings.storage_path, settings.max_file_size_kb
    )

    data = DocumentoCreate(
        carrera_id=carrera_id,
        nombre=nombre,
        tipo="MATERIAL_APOYO",
        filename=filename,
        tamanio_kb=size_kb,
        mimetype=mimetype,
        subido_por=uuid.UUID(user["user_id"]),
    )
    return crud.create_documento(db, data)


@router.get(
    "/material-apoyo/{carrera_id}",
    response_model=list[DocumentoResponse],
    summary="Listar material de apoyo de una carrera",
)
def list_material_apoyo(
    carrera_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return crud.list_material_apoyo(db, carrera_id)


# Ruta genérica al final para evitar conflictos con rutas más específicas
@router.get(
    "/{doc_id}",
    summary="Descargar documento por ID",
)
def download_documento(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    doc = crud.get_by_id(db, doc_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado"
        )

    file_path = os.path.join(settings.storage_path, doc.filename)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Archivo no encontrado en disco",
        )

    return FileResponse(
        path=file_path,
        filename=doc.nombre,
        media_type=doc.mimetype or "application/octet-stream",
    )
