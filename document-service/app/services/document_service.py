import os
import uuid

import aiofiles
from fastapi import HTTPException, UploadFile, status

ALLOWED_DOCUMENT_FORMATS: list[str] = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
ALLOWED_PHOTO_FORMATS: list[str] = [
    "image/jpeg",
    "image/png",
]


def validate_format(content_type: str, allowed: list[str]) -> bool:
    return content_type in allowed


async def save_file(
    file: UploadFile,
    storage_path: str,
    max_size_kb: int,
) -> tuple[str, int, str]:
    """
    Valida tamaño y guarda el archivo en disco.

    Retorna (filename_guardado, tamanio_kb, mimetype).
    El filename_guardado tiene la forma: str(uuid4()) + extensión_original.
    """
    content = await file.read()

    # Calcular tamaño; round up a 1 KB mínimo para archivos muy pequeños
    size_kb = max(1, len(content) // 1024)
    if size_kb > max_size_kb:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"El archivo supera el tamaño máximo permitido de {max_size_kb} KB.",
        )

    original_name = file.filename or "file"
    _, ext = os.path.splitext(original_name)
    new_filename = str(uuid.uuid4()) + ext

    os.makedirs(storage_path, exist_ok=True)
    file_path = os.path.join(storage_path, new_filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    return new_filename, size_kb, file.content_type or ""
