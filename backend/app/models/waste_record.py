import uuid

from sqlalchemy import Column, Date, DateTime, Enum as SAEnum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class WasteRecord(Base):
    __tablename__ = "waste_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
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
        ),
        nullable=False,
    )
    weight_kg = Column(Numeric(8, 3), nullable=False)
    volume_liters = Column(Numeric(8, 2), nullable=True)
    collection_frequency = Column(
        SAEnum(
            "diaria",
            "semanal",
            "quinzenal",
            "mensal",
            "esporadica",
            name="collection_frequency_enum",
        ),
        nullable=False,
    )
    collection_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    evidences = relationship(
        "Evidence", back_populates="waste_record", cascade="all, delete-orphan"
    )
