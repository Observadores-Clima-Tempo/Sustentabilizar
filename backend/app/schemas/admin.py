from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, field_validator, model_validator


# ---------- ChecklistItem schemas ----------

class ChecklistOptionSchema(BaseModel):
    value: str
    label: str
    points: int


class ChecklistItemCreate(BaseModel):
    question_text: str
    answer_type: str  # yes_no | multiple_choice | scale_1_5
    options: List[ChecklistOptionSchema]
    profile_type: str = "pessoa_fisica"
    order: int = 0
    is_active: bool = True

    @field_validator("answer_type")
    @classmethod
    def validate_answer_type(cls, v: str) -> str:
        allowed = {"yes_no", "multiple_choice", "scale_1_5"}
        if v not in allowed:
            raise ValueError(f"answer_type deve ser um de: {allowed}")
        return v


class ChecklistItemUpdate(BaseModel):
    question_text: Optional[str] = None
    answer_type: Optional[str] = None
    options: Optional[List[ChecklistOptionSchema]] = None
    profile_type: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class ChecklistItemOut(BaseModel):
    id: UUID
    question_text: str
    answer_type: str
    options: Any  # JSONB — list of dicts
    points_max: int
    profile_type: str
    order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ---------- ScoringConfig schemas ----------

class ScoringConfigOut(BaseModel):
    id: UUID
    points_per_record_30d: int
    points_per_evidence: int
    points_per_unique_type: int
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScoringConfigUpdate(BaseModel):
    points_per_record_30d: int
    points_per_evidence: int
    points_per_unique_type: int

    @field_validator("points_per_record_30d", "points_per_evidence", "points_per_unique_type")
    @classmethod
    def must_be_positive(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Pontuação não pode ser negativa")
        return v


# ---------- CertificationThreshold schemas ----------

class CertificationThresholdItem(BaseModel):
    level: str
    min_score: int


class CertificationThresholdsOut(BaseModel):
    bronze: int
    prata: int
    ouro: int


class CertificationThresholdsUpdate(BaseModel):
    bronze: int
    prata: int
    ouro: int

    @model_validator(mode="after")
    def validate_order(self) -> "CertificationThresholdsUpdate":
        if not (self.bronze < self.prata < self.ouro):
            raise ValueError(
                "Limiares devem ser crescentes: bronze < prata < ouro"
            )
        return self


# ---------- WasteTypeScoring schemas ----------

class WasteTypeScoringItem(BaseModel):
    waste_type: str
    points_per_kg: float


class WasteTypeScoringOut(BaseModel):
    id: UUID
    waste_type: str
    points_per_kg: float
    updated_at: datetime

    model_config = {"from_attributes": True}


class WasteTypeScoringBulkUpdate(BaseModel):
    items: List[WasteTypeScoringItem]

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: List[WasteTypeScoringItem]) -> List[WasteTypeScoringItem]:
        valid_types = {
            "papel", "plastico", "vidro", "metal",
            "organico", "eletronico", "perigoso", "outro",
        }
        for item in v:
            if item.waste_type not in valid_types:
                raise ValueError(f"Tipo de resíduo inválido: {item.waste_type}")
            if item.points_per_kg < 0:
                raise ValueError("points_per_kg não pode ser negativo")
        return v


# ---------- Public config (unauthenticated) ----------

class PublicConfigOut(BaseModel):
    certification_thresholds: CertificationThresholdsOut
