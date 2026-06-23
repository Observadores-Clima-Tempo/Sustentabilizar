# Estrutura de Pastas do Projeto — Sustentabilizar

> Decisão: **Monorepo com duas pastas principais** (`frontend/` e `backend/`)

---

## Por que Monorepo?

Com 20h/semana e um único desenvolvedor, manter tudo em um repositório reduz o overhead de:
- Gerenciar dois repositórios Git separados
- Configurar dois ambientes de CI/CD distintos
- Navegar entre projetos ao fazer uma mudança full-stack

A separação clara de pastas dentro do mesmo repo preserva a independência dos serviços sem o custo operacional de múltiplos repos.

---

## Estrutura Completa

```
sustentabilizar/
│
├── frontend/                        # Aplicação React (Vite)
│   ├── public/
│   │   └── logo.svg
│   ├── src/
│   │   ├── assets/                  # Imagens, ícones estáticos
│   │   ├── components/              # Componentes reutilizáveis (Button, Card, etc.)
│   │   │   ├── ui/                  # Componentes genéricos de interface
│   │   │   └── domain/              # Componentes com lógica de negócio (CertBadge, etc.)
│   │   ├── pages/                   # Uma pasta por rota principal
│   │   │   ├── auth/                # Login, Cadastro
│   │   │   ├── dashboard/           # Tela principal do usuário
│   │   │   ├── checklist/           # Diagnóstico inicial
│   │   │   ├── waste-records/       # Listagem e criação de registros
│   │   │   ├── evidence/            # Upload de evidências
│   │   │   └── certification/       # Visualização do certificado
│   │   ├── services/                # Funções de chamada à API (axios)
│   │   │   ├── auth.service.js
│   │   │   ├── waste.service.js
│   │   │   └── evidence.service.js
│   │   ├── hooks/                   # React hooks customizados
│   │   ├── context/                 # Context API (ex: AuthContext)
│   │   ├── utils/                   # Funções auxiliares puras
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # API FastAPI
│   ├── app/
│   │   ├── api/                     # Routers (endpoints organizados por domínio)
│   │   │   ├── v1/
│   │   │   │   ├── auth.py          # /auth/register, /auth/login
│   │   │   │   ├── users.py         # /users/me
│   │   │   │   ├── waste_records.py # /waste-records/
│   │   │   │   ├── evidence.py      # /evidence/
│   │   │   │   ├── checklist.py     # /checklist/
│   │   │   │   └── certification.py # /certification/
│   │   │   └── router.py            # Agrega todos os routers v1
│   │   ├── core/                    # Configurações centrais
│   │   │   ├── config.py            # Settings (lê .env)
│   │   │   ├── security.py          # JWT, hashing de senha
│   │   │   └── dependencies.py      # Injeções de dependência (get_db, get_current_user)
│   │   ├── db/                      # Banco de dados
│   │   │   ├── base.py              # Base declarativa do SQLAlchemy
│   │   │   └── session.py           # Engine e SessionLocal
│   │   ├── models/                  # Modelos ORM (SQLAlchemy)
│   │   │   ├── user.py
│   │   │   ├── waste_record.py
│   │   │   ├── evidence.py
│   │   │   ├── checklist.py
│   │   │   └── certification.py
│   │   ├── schemas/                 # Schemas Pydantic (request/response)
│   │   │   ├── user.py
│   │   │   ├── waste_record.py
│   │   │   ├── evidence.py
│   │   │   ├── checklist.py
│   │   │   └── certification.py
│   │   ├── services/                # Lógica de negócio (separada dos endpoints)
│   │   │   ├── certification_service.py   # Lógica de pontuação e nível
│   │   │   └── storage_service.py         # Upload e salvamento de arquivos
│   │   └── main.py                  # Entrypoint FastAPI
│   ├── alembic/                     # Migrações de banco de dados
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/                       # Testes automatizados
│   ├── .env.example
│   ├── alembic.ini
│   └── requirements.txt
│
├── docs/                            # Documentação do projeto
│   ├── MVP-SCOPE.md
│   ├── PROJECT-STRUCTURE.md
│   ├── TECH-STACK.md
│   ├── DATA-MODEL.md
│   ├── AI-DEVELOPMENT-APPROACH.md
│   └── assets/                      # Diagramas, imagens de documentação
│
├── .gitignore
├── docker-compose.yml               # Orquestração local: frontend + backend + postgres
├── README.md
└── ROADMAP.md
```

---

## Arquivo `docker-compose.yml` (estrutura planejada)

Este arquivo vai orquestrar o ambiente de desenvolvimento local com um único comando (`docker compose up`):

```yaml
# Serviços previstos:
# - db: PostgreSQL 15
# - backend: FastAPI (hot reload)
# - frontend: Vite dev server (hot reload)
```

> O Docker Compose será configurado na Semana 1 do desenvolvimento.

---

## Convenções

| Convenção | Detalhe |
|---|---|
| Nomes de arquivo JS/JSX | `camelCase` para utilitários, `PascalCase` para componentes |
| Nomes de arquivo Python | `snake_case` em todos |
| Commits | Usar prefixos: `feat:`, `fix:`, `docs:`, `refactor:` |
| Branches | `main` (estável) + `dev` (trabalho diário) + `feat/nome-da-feature` |
| Variáveis de ambiente | Nunca comitar `.env`; sempre manter `.env.example` atualizado |
