import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import api_router
from app.core.config import settings

# Garante que o diretório de uploads existe
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Sustentabilizar API",
    description="API para certificação de sustentabilidade ambiental",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# Exception handlers globais — respostas JSON consistentes para todos os erros
# ---------------------------------------------------------------------------


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    messages = []
    for error in exc.errors():
        loc = " → ".join(str(part) for part in error["loc"] if part != "body")
        msg = error["msg"]
        messages.append(f"{loc}: {msg}" if loc else msg)
    return JSONResponse(
        status_code=422,
        content={"detail": "; ".join(messages) if messages else "Dados inválidos."},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "Erro interno do servidor. Tente novamente em instantes."},
    )


# CORS — origens lidas da variável de ambiente CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
