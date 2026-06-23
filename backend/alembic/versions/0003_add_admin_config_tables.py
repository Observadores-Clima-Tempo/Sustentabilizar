"""add is_admin to users + admin config tables + seed

Revision ID: 0003_add_admin_config_tables
Revises: 0002_create_waste_and_evidences
Create Date: 2026-06-23 00:00:00.000000

"""
import uuid
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import ENUM as PGEnum

revision: str = "0003_add_admin_config_tables"
down_revision: Union[str, None] = "0002_create_waste_and_evidences"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ---------- 1. ALTER users: add is_admin ----------
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean, nullable=False, server_default="false"),
    )

    # ---------- 2. scoring_config ----------
    op.create_table(
        "scoring_config",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("points_per_record_30d", sa.Integer, nullable=False, server_default="5"),
        sa.Column("points_per_evidence", sa.Integer, nullable=False, server_default="2"),
        sa.Column("points_per_unique_type", sa.Integer, nullable=False, server_default="3"),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )

    # ---------- 3. certification_thresholds ----------
    # cert_level_enum é um tipo NOVO — criar inline com create_table (padrão do Alembic)
    op.create_table(
        "certification_thresholds",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "level",
            sa.Enum("bronze", "prata", "ouro", name="cert_level_enum"),
            nullable=False,
        ),
        sa.Column("min_score", sa.Integer, nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_cert_thresholds_level", "certification_thresholds", ["level"], unique=True
    )

    # ---------- 4. waste_type_scoring ----------
    # waste_type_enum já existe (criado na migration 0002) — usar create_type=False
    op.create_table(
        "waste_type_scoring",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "waste_type",
            PGEnum(
                "papel", "plastico", "vidro", "metal",
                "organico", "eletronico", "perigoso", "outro",
                name="waste_type_enum",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("points_per_kg", sa.Numeric(6, 3), nullable=False, server_default="1.0"),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_waste_type_scoring_type", "waste_type_scoring", ["waste_type"], unique=True
    )

    # ---------- 5. checklist_items ----------
    # answer_type_enum é um tipo NOVO — criar inline com create_table
    # profile_type_enum já existe (migration 0001) — create_type=False
    op.create_table(
        "checklist_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("question_text", sa.Text, nullable=False),
        sa.Column(
            "answer_type",
            sa.Enum("yes_no", "multiple_choice", "scale_1_5", name="answer_type_enum"),
            nullable=False,
        ),
        sa.Column("options", postgresql.JSONB, nullable=False, server_default="[]"),
        sa.Column("points_max", sa.Integer, nullable=False, server_default="0"),
        sa.Column(
            "profile_type",
            PGEnum(
                "pessoa_fisica", "pessoa_juridica", "cooperativa", "auditor",
                name="profile_type_enum",
                create_type=False,
            ),
            nullable=False,
            server_default="pessoa_fisica",
        ),
        sa.Column("order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
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
    )

    # ---------- 6. Seed: scoring_config (1 row) ----------
    scoring_id = str(uuid.uuid4())
    op.execute(
        f"""
        INSERT INTO scoring_config (id, points_per_record_30d, points_per_evidence, points_per_unique_type)
        VALUES ('{scoring_id}', 5, 2, 3)
        """
    )

    # ---------- 7. Seed: certification_thresholds (3 rows) ----------
    op.execute(
        f"""
        INSERT INTO certification_thresholds (id, level, min_score) VALUES
        ('{uuid.uuid4()}', 'bronze', 30),
        ('{uuid.uuid4()}', 'prata',  70),
        ('{uuid.uuid4()}', 'ouro',   120)
        """
    )

    # ---------- 8. Seed: waste_type_scoring (8 rows) ----------
    waste_scores = [
        ("eletronico", 5.0),
        ("perigoso",   4.0),
        ("vidro",      2.0),
        ("metal",      2.0),
        ("plastico",   1.5),
        ("papel",      1.0),
        ("organico",   1.0),
        ("outro",      0.5),
    ]
    values = ", ".join(
        f"('{uuid.uuid4()}', '{wt}', {pts})" for wt, pts in waste_scores
    )
    op.execute(f"INSERT INTO waste_type_scoring (id, waste_type, points_per_kg) VALUES {values}")

    # ---------- 9. Seed: checklist_items ----------
    checklist_items = [
        {
            "question_text": "Você separa resíduos recicláveis dos orgânicos em casa?",
            "answer_type": "yes_no",
            "options": '[{"value": "sim", "label": "Sim", "points": 10}, {"value": "nao", "label": "Não", "points": 0}]',
            "points_max": 10,
            "order": 1,
        },
        {
            "question_text": "Com que frequência você descarta resíduos recicláveis corretamente?",
            "answer_type": "scale_1_5",
            "options": '[{"value": "1", "label": "1 — Nunca", "points": 0}, {"value": "2", "label": "2 — Raramente", "points": 3}, {"value": "3", "label": "3 — Às vezes", "points": 5}, {"value": "4", "label": "4 — Frequentemente", "points": 8}, {"value": "5", "label": "5 — Sempre", "points": 10}]',
            "points_max": 10,
            "order": 2,
        },
        {
            "question_text": "Quais tipos de resíduos você separa regularmente?",
            "answer_type": "multiple_choice",
            "options": '[{"value": "papel_plastico", "label": "Papel e Plástico", "points": 5}, {"value": "todos", "label": "Todos os tipos recicláveis", "points": 10}, {"value": "organico", "label": "Apenas orgânicos", "points": 3}, {"value": "nenhum", "label": "Nenhum", "points": 0}]',
            "points_max": 10,
            "order": 3,
        },
        {
            "question_text": "Você conhece os pontos de coleta seletiva da sua cidade?",
            "answer_type": "yes_no",
            "options": '[{"value": "sim", "label": "Sim", "points": 5}, {"value": "nao", "label": "Não", "points": 0}]',
            "points_max": 5,
            "order": 4,
        },
        {
            "question_text": "Você já recusou produtos com embalagem excessiva por consciência ambiental?",
            "answer_type": "yes_no",
            "options": '[{"value": "sim", "label": "Sim", "points": 5}, {"value": "nao", "label": "Não", "points": 0}]',
            "points_max": 5,
            "order": 5,
        },
        {
            "question_text": "Como você avalia seu nível geral de consciência ambiental?",
            "answer_type": "scale_1_5",
            "options": '[{"value": "1", "label": "1 — Muito baixo", "points": 0}, {"value": "2", "label": "2 — Baixo", "points": 3}, {"value": "3", "label": "3 — Médio", "points": 5}, {"value": "4", "label": "4 — Alto", "points": 8}, {"value": "5", "label": "5 — Muito alto", "points": 10}]',
            "points_max": 10,
            "order": 6,
        },
    ]

    for item in checklist_items:
        item_id = str(uuid.uuid4())
        # Escape single quotes in JSON
        options_escaped = item["options"].replace("'", "''")
        op.execute(
            f"""
            INSERT INTO checklist_items
              (id, question_text, answer_type, options, points_max, profile_type, "order", is_active)
            VALUES
              ('{item_id}',
               '{item["question_text"].replace("'", "''")}',
               '{item["answer_type"]}',
               '{options_escaped}'::jsonb,
               {item["points_max"]},
               'pessoa_fisica',
               {item["order"]},
               true)
            """
        )


def downgrade() -> None:
    op.drop_table("checklist_items")
    op.drop_table("waste_type_scoring")
    op.drop_table("certification_thresholds")
    op.drop_table("scoring_config")
    op.drop_column("users", "is_admin")
    sa.Enum(name="answer_type_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="cert_level_enum").drop(op.get_bind(), checkfirst=True)
