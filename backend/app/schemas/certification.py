from datetime import date
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel


class CriterionResult(BaseModel):
    label: str
    description: str
    points_earned: int
    achieved: bool


class ThresholdsOut(BaseModel):
    bronze: int
    prata: int
    ouro: int


class CertificationOut(BaseModel):
    level: str
    total_score: int
    score_from_checklist: int
    score_from_records: int
    valid_from: Optional[date]
    valid_until: Optional[date]
    thresholds: ThresholdsOut
    criteria: List[CriterionResult]

    model_config = {"from_attributes": False}
