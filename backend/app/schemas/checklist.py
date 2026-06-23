from datetime import datetime
from typing import Any, Dict, List
from uuid import UUID

from pydantic import BaseModel


# ---------- User-facing Checklist schemas ----------

class ChecklistItemPublic(BaseModel):
    """Schema retornado para o usuário no GET /checklist."""
    id: UUID
    question_text: str
    answer_type: str
    options: Any  # list of {value, label, points}
    points_max: int
    order: int

    model_config = {"from_attributes": True}


class ChecklistResponseCreate(BaseModel):
    """Uma resposta individual a uma pergunta do checklist."""
    checklist_item_id: UUID
    answer_value: str


class ChecklistSubmission(BaseModel):
    """Payload para POST /checklist/responses — todas as respostas de uma vez."""
    responses: List[ChecklistResponseCreate]


class ChecklistResponseOut(BaseModel):
    """Retornado após salvar as respostas."""
    saved: int
    score_from_checklist: int
