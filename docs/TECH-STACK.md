# Stack Tecnológica — Sustentabilizar

> Princípio orientador: escolher a ferramenta mais simples que resolve o problema, sem exagerar em abstrações que atrasam o aprendizado.

---

## Visão Geral

```
Browser
  └── React + Vite  ──────────────────► FastAPI  ──► PostgreSQL
        (frontend)       HTTP/JSON        (backend)     (dados)
                                            │
                                            └──► /uploads  (arquivos locais no MVP)
```

---

## Frontend

### React (já definido)
- **Por quê:** Ecossistema enorme, componentes reutilizáveis, você já tem base.
- **Versão alvo:** React 18

### Vite
- **Por quê:** Substitui o Create React App. Inicialização em < 1s, hot reload instantâneo. CRA foi descontinuado oficialmente.
- **Uso:** `npm create vite@latest frontend -- --template react`

### React Router v6
- **Por quê:** Roteamento client-side padrão do ecossistema React. A v6 tem uma API mais simples que a v5.
- **Uso:** Define as rotas `/login`, `/dashboard`, `/registros`, etc.

### Axios
- **Por quê:** Faz chamadas HTTP para o backend. Mais ergonômico que o `fetch` nativo: interceptors para JWT, tratamento de erro centralizado.
- **Alternativa descartada:** `fetch` nativo — funciona, mas você vai reescrever muito boilerplate.

### TanStack Query (React Query)
- **Por quê:** Gerencia o estado do servidor (dados que vêm da API). Faz cache, revalida automaticamente, mostra estado de loading/error. Você vai entender por que precisa disso na primeira vez que tentar sincronizar dados manualmente.
- **Uso:** `useQuery` para buscar dados, `useMutation` para criar/atualizar.

### React Hook Form + Zod
- **Por quê (Hook Form):** Formulários performáticos com validação. Muito menos re-renders que estado manual com `useState`.
- **Por quê (Zod):** Define o schema de validação em TypeScript/JS puro (ex: CPF obrigatório, e-mail válido). Integra diretamente com React Hook Form via `zodResolver`.

### Tailwind CSS
- **Por quê:** CSS utilitário — você estiliza escrevendo classes diretamente no JSX. Ideal para quem está aprendendo: você vê o resultado imediatamente sem alternar entre arquivos CSS. Muito mais rápido para prototipar que CSS módulos.
- **Alternativa descartada:** Material UI / Shadcn — mais poder, mas mais abstração. Para o prazo, Tailwind é mais direto.

---

## Backend

### FastAPI (já definido)
- **Por quê:** Framework Python moderno, usa type hints nativos do Python. Gera documentação interativa automática (Swagger em `/docs`). Excelente para aprender porque o código é explícito.
- **Versão alvo:** FastAPI 0.111+

### SQLAlchemy 2.x (ORM)
- **Por quê:** Abstrai as queries SQL em Python. A versão 2 tem uma API mais clara. Você escreve modelos Python que viram tabelas no PostgreSQL.
- **Relação com FastAPI:** FastAlchemy não existe — SQLAlchemy é o padrão de facto.

### Alembic
- **Por quê:** Gerencia migrações de banco de dados. Quando você altera um modelo SQLAlchemy, o Alembic gera e executa o SQL de atualização do schema sem perder dados. Essencial desde o início.

### Pydantic v2
- **Por quê:** Já vem com FastAPI. Define os schemas de entrada (request body) e saída (response) dos endpoints. O FastAPI usa Pydantic para validação automática e geração de docs.

### python-jose + passlib
- **Por quê (jose):** Gera e valida tokens JWT para autenticação.
- **Por quê (passlib):** Faz o hash das senhas com bcrypt. **Nunca armazenar senha em texto plano** — isso resolve o problema de forma segura e simples.

### python-multipart
- **Por quê:** Necessário para o FastAPI aceitar upload de arquivos (`multipart/form-data`). É um pacote pequeno e indispensável.

### Pillow
- **Por quê:** Processa imagens no backend — pode redimensionar ou validar formato antes de salvar. Evita armazenar arquivos corrompidos ou excessivamente grandes.

---

## Banco de Dados

### PostgreSQL 15 (já definido)
- **Por quê:** Robusto, suporte excelente a JSON (para campos flexíveis), tipo `UUID` nativo, confiabilidade em produção.
- **Local:** via Docker Compose no desenvolvimento.

### Psycopg2-binary
- **Por quê:** Driver que o SQLAlchemy usa para se conectar ao PostgreSQL. A versão `-binary` não precisa compilar nada — mais fácil de instalar.

---

## Infraestrutura de Desenvolvimento

### Docker + Docker Compose
- **Por quê:** Um arquivo `docker-compose.yml` sobe o banco, o backend e o frontend com um único comando. Elimina o "na minha máquina funciona".
- **O que não é:** Não é necessário saber Docker profundamente. Você vai copiar e entender o arquivo base na Semana 1.

### Arquivo `.env`
- **Por quê:** Separa configurações sensíveis (credenciais do banco, chave JWT) do código-fonte. Nunca vai para o Git.

---

## Armazenamento de Arquivos (Evidências)

### Desenvolvimento local: sistema de arquivos via FastAPI (`/uploads`)
- **Por quê:** O mais simples possível. Salva as imagens em uma pasta local, retorna a URL.
- **Limitação crítica:** serviços de hospedagem gratuita (como Render) usam armazenamento **efêmero** — qualquer arquivo salvo em `/uploads` é **permanentemente apagado** a cada novo deploy ou reinicialização do serviço. Não usar este mecanismo em produção.

### MVP em produção (gratuito): Supabase Storage
- **Por quê antecipar:** a limitação de armazenamento efêmero torna o `/uploads` inviável mesmo no MVP hospedado. O Supabase Storage resolve isso no tier gratuito (1 GB).
- **Como funciona:** o backend envia o arquivo via SDK Python do Supabase (`supabase-py`) em vez de salvar em disco. Retorna uma URL pública para armazenar no banco de dados.
- **Impacto no código:** pequena alteração no endpoint de upload — troca `open(path, 'wb')` pela chamada `supabase.storage.from_('bucket').upload(...)`. O restante do sistema (Pydantic, SQLAlchemy) não muda.
- **Dependência adicional:** `supabase` (SDK Python oficial).

### Fase 2: AWS S3 / Cloudflare R2
- **Por quê postergar:** Supabase Storage é suficiente para o MVP. S3/R2 fazem sentido quando houver volume real de arquivos ou necessidade de CDN global.

---

---

## Hospedagem Gratuita (MVP em Produção)

> Esta seção documenta a estratégia de deploy gratuito para o MVP. Os serviços gratuitos têm limitações reais que impactam o desenvolvimento — conhecê-las com antecedência evita surpresas.

### Stack de hospedagem recomendada

| Camada | Serviço | Tier gratuito |
|---|---|---|
| Frontend | **Vercel** | Ilimitado para projetos pessoais |
| Backend (FastAPI) | **Render.com** | 1 Web Service, 512 MB RAM |
| Banco de dados | **Supabase** | 1 projeto, 500 MB PostgreSQL |
| Arquivos (evidências) | **Supabase Storage** | 1 GB |

### Render.com — Backend FastAPI

- **Deploy:** conecta diretamente ao repositório GitHub. A cada `git push` na branch principal, faz deploy automático. Sem necessidade de configurar Docker em produção.
- **Limitação — cold start:** no tier gratuito, o serviço **hiberna após 15 minutos sem requisições**. O primeiro acesso após a hibernação leva **30–60 segundos** para responder. Para uma demonstração, avise o avaliador com antecedência e acesse o backend uma vez antes de mostrar.
- **Limitação — sem disco persistente:** arquivos salvos localmente são perdidos no restart. Por isso o Supabase Storage é obrigatório (ver seção acima).
- **Variáveis de ambiente:** as credenciais do banco e a chave JWT são configuradas no painel do Render como "Environment Variables" — nunca no código.
- **Alternativas descartadas:**
  - *Railway:* encerrou o tier gratuito permanente em 2024.
  - *Fly.io:* tier gratuito existe, mas a configuração é mais complexa (requer Dockerfile e CLI própria).
  - *Koyeb:* opção válida, mas menos documentação em português e comunidade menor.

### Supabase — Banco de Dados + Storage

- **Banco:** PostgreSQL gerenciado. A connection string é usada diretamente no SQLAlchemy (`DATABASE_URL`). Alembic continua funcionando normalmente para rodar as migrações.
- **Storage:** substitui o `/uploads` local. Buckets podem ser públicos (URL direta para imagens) ou privados (URL assinada com expiração). Para evidências de registros, bucket público é suficiente no MVP.
- **Limitação:** projetos inativos por mais de 7 dias no tier gratuito são **pausados** automaticamente. Reative pelo painel do Supabase antes de uma demonstração.
- **Alternativa de banco:** **Neon.tech** — também PostgreSQL gratuito, sem pausa automática, mas sem a funcionalidade de Storage integrado.

### Vercel — Frontend React

- **Deploy:** igual ao Render, conecta ao GitHub e faz deploy automático.
- **Variável de ambiente:** a URL do backend (ex: `https://sustentabilizar.onrender.com`) precisa ser definida como variável de ambiente no Vercel (`VITE_API_URL`). Nunca hardcodar a URL no código.
- **CORS:** o backend FastAPI precisa listar o domínio do Vercel nos origins permitidos. Configurar no FastAPI com `CORSMiddleware`.

### Fluxo de desenvolvimento vs. produção

```
Desenvolvimento local          Produção (gratuita)
─────────────────────          ───────────────────
Docker Compose                 Render.com
  └── FastAPI (local)    →       └── FastAPI (deploy via GitHub)
  └── PostgreSQL (local) →     Supabase (PostgreSQL gerenciado)
  └── /uploads (local)   →     Supabase Storage (1 GB)
Vite dev server          →     Vercel (build estático)
```

### Checklist para o primeiro deploy

- [ ] Criar conta no Supabase, criar projeto, copiar `DATABASE_URL`
- [ ] Rodar `alembic upgrade head` apontando para o banco do Supabase (uma única vez, antes do primeiro deploy)
- [ ] Criar bucket no Supabase Storage, anotar nome e chave de serviço
- [ ] Criar conta no Render, conectar repositório, configurar variáveis: `DATABASE_URL`, `SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`
- [ ] Criar conta na Vercel, conectar repositório frontend, configurar variável: `VITE_API_URL`
- [ ] Configurar `CORSMiddleware` no FastAPI com o domínio `.vercel.app`

---

## Resumo em Tabela

| Categoria | Tecnologia | Versão |
|---|---|---|
| Frontend framework | React | 18 |
| Build tool | Vite | 5 |
| Roteamento | React Router | v6 |
| HTTP client | Axios | 1.x |
| Estado servidor | TanStack Query | v5 |
| Formulários | React Hook Form | 7.x |
| Validação frontend | Zod | 3.x |
| Estilização | Tailwind CSS | 3.x |
| Backend framework | FastAPI | 0.111+ |
| ORM | SQLAlchemy | 2.x |
| Migrações | Alembic | 1.x |
| Validação backend | Pydantic | v2 |
| Autenticação | python-jose + passlib | - |
| Upload de arquivos | python-multipart + Pillow | - |
| Storage (produção) | Supabase Storage + supabase-py | - |
| Banco de dados | PostgreSQL | 15 |
| Driver PostgreSQL | psycopg2-binary | 2.x |
| Ambiente local | Docker + Docker Compose | - |
| **Hospedagem frontend** | **Vercel** | **gratuito** |
| **Hospedagem backend** | **Render.com** | **gratuito** |
| **Banco gerenciado** | **Supabase** | **gratuito** |
