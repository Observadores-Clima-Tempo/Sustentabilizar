import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class ChecklistResponse(Base):
    __tablename__ = "checklist_responses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    checklist_item_id = Column(
        UUID(as_uuid=True),
        ForeignKey("checklist_items.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    answer_value = Column(String(255), nullable=False)
    points_earned = Column(Integer, nullable=False, default=0)
    responded_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
