from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.certification import CertificationOut
from app.services import certification_service

router = APIRouter()


@router.get("/me", response_model=CertificationOut)
def get_my_certification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna o nível de certificação atual do usuário, a composição da pontuação
    e os critérios avaliados individualmente.
    """
    return certification_service.get_certification_out(db, current_user.id)
