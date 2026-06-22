from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.models.waste_record import WasteRecord
from app.schemas.waste_record import WasteRecordCreate, WasteRecordOut
from app.services import certification_service

router = APIRouter()


@router.post("/", response_model=WasteRecordOut, status_code=status.HTTP_201_CREATED)
def create_waste_record(
    record_in: WasteRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cria um novo registro de resíduo para o usuário autenticado."""
    record = WasteRecord(
        user_id=current_user.id,
        waste_type=record_in.waste_type,
        weight_kg=record_in.weight_kg,
        volume_liters=record_in.volume_liters,
        collection_frequency=record_in.collection_frequency,
        collection_date=record_in.collection_date,
        notes=record_in.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    certification_service.recalculate(db, current_user.id)

    return record


@router.get("/", response_model=List[WasteRecordOut])
def list_waste_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lista todos os registros de resíduos do usuário autenticado, ordenados por data de coleta."""
    records = (
        db.query(WasteRecord)
        .filter(WasteRecord.user_id == current_user.id)
        .order_by(WasteRecord.collection_date.desc())
        .all()
    )
    return records


@router.get("/{record_id}", response_model=WasteRecordOut)
def get_waste_record(
    record_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retorna um registro de resíduo específico do usuário autenticado."""
    record = (
        db.query(WasteRecord)
        .filter(WasteRecord.id == record_id, WasteRecord.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro não encontrado",
        )
    return record
