from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.evidence import Evidence
from app.models.user import User
from app.models.waste_record import WasteRecord
from app.schemas.waste_record import EvidenceOut
from app.services.storage_service import save_evidence_file
from app.services import certification_service

router = APIRouter()


@router.post("/upload", response_model=EvidenceOut, status_code=status.HTTP_201_CREATED)
def upload_evidence(
    record_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Faz upload de uma imagem como evidência de um registro de resíduo.
    Valida formato (jpeg/png) e tamanho (máx. 10 MB).
    """
    # Verifica que o registro pertence ao usuário
    record = (
        db.query(WasteRecord)
        .filter(
            WasteRecord.id == record_id,
            WasteRecord.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro não encontrado",
        )

    file_meta = save_evidence_file(file, str(current_user.id))

    evidence = Evidence(
        waste_record_id=record_id,
        user_id=current_user.id,
        **file_meta,
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    certification_service.recalculate(db, current_user.id)

    return evidence
