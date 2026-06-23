"""
Endpoint público para configurações do sistema (sem autenticação).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.admin_config import CertificationThreshold
from app.schemas.admin import CertificationThresholdsOut, PublicConfigOut

router = APIRouter()


@router.get("/public", response_model=PublicConfigOut)
def get_public_config(db: Session = Depends(get_db)):
    """
    Retorna configurações públicas do sistema.
    Usado pela landing page para exibir limiares de certificação atualizados.
    """
    rows = db.query(CertificationThreshold).all()
    data = {row.level: row.min_score for row in rows}

    # Fallback para valores padrão caso o banco esteja vazio
    thresholds = CertificationThresholdsOut(
        bronze=data.get("bronze", 30),
        prata=data.get("prata", 70),
        ouro=data.get("ouro", 120),
    )
    return PublicConfigOut(certification_thresholds=thresholds)
