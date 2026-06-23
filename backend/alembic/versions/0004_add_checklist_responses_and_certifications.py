"""add checklist_responses and certifications tables

Revision ID: 0004_add_checklist_responses_and_certifications
Revises: 0003_add_admin_config_tables
Create Date: 2026-06-23 00:00:00.000000

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import ENUM as PGEnum

revision: str = "0004_checklist_certs"
down_revision: Union[str, None] = "0003_add_admin_config_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ---------- 1. checklist_responses ----------
    op.create_table(
        "checklist_responses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "checklist_item_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("checklist_items.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("answer_value", sa.String(255), nullable=False),
        sa.Column("points_earned", sa.Integer, nullable=False, server_default="0"),
        sa.Column(
            "responded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_checklist_responses_user_id", "checklist_responses", ["user_id"])
    op.create_index(
        "ix_checklist_responses_item_id", "checklist_responses", ["checklist_item_id"]
    )

    # ---------- 2. certifications ----------
    # certification_level_enum é um tipo NOVO — inclui sem_nivel
    op.create_table(
        "certifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "level",
            sa.Enum("sem_nivel", "bronze", "prata", "ouro", name="certification_level_enum"),
            nullable=False,
            server_default="sem_nivel",
        ),
        sa.Column("total_score", sa.Integer, nullable=False, server_default="0"),
        sa.Column("score_from_checklist", sa.Integer, nullable=False, server_default="0"),
        sa.Column("score_from_records", sa.Integer, nullable=False, server_default="0"),
        sa.Column("valid_from", sa.Date, nullable=True),
        sa.Column("valid_until", sa.Date, nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_certifications_user_id", "certifications", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_table("certifications")
    op.execute("DROP TYPE IF EXISTS certification_level_enum")
    op.drop_index("ix_checklist_responses_item_id", table_name="checklist_responses")
    op.drop_index("ix_checklist_responses_user_id", table_name="checklist_responses")
    op.drop_table("checklist_responses")
