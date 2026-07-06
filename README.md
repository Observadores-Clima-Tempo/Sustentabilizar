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

# 2. Edite backend/.env com suas credenciais (SECRET_KEY, ADMIN_PASSWORD, etc.)

# 3. Suba todos os serviços
docker compose up --build
```

> Com Docker Compose, a porta do backend no host é **5434** (não 8000).  
> Atualize `frontend/.env`: `VITE_API_URL=http://localhost:5434/api/v1`

- Frontend: http://localhost:5173
- Backend (API): http://localhost:5434
- Docs interativos (Swagger): http://localhost:5434/docs

### Sem Docker

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edite DATABASE_URL para seu PostgreSQL local
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

- Frontend: http://localhost:5173
- Backend (API): http://localhost:8000
- Docs interativos (Swagger): http://localhost:8000/docs

## Deploy em produção

### Backend — Render.com

1. Crie um serviço **Web Service** no [Render](https://render.com/) apontando para a pasta `backend/`.
2. Configure as variáveis de ambiente no painel do Render (aba _Environment_):

| Variável | Valor |
|---|---|
| `DATABASE_URL` | URL do PostgreSQL (ex: Render Postgres ou Supabase) |
| `SECRET_KEY` | String aleatória longa (`python -c "import secrets; print(secrets.token_hex(32))"`) |
| `CORS_ORIGINS` | URL do seu frontend no Vercel (ex: `https://sustentabilizar.vercel.app`) |
| `ADMIN_EMAIL` | E-mail do administrador |
| `ADMIN_PASSWORD` | Senha forte do administrador |

3. **Build Command:** `pip install -r requirements.txt`  
   **Start Command:** `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend — Vercel

1. Importe o repositório no [Vercel](https://vercel.com/) e configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

2. Adicione a variável de ambiente no painel do Vercel:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | URL da sua API no Render (ex: `https://sustentabilizar-api.onrender.com/api/v1`) |

> ⚠️ **Importante:** No Render, o `CORS_ORIGINS` deve conter o domínio Vercel exato. No Vercel, o `VITE_API_URL` deve apontar para o Render. Ambos sem barra final.

## Estrutura

```
sustentabilizar/
├── frontend/    # React SPA (Vite)
└── backend/     # API FastAPI
```