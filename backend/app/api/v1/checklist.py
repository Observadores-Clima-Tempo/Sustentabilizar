from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.dependencies import get_current_user, get_db
from app.models.admin_config import ChecklistItem
from app.models.checklist_response import ChecklistResponse
from app.models.user import User
from app.schemas.checklist import (
    ChecklistItemPublic,
    ChecklistResponseOut,
    ChecklistSubmission,
)
from app.services import certification_service

router = APIRouter()


@router.get("", response_model=List[ChecklistItemPublic])
def get_checklist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna as perguntas ativas do checklist para pessoa_fisica, ordenadas por `order`."""
    items = (
        db.query(ChecklistItem)
        .filter(
            ChecklistItem.is_active == True,
            ChecklistItem.profile_type == "pessoa_fisica",
        )
        .order_by(ChecklistItem.order)
        .all()
    )
    return items


@router.post("/responses", response_model=ChecklistResponseOut, status_code=status.HTTP_201_CREATED)
def submit_responses(
    payload: ChecklistSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Salva as respostas do checklist do usuário.
    Para cada resposta, busca a pergunta e lê os pontos da opção selecionada.
    Após salvar, dispara o recálculo da certificação.
    """
    if not payload.responses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nenhuma resposta fornecida",
        )

    saved_count = 0
    score = 0

    for resp in payload.responses:
        item = db.query(ChecklistItem).filter(ChecklistItem.id == resp.checklist_item_id).first()
        if not item:
            continue  # pergunta não encontrada — ignora silenciosamente

        # Determina pontos com base na opção selecionada
        points_earned = 0
        options = item.options or []
        for opt in options:
            if isinstance(opt, dict) and opt.get("value") == resp.answer_value:
                points_earned = int(opt.get("points", 0))
                break

        db_response = ChecklistResponse(
            user_id=current_user.id,
            checklist_item_id=resp.checklist_item_id,
            answer_value=resp.answer_value,
            points_earned=points_earned,
        )
        db.add(db_response)
        saved_count += 1
        score += points_earned

    db.commit()

    # Recalcula certificação após salvar as respostas
    certification_service.recalculate(db, current_user.id)

    return ChecklistResponseOut(saved=saved_count, score_from_checklist=score)
