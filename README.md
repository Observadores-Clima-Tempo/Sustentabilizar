# Sustentabilizar

Plataforma de certificação ambiental para pessoas físicas que registram e comprovam seus hábitos de reciclagem.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy + Alembic
- **Banco:** PostgreSQL 15

## Rodando localmente

### Com Docker (recomendado)

```bash
# 1. Copie os arquivos de exemplo de variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Suba todos os serviços
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend (API): http://localhost:8000
- Docs interativos (Swagger): http://localhost:8000/docs

### Sem Docker

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edite com sua DATABASE_URL local
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Estrutura

```
sustentabilizar/
├── frontend/    # React SPA (Vite)
└── backend/     # API FastAPI
```