import re
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    cpf: str
    password: str
    city: str
    state: str

    @field_validator("cpf")
    @classmethod
    def validate_cpf(cls, v: str) -> str:
        cleaned = re.sub(r"\D", "", v)
        if len(cleaned) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        return f"{cleaned[:3]}.{cleaned[3:6]}.{cleaned[6:9]}-{cleaned[9:]}"

    @field_validator("state")
    @classmethod
    def validate_state(cls, v: str) -> str:
        valid_ufs = {
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
            "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
            "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
        }
        upper = v.upper()
        if upper not in valid_ufs:
            raise ValueError("UF inválida")
        return upper


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    cpf: str
    profile_type: str
    city: str
    state: str
    created_at: datetime
    is_active: bool
    is_admin: bool

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

    @field_validator("state")
    @classmethod
    def validate_state(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        valid_ufs = {
            "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
            "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
            "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
        }
        upper = v.upper()
        if upper not in valid_ufs:
            raise ValueError("UF inválida")
        return upper
