from datetime import date, datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.admin_config import CertificationThreshold, ScoringConfig, WasteTypeScoring
from app.models.evidence import Evidence
from app.models.user import User
from app.models.waste_record import WasteRecord


def recalculate(db: Session, user_id) -> None:
    """
    Recalcula e persiste a certificação do usuário com base nos registros e
    na configuração atual do banco (ScoringConfig, CertificationThreshold, WasteTypeScoring).

    Stub parcial para Etapa 3.5 — a lógica de checklist será adicionada na Etapa 4.
    """
    # --- Carregar configurações ---
    config = db.query(ScoringConfig).first()
    if not config:
        return  # banco ainda não migrado

    thresholds = {
        row.level: row.min_score
        for row in db.query(CertificationThreshold).all()
    }
    waste_scoring = {
        row.waste_type: float(row.points_per_kg)
        for row in db.query(WasteTypeScoring).all()
    }

    # --- Pontos de registros (últimos 30 dias) ---
    cutoff = datetime.now(tz=timezone.utc) - timedelta(days=30)
    records = (
        db.query(WasteRecord)
        .filter(WasteRecord.user_id == user_id)
        .filter(WasteRecord.created_at >= cutoff)
        .all()
    )

    score_from_records = 0

    # Pts por registro
    score_from_records += len(records) * config.points_per_record_30d

    # Pts por kg × tipo
    for record in records:
        pts_per_kg = waste_scoring.get(record.waste_type, 0.0)
        score_from_records += int(float(record.weight_kg) * pts_per_kg)

    # Pts por diversidade de tipos
    unique_types = len({r.waste_type for r in records})
    score_from_records += unique_types * config.points_per_unique_type

    # Pts por evidências
    for record in records:
        evidence_count = (
            db.query(func.count(Evidence.id))
            .filter(Evidence.waste_record_id == record.id)
            .scalar()
        )
        score_from_records += (evidence_count or 0) * config.points_per_evidence

    # --- Pontos de checklist (Etapa 4 — stub) ---
    score_from_checklist = 0

    total_score = score_from_checklist + score_from_records

    # --- Determinar nível ---
    level = "sem_nivel"
    if total_score >= thresholds.get("ouro", 120):
        level = "ouro"
    elif total_score >= thresholds.get("prata", 70):
        level = "prata"
    elif total_score >= thresholds.get("bronze", 30):
        level = "bronze"

    # --- Persistir / atualizar certificação (Etapa 4 — quando o modelo Certification existir) ---
    # Por ora, apenas retorna sem persistir (modelo Certification criado na Etapa 4).
    pass

