from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


class WasteRecordCreate(BaseModel):
    waste_type: str
    weight_kg: Decimal
    volume_liters: Optional[Decimal] = None
    collection_frequency: str
    collection_date: date
    notes: Optional[str] = None

    @field_validator("waste_type")
    @classmethod
    def validate_waste_type(cls, v: str) -> str:
        valid = {"papel", "plastico", "vidro", "metal", "organico", "eletronico", "perigoso", "outro"}
        if v not in valid:
            raise ValueError(f"Tipo de resíduo inválido: {v}")
        return v

    @field_validator("collection_frequency")
    @classmethod
    def validate_frequency(cls, v: str) -> str:
        valid = {"diaria", "semanal", "quinzenal", "mensal", "esporadica"}
        if v not in valid:
            raise ValueError(f"Frequência inválida: {v}")
        return v

    @field_validator("weight_kg")
    @classmethod
    def validate_weight(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Peso deve ser maior que zero")
        return v


class EvidenceOut(BaseModel):
    id: UUID
    waste_record_id: UUID
    user_id: UUID
    file_url: str
    file_name: str
    file_size_bytes: int
    mime_type: str
    captured_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class WasteRecordOut(BaseModel):
    id: UUID
    user_id: UUID
    waste_type: str
    weight_kg: Decimal
    volume_liters: Optional[Decimal]
    collection_frequency: str
    collection_date: date
    notes: Optional[str]
    created_at: datetime
    evidences: List[EvidenceOut] = []

    model_config = {"from_attributes": True}
