import uuid

from sqlalchemy import Column, Date, DateTime, Enum as SAEnum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        unique=True,  # um único registro por usuário (upsert)
    )
    level = Column(
        SAEnum("sem_nivel", "bronze", "prata", "ouro", name="certification_level_enum"),
        nullable=False,
        default="sem_nivel",
    )
    total_score = Column(Integer, nullable=False, default=0)
    score_from_checklist = Column(Integer, nullable=False, default=0)
    score_from_records = Column(Integer, nullable=False, default=0)
    valid_from = Column(Date, nullable=True)
    valid_until = Column(Date, nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
