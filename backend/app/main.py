import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings

# Garante que o diretório de uploads existe antes de montar como estático
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Sustentabilizar API",
    description="API para certificação de sustentabilidade ambiental",
    version="0.1.0",
)

# CORS — permite que o frontend (porta 5173) chame o backend sem bloqueio
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve arquivos de evidências estaticamente
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Registra todos os routers da v1
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def bootstrap_admin() -> None:
    """
    Cria o usuário admin na inicialização se nenhum admin existir.
    Idempotente — não cria duplicata.
    """
    from app.core.security import hash_password
    from app.db.session import SessionLocal
    from app.models.user import User

    db = SessionLocal()
    try:
        admin_exists = (
            db.query(User)
            .filter(User.is_admin == True)  # noqa: E712
            .first()
        )
        if admin_exists:
            return

        # Verifica se já existe um usuário com o e-mail admin
        existing = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if existing:
            existing.is_admin = True
            db.commit()
            return

        admin_user = User(
            name="Administrador",
            email=settings.ADMIN_EMAIL,
            cpf="000.000.000-00",
            password_hash=hash_password(settings.ADMIN_PASSWORD),
            profile_type="pessoa_fisica",
            city="Campos dos Goytacazes",
            state="RJ",
            is_active=True,
            is_admin=True,
        )
        db.add(admin_user)
        db.commit()
    except Exception:
        db.rollback()
        # Silencia erros de startup para não bloquear a API
        # (ex: banco ainda não migrado)
    finally:
        db.close()


@app.get("/health", tags=["health"])
def health_check():
    """Verifica se a API está respondendo."""
    return {"status": "ok", "version": "0.1.0"}
