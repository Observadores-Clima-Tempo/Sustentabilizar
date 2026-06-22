import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from PIL import Image

from app.core.config import settings

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}
MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def save_evidence_file(file: UploadFile, user_id: str) -> dict:
    """
    Valida e persiste um arquivo de imagem em disco.

    Retorna um dicionário com os metadados do arquivo salvo:
    file_path, file_url, file_name, file_size_bytes, mime_type, captured_at.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Apenas imagens JPEG e PNG são aceitas",
        )

    contents = file.file.read()
    file_size = len(contents)

    if file_size > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Arquivo excede o tamanho máximo de {settings.MAX_UPLOAD_SIZE_MB} MB",
        )

    # Valida que é uma imagem real com Pillow
    try:
        from io import BytesIO
        img = Image.open(BytesIO(contents))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Arquivo de imagem inválido ou corrompido",
        )

    # Gera nome único para o arquivo
    ext = "jpg" if file.content_type == "image/jpeg" else "png"
    unique_name = f"{uuid.uuid4()}.{ext}"

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / unique_name
    file_path.write_bytes(contents)

    return {
        "file_path": str(file_path),
        "file_url": f"/uploads/{unique_name}",
        "file_name": file.filename or unique_name,
        "file_size_bytes": file_size,
        "mime_type": file.content_type,
        "captured_at": datetime.now(timezone.utc),
    }
