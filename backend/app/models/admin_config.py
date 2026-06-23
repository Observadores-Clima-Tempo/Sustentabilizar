import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from app.db.base import Base


class ScoringConfig(Base):
    __tablename__ = "scoring_config"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    points_per_record_30d = Column(Integer, nullable=False, default=5)
    points_per_evidence = Column(Integer, nullable=False, default=2)
    points_per_unique_type = Column(Integer, nullable=False, default=3)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class CertificationThreshold(Base):
    __tablename__ = "certification_thresholds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level = Column(
        SAEnum("bronze", "prata", "ouro", name="cert_level_enum"),
        nullable=False,
        unique=True,
    )
    min_score = Column(Integer, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class WasteTypeScoring(Base):
    __tablename__ = "waste_type_scoring"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    waste_type = Column(
        SAEnum(
            "papel",
            "plastico",
            "vidro",
            "metal",
            "organico",
            "eletronico",
            "perigoso",
            "outro",
            name="waste_type_enum",
            create_type=False,
        ),
        nullable=False,
        unique=True,
    )
    points_per_kg = Column(Numeric(6, 3), nullable=False, default=1.0)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(String, nullable=False)
    answer_type = Column(
        SAEnum("yes_no", "multiple_choice", "scale_1_5", name="answer_type_enum"),
        nullable=False,
    )
    options = Column(JSONB, nullable=False, default=list)
    points_max = Column(Integer, nullable=False, default=0)
    profile_type = Column(
        SAEnum(
            "pessoa_fisica",
            "pessoa_juridica",
            "cooperativa",
            "auditor",
            name="profile_type_enum",
            create_type=False,
        ),
        nullable=False,
        default="pessoa_fisica",
    )
    order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
