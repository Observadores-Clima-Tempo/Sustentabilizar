import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    cpf = Column(String(14), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    profile_type = Column(
        SAEnum(
            "pessoa_fisica",
            "pessoa_juridica",
            "cooperativa",
            "auditor",
            name="profile_type_enum",
        ),
        nullable=False,
        default="pessoa_fisica",
    )
    city = Column(String(100), nullable=False)
    state = Column(String(2), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    is_active = Column(Boolean, nullable=False, default=True)
