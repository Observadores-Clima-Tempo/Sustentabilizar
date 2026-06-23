"""
Endpoints administrativos — requerem is_admin=True.
Prefix: /api/v1/admin
"""
import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin, get_db
from app.models.admin_config import (
    CertificationThreshold,
    ChecklistItem,
    ScoringConfig,
    WasteTypeScoring,
)
from app.schemas.admin import (
    CertificationThresholdsOut,
    CertificationThresholdsUpdate,
    ChecklistItemCreate,
    ChecklistItemOut,
    ChecklistItemUpdate,
    ScoringConfigOut,
    ScoringConfigUpdate,
    WasteTypeScoringBulkUpdate,
    WasteTypeScoringOut,
)

router = APIRouter()


# ───────────────────────────────────────────
# Checklist
# ───────────────────────────────────────────

@router.get("/checklist", response_model=List[ChecklistItemOut])
def list_checklist_items(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Lista todas as perguntas do checklist (inclusive inativas)."""
    return (
        db.query(ChecklistItem)
        .order_by(ChecklistItem.order)
        .all()
    )


@router.post("/checklist", response_model=ChecklistItemOut, status_code=status.HTTP_201_CREATED)
def create_checklist_item(
    payload: ChecklistItemCreate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Cria uma nova pergunta no checklist."""
    options_list = [opt.model_dump() for opt in payload.options]
    points_max = max((opt["points"] for opt in options_list), default=0)

    item = ChecklistItem(
        question_text=payload.question_text,
        answer_type=payload.answer_type,
        options=options_list,
        points_max=points_max,
        profile_type=payload.profile_type,
        order=payload.order,
        is_active=payload.is_active,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/checklist/{item_id}", response_model=ChecklistItemOut)
def update_checklist_item(
    item_id: str,
    payload: ChecklistItemUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Atualiza uma pergunta do checklist."""
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pergunta não encontrada")

    if payload.question_text is not None:
        item.question_text = payload.question_text
    if payload.answer_type is not None:
        item.answer_type = payload.answer_type
    if payload.options is not None:
        options_list = [opt.model_dump() for opt in payload.options]
        item.options = options_list
        item.points_max = max((opt["points"] for opt in options_list), default=0)
    if payload.profile_type is not None:
        item.profile_type = payload.profile_type
    if payload.order is not None:
        item.order = payload.order
    if payload.is_active is not None:
        item.is_active = payload.is_active

    db.commit()
    db.refresh(item)
    return item


@router.delete("/checklist/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist_item(
    item_id: str,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Soft-delete: desativa a pergunta sem remover do banco."""
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Pergunta não encontrada")
    item.is_active = False
    db.commit()


# ───────────────────────────────────────────
# Scoring Config
# ───────────────────────────────────────────

@router.get("/scoring-config", response_model=ScoringConfigOut)
def get_scoring_config(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Retorna os parâmetros globais de pontuação."""
    config = db.query(ScoringConfig).first()
    if not config:
        raise HTTPException(status_code=500, detail="Configuração de pontuação não encontrada. Execute a migration.")
    return config


@router.put("/scoring-config", response_model=ScoringConfigOut)
def update_scoring_config(
    payload: ScoringConfigUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Atualiza os parâmetros globais de pontuação."""
    config = db.query(ScoringConfig).first()
    if not config:
        raise HTTPException(status_code=500, detail="Configuração de pontuação não encontrada.")

    config.points_per_record_30d = payload.points_per_record_30d
    config.points_per_evidence = payload.points_per_evidence
    config.points_per_unique_type = payload.points_per_unique_type
    db.commit()
    db.refresh(config)
    return config


# ───────────────────────────────────────────
# Certification Thresholds
# ───────────────────────────────────────────

@router.get("/certification-config", response_model=CertificationThresholdsOut)
def get_certification_config(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Retorna os limiares de certificação."""
    return _load_thresholds(db)


@router.put("/certification-config", response_model=CertificationThresholdsOut)
def update_certification_config(
    payload: CertificationThresholdsUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Atualiza os limiares Bronze/Prata/Ouro."""
    updates = {"bronze": payload.bronze, "prata": payload.prata, "ouro": payload.ouro}
    for level, min_score in updates.items():
        row = db.query(CertificationThreshold).filter(CertificationThreshold.level == level).first()
        if not row:
            raise HTTPException(status_code=500, detail=f"Threshold '{level}' não encontrado.")
        row.min_score = min_score
    db.commit()
    return _load_thresholds(db)


def _load_thresholds(db: Session) -> CertificationThresholdsOut:
    rows = db.query(CertificationThreshold).all()
    data = {row.level: row.min_score for row in rows}
    return CertificationThresholdsOut(
        bronze=data.get("bronze", 30),
        prata=data.get("prata", 70),
        ouro=data.get("ouro", 120),
    )


# ───────────────────────────────────────────
# Waste Type Scoring
# ───────────────────────────────────────────

@router.get("/waste-scoring", response_model=List[WasteTypeScoringOut])
def get_waste_scoring(
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Retorna pontuação por kg para cada tipo de resíduo."""
    return db.query(WasteTypeScoring).order_by(WasteTypeScoring.waste_type).all()


@router.put("/waste-scoring", response_model=List[WasteTypeScoringOut])
def update_waste_scoring(
    payload: WasteTypeScoringBulkUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Atualiza em bulk os pts/kg por tipo de resíduo."""
    for item in payload.items:
        row = (
            db.query(WasteTypeScoring)
            .filter(WasteTypeScoring.waste_type == item.waste_type)
            .first()
        )
        if not row:
            raise HTTPException(status_code=404, detail=f"Tipo de resíduo '{item.waste_type}' não encontrado.")
        row.points_per_kg = item.points_per_kg
    db.commit()
    return db.query(WasteTypeScoring).order_by(WasteTypeScoring.waste_type).all()
