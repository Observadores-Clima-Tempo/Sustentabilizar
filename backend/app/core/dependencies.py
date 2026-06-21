from typing import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Dependência que fornece uma sessão de banco de dados por request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
