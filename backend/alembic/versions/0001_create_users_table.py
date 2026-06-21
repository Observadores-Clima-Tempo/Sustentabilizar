"""create users table

Revision ID: 0001_create_users_table
Revises:
Create Date: 2026-06-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_create_users_table"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("cpf", sa.String(14), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "profile_type",
            sa.Enum(
                "pessoa_fisica",
                "pessoa_juridica",
                "cooperativa",
                "auditor",
                name="profile_type_enum",
                # create_type=True (padrão) — SQLAlchemy cria o tipo automaticamente
            ),
            nullable=False,
            server_default="pessoa_fisica",
        ),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("state", sa.String(2), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
    )

    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_cpf", "users", ["cpf"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_cpf", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    # Remove o tipo ENUM após a tabela ser removida
    sa.Enum(name="profile_type_enum").drop(op.get_bind(), checkfirst=True)
