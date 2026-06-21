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


@app.get("/health", tags=["health"])
def health_check():
    """Verifica se a API está respondendo."""
    return {"status": "ok", "version": "0.1.0"}
