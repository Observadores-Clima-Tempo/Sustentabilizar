from datetime import date, datetime, timedelta, timezone
from typing import List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.admin_config import CertificationThreshold, ScoringConfig, WasteTypeScoring
from app.models.admin_config import ChecklistItem
from app.models.certification import Certification
from app.models.checklist_response import ChecklistResponse
from app.models.evidence import Evidence
from app.models.user import User
from app.models.waste_record import WasteRecord
from app.schemas.certification import CertificationOut, CriterionResult, ThresholdsOut


def recalculate(db: Session, user_id) -> None:
    """
    Recalcula e persiste a certificação do usuário com base nos registros,
    respostas ao checklist e na configuração atual do banco.
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

    # --- Pontos de checklist (respostas mais recentes por pergunta) ---
    score_from_checklist = _get_checklist_score(db, user_id)

    total_score = score_from_checklist + score_from_records

    # --- Determinar nível ---
    level = "sem_nivel"
    if total_score >= thresholds.get("ouro", 120):
        level = "ouro"
    elif total_score >= thresholds.get("prata", 70):
        level = "prata"
    elif total_score >= thresholds.get("bronze", 30):
        level = "bronze"

    # --- Persistir / atualizar certificação (upsert por user_id) ---
    today = date.today()
    cert = db.query(Certification).filter(Certification.user_id == user_id).first()
    if cert:
        cert.level = level
        cert.total_score = total_score
        cert.score_from_checklist = score_from_checklist
        cert.score_from_records = score_from_records
        cert.valid_from = today
        cert.valid_until = date(today.year + 1, today.month, today.day)
    else:
        cert = Certification(
            user_id=user_id,
            level=level,
            total_score=total_score,
            score_from_checklist=score_from_checklist,
            score_from_records=score_from_records,
            valid_from=today,
            valid_until=date(today.year + 1, today.month, today.day),
        )
        db.add(cert)
    db.commit()


def _get_checklist_score(db: Session, user_id) -> int:
    """
    Soma os pontos das respostas mais recentes por pergunta do checklist.
    Usa uma subquery para pegar o responded_at mais recente por item.
    """
    # Subquery: para cada (user_id, checklist_item_id), pega o responded_at mais recente
    subq = (
        db.query(
            ChecklistResponse.checklist_item_id,
            func.max(ChecklistResponse.responded_at).label("latest_at"),
        )
        .filter(ChecklistResponse.user_id == user_id)
        .group_by(ChecklistResponse.checklist_item_id)
        .subquery()
    )

    # Join para pegar os pontos das respostas mais recentes
    result = (
        db.query(func.coalesce(func.sum(ChecklistResponse.points_earned), 0))
        .join(
            subq,
            (ChecklistResponse.checklist_item_id == subq.c.checklist_item_id)
            & (ChecklistResponse.responded_at == subq.c.latest_at),
        )
        .filter(ChecklistResponse.user_id == user_id)
        .scalar()
    )
    return int(result or 0)


def get_certification_out(db: Session, user_id) -> CertificationOut:
    """
    Retorna o objeto CertificationOut completo para exibição na UI.
    Se não existir certificação ainda, retorna estado inicial sem_nivel com score 0.
    """
    thresholds_rows = {
        row.level: row.min_score
        for row in db.query(CertificationThreshold).all()
    }
    thresholds = ThresholdsOut(
        bronze=thresholds_rows.get("bronze", 30),
        prata=thresholds_rows.get("prata", 70),
        ouro=thresholds_rows.get("ouro", 120),
    )

    cert = db.query(Certification).filter(Certification.user_id == user_id).first()

    if not cert:
        # Nenhum recálculo feito ainda — estado inicial
        return CertificationOut(
            level="sem_nivel",
            total_score=0,
            score_from_checklist=0,
            score_from_records=0,
            valid_from=None,
            valid_until=None,
            thresholds=thresholds,
            criteria=_build_criteria(
                db=db,
                user_id=user_id,
                score_from_checklist=0,
                score_from_records=0,
                total_score=0,
                thresholds=thresholds_rows,
            ),
        )

    return CertificationOut(
        level=cert.level,
        total_score=cert.total_score,
        score_from_checklist=cert.score_from_checklist,
        score_from_records=cert.score_from_records,
        valid_from=cert.valid_from,
        valid_until=cert.valid_until,
        thresholds=thresholds,
        criteria=_build_criteria(
            db=db,
            user_id=user_id,
            score_from_checklist=cert.score_from_checklist,
            score_from_records=cert.score_from_records,
            total_score=cert.total_score,
            thresholds=thresholds_rows,
        ),
    )


def _build_criteria(
    db: Session,
    user_id,
    score_from_checklist: int,
    score_from_records: int,
    total_score: int,
    thresholds: dict,
) -> List[CriterionResult]:
    """Constrói a lista de critérios avaliados para exibição no certificado."""
    criteria = []

    # Critério 1: Diagnóstico inicial
    checklist_count = (
        db.query(func.count(ChecklistResponse.checklist_item_id.distinct()))
        .filter(ChecklistResponse.user_id == user_id)
        .scalar()
    )
    criteria.append(
        CriterionResult(
            label="Diagnóstico inicial",
            description="Respostas ao questionário de diagnóstico ambiental",
            points_earned=score_from_checklist,
            achieved=score_from_checklist > 0 and (checklist_count or 0) > 0,
        )
    )

    # Critério 2: Registros de resíduos (30 dias)
    cutoff = datetime.now(tz=timezone.utc) - timedelta(days=30)
    records_30d = (
        db.query(func.count(WasteRecord.id))
        .filter(WasteRecord.user_id == user_id)
        .filter(WasteRecord.created_at >= cutoff)
        .scalar()
    ) or 0
    criteria.append(
        CriterionResult(
            label="Registros recentes (30 dias)",
            description=f"{records_30d} registro(s) nos últimos 30 dias",
            points_earned=score_from_records,
            achieved=records_30d > 0,
        )
    )

    # Critério 3: Evidências registradas
    evidence_count = (
        db.query(func.count(Evidence.id))
        .join(WasteRecord, Evidence.waste_record_id == WasteRecord.id)
        .filter(WasteRecord.user_id == user_id)
        .scalar()
    ) or 0
    criteria.append(
        CriterionResult(
            label="Evidências registradas",
            description=f"{evidence_count} evidência(s) anexada(s) aos registros",
            points_earned=0,  # já contabilizado em score_from_records
            achieved=evidence_count > 0,
        )
    )

    # Critério 4: Atingir nível Bronze
    criteria.append(
        CriterionResult(
            label="Nível Bronze",
            description=f"Mínimo {thresholds.get('bronze', 30)} pontos",
            points_earned=0,
            achieved=total_score >= thresholds.get("bronze", 30),
        )
    )

    # Critério 5: Atingir nível Prata
    criteria.append(
        CriterionResult(
            label="Nível Prata",
            description=f"Mínimo {thresholds.get('prata', 70)} pontos",
            points_earned=0,
            achieved=total_score >= thresholds.get("prata", 70),
        )
    )

    # Critério 6: Atingir nível Ouro
    criteria.append(
        CriterionResult(
            label="Nível Ouro",
            description=f"Mínimo {thresholds.get('ouro', 120)} pontos",
            points_earned=0,
            achieved=total_score >= thresholds.get("ouro", 120),
        )
    )

    return criteria

