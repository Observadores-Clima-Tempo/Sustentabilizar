"""create waste_records and evidences tables

Revision ID: 0002_create_waste_and_evidences
Revises: 0001_create_users_table
Create Date: 2026-06-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002_create_waste_and_evidences"
down_revision: Union[str, None] = "0001_create_users_table"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "waste_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "waste_type",
            sa.Enum(
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
        ),
        sa.Column("weight_kg", sa.Numeric(8, 3), nullable=False),
        sa.Column("volume_liters", sa.Numeric(8, 2), nullable=True),
        sa.Column(
            "collection_frequency",
            sa.Enum(
                "diaria",
                "semanal",
                "quinzenal",
                "mensal",
                "esporadica",
                name="collection_frequency_enum",
            ),
            nullable=False,
        ),
        sa.Column("collection_date", sa.Date, nullable=False),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_index("ix_waste_records_user_id", "waste_records", ["user_id"])
    op.create_index(
        "ix_waste_records_collection_date",
        "waste_records",
        ["collection_date"],
    )

    op.create_table(
        "evidences",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "waste_record_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("waste_records.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_size_bytes", sa.Integer, nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    op.create_index("ix_evidences_waste_record_id", "evidences", ["waste_record_id"])
    op.create_index("ix_evidences_user_id", "evidences", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_evidences_user_id", table_name="evidences")
    op.drop_index("ix_evidences_waste_record_id", table_name="evidences")
    op.drop_table("evidences")

    op.drop_index("ix_waste_records_collection_date", table_name="waste_records")
    op.drop_index("ix_waste_records_user_id", table_name="waste_records")
    op.drop_table("waste_records")

    sa.Enum(name="collection_frequency_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="waste_type_enum").drop(op.get_bind(), checkfirst=True)
