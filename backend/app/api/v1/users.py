from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Retorna os dados do usuário autenticado (sem senha)."""
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Atualiza os dados editáveis do usuário autenticado.
    E-mail e CPF são imutáveis após o cadastro.
    """
    if payload.name is not None:
        current_user.name = payload.name
    if payload.city is not None:
        current_user.city = payload.city
    if payload.state is not None:
        current_user.state = payload.state

    db.commit()
    db.refresh(current_user)
    return current_user
