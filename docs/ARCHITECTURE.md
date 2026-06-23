# Arquitetura do Sistema — Sustentabilizar

> Documento de referência técnica · MVP (30/06) e Sistema Completo (23/07+)  
> Leia junto com: [DATA-MODEL.md](DATA-MODEL.md), [TECH-STACK.md](TECH-STACK.md), [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md)

---

## 1. Estilo Arquitetural

O Sustentabilizar adota uma arquitetura **cliente-servidor em camadas**, com separação clara entre frontend, backend e banco de dados. Não é uma arquitetura de microsserviços — é um **monólito modular**: um único backend bem organizado internamente por responsabilidade, que escala com simplicidade.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                           │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                   React SPA (Vite)                           │  │
│   │  pages/ ──► components/ ──► services/ ──► (Axios + TQ)      │  │
│   └─────────────────────────┬────────────────────────────────────┘  │
└─────────────────────────────│───────────────────────────────────────┘
                              │  HTTPS  ·  JSON  ·  JWT
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVIDOR (Backend)                            │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                   FastAPI (Python)                           │  │
│   │  routers/ ──► services/ ──► models/ ──► SQLAlchemy           │  │
│   └─────────────────────────┬────────────────────────────────────┘  │
│                             │  SQL                                  │
│   ┌─────────────────────────┴───────────────┐                       │
│   │           PostgreSQL 15                 │                       │
│   └─────────────────────────────────────────┘                       │
│                                                                     │
│   ┌──────────────────────────────────────────┐                      │
│   │     /uploads  (arquivos de evidências)   │  ← MVP only         │
│   └──────────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitetura do MVP

### 2.1 Visão dos Componentes

O MVP tem três peças independentes que se comunicam via HTTP:

```
frontend/          backend/              banco/
(React)     ◄───► (FastAPI)      ◄────► (PostgreSQL)
porta 5173         porta 8000             porta 5432

         Desenvolvimento local via Docker Compose
```

Cada peça pode ser substituída ou deployada independentemente — o frontend não sabe que o backend usa Python, e o backend não sabe que o frontend usa React. Eles só falam JSON.

### 2.2 Camadas do Backend (FastAPI)

O backend é organizado em **4 camadas com responsabilidade única cada**:

```
Requisição HTTP
      │
      ▼
┌─────────────┐
│   Router    │  app/api/v1/*.py
│             │  → Recebe a requisição, valida o schema de entrada (Pydantic),
│             │    verifica autenticação (JWT), delega para o Service.
│             │  → NÃO contém lógica de negócio.
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │  app/services/*.py
│             │  → Contém TODA a lógica de negócio.
│             │  → Ex: CertificationService decide se o usuário é Bronze/Prata/Ouro.
│             │  → NÃO faz queries SQL diretamente — usa os Models.
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Model     │  app/models/*.py  (SQLAlchemy ORM)
│             │  → Representa as tabelas do banco como classes Python.
│             │  → Faz as queries SQL via SQLAlchemy Session.
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │
└─────────────┘
```

**Por que esta separação importa?**  
Se amanhã a lógica de certificação mudar, você altera apenas `certification_service.py`. O router, o model e o banco não precisam saber que a regra mudou.

### 2.3 Camadas do Frontend (React)

```
Usuário interage com a tela
          │
          ▼
┌─────────────────┐
│     Page        │  src/pages/*/index.jsx
│                 │  → Orquestra os componentes de uma tela completa.
│                 │  → Chama hooks (useQuery/useMutation) para dados.
└────────┬────────┘
         │
    ┌────┴──────────────────┐
    │                       │
    ▼                       ▼
┌──────────┐         ┌──────────────┐
│Component │         │   Service    │  src/services/*.js
│          │         │              │  → Funções que chamam a API via Axios.
│ Apresenta│         │ Ex:          │  → Não têm estado, só fazem HTTP.
│ os dados │         │ createWaste  │
│ recebidos│         │ Record(data) │
└──────────┘         └──────┬───────┘
                            │  Axios → JWT no header
                            ▼
                      FastAPI Backend
```

**O que o Context API resolve:**  
O `AuthContext` guarda o token JWT e os dados do usuário logado. Qualquer componente da árvore pode ler `useAuth()` sem precisar receber o token como prop.

### 2.4 Fluxo Completo de uma Requisição Autenticada

Exemplo: usuário cria um novo registro de resíduo.

```
1. Usuário preenche o formulário e clica em "Salvar"
         │
         ▼
2. React Hook Form valida os dados localmente (Zod schema)
         │
         ▼
3. useMutation chama wasteService.createRecord(data)
         │
         ▼
4. Axios envia POST /api/v1/waste-records
   Header: Authorization: Bearer <token_jwt>
   Body:   { waste_type, weight_kg, collection_date, ... }
         │
         ▼
5. FastAPI recebe a requisição
   → Middleware de CORS verifica a origem
   → Dependência get_current_user decodifica o JWT, busca o usuário no banco
   → Router valida o body com o schema Pydantic WasteRecordCreate
         │
         ▼
6. Router delega para waste_record_service.create(db, user_id, data)
         │
         ▼
7. Service cria o objeto WasteRecord, salva no banco via SQLAlchemy
   → Após salvar, chama certification_service.recalculate(db, user_id)
   → certification_service atualiza o nível do usuário
         │
         ▼
8. FastAPI retorna HTTP 201 com o registro criado (schema WasteRecordOut)
         │
         ▼
9. TanStack Query recebe o sucesso, invalida o cache de waste-records
   → useQuery que lista os registros recarrega automaticamente
         │
         ▼
10. A tela atualiza com o novo registro visível
```

### 2.5 Autenticação JWT

O sistema usa **JWT (JSON Web Token) sem estado** — o backend não guarda sessões em memória nem no banco.

```
LOGIN:
  1. POST /auth/login  { email, password }
  2. Backend verifica senha com bcrypt
  3. Backend gera token JWT assinado com SECRET_KEY (válido por 7 dias)
  4. Frontend salva o token em localStorage
  5. Todo request subsequente inclui o token no header Authorization
  6. Se user.is_admin == true: frontend redireciona para /admin

VALIDAÇÃO (em cada request protegido):
  1. FastAPI extrai o token do header
  2. python-jose decodifica e verifica a assinatura com SECRET_KEY
  3. Extrai o user_id do payload do token
  4. Busca o usuário no banco para confirmar que ainda existe e está ativo
  5. Injeta o usuário como dependência no router

LOGOUT:
  1. Frontend remove o token do localStorage
  2. Sem chamada ao backend (tokens JWT são stateless)
```

**Segurança aplicada:**
- Senhas nunca armazenadas em texto plano — apenas o hash bcrypt
- `SECRET_KEY` nunca comitada no repositório — lida do `.env`
- Token tem expiração (`exp` claim) — não dura para sempre
- HTTPS obrigatório em produção — impede interceptação do token

---

### 2.6 Autenticação e Autorização do Admin

O sistema tem dois níveis de acesso:

```
TODO REQUEST
     │
     ▼
 get_current_user(token)     → HTTP 401 se token ausente/inválido
     │
     ▼
 [rotas normais]              → qualquer usuário autenticado
     │
 get_current_admin(user)     → HTTP 403 se user.is_admin == False
     │
     ▼
 [rotas /admin/**]            → apenas admins
```

**Como o primeiro admin é criado (bootstrap):**

Na inicialização do FastAPI (`startup` event), o sistema verifica se existe algum usuário com `is_admin=True`. Se não existir, e se as variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` estiverem definidas no `.env`, um usuário admin é criado automaticamente.

```python
# Comportamento do startup event:
if not any_admin_exists(db):
    if settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD:
        create_admin_user(db, email=settings.ADMIN_EMAIL,
                              password=settings.ADMIN_PASSWORD)
# Idempotente: não cria duplicatas se admin já existe
```

**Variáveis de ambiente para bootstrap:**
```env
ADMIN_EMAIL=admin@sustentabilizar.app
ADMIN_PASSWORD=senha_forte_aqui
```

**Segurança desta abordagem:**
- As variáveis ficam apenas no `.env` local (já no `.gitignore`) — nunca comitadas.
- A senha é hasheada com bcrypt antes de salvar — nunca armazenada em texto plano.
- Após a primeira execução, `ADMIN_PASSWORD` pode ser removida do `.env` (o admin já existe no banco).
- O endpoint `POST /auth/register` nunca aceita `is_admin=True` como campo — blindado no schema.
- Em produção: usar um `ADMIN_PASSWORD` forte e removê-lo do `.env` após o primeiro deploy.

> **Por que `.env` + startup e não um CLI separado?**  
> Um CLI exige passo manual, que falha em ambientes containerizados com zero-touch deploy. A abordagem de startup event é idêmpotente, compatível com Docker Compose e não requer intervenção manual. É o padrão usado por sistemas como Gitea, Outline e Grafana.

---

### 2.7 Sistema de Configuração de Pontuação

Todos os parâmetros que afetam pontuação e certificação são armazenados no banco e configuráveis pelo admin. Nenhum valor está hardcoded no código.

```
TABELAS DE CONFIGURAÇÃO
──────────────────────────────
 scoring_config           (1 linha — parâmetros globais)
   points_per_record_30d = 5
   points_per_evidence   = 2
   points_per_unique_type = 3

 certification_thresholds (3 linhas — uma por nível)
   bronze: min_score = 30
   prata:  min_score = 70
   ouro:   min_score = 120

 waste_type_scoring       (8 linhas — uma por tipo de resíduo)
   eletronico: points_per_kg = 5.0
   perigoso:   points_per_kg = 4.0
   vidro:      points_per_kg = 2.0
   ...

FLUXO DE LEITURA:
  certification_service.recalculate(db, user_id)
    │
    ├─ db.query(ScoringConfig).first()          → parâmetros flat
    ├─ db.query(WasteTypeScoring).all()          → pts/kg por tipo
    ├─ db.query(CertificationThreshold).all()   → limiares de nível
    │
    └─ Calcula score_from_records + score_from_checklist
       → determina nível e salva em certifications
```

**Endpoint público (sem autent):**  
`GET /api/v1/config/public` → retorna apenas `certification_thresholds` para uso na landing page.

---

### 2.6 Upload de Evidências (MVP)

```
Frontend                   Backend                    Disco
   │                          │                         │
   │  POST /evidence/upload   │                         │
   │  multipart/form-data     │                         │
   │  [arquivo + record_id]   │                         │
   ├─────────────────────────►│                         │
   │                          │ Pillow valida formato   │
   │                          │ e redimensiona se > 2MB │
   │                          │                         │
   │                          │ Gera UUID como filename  │
   │                          ├────────────────────────►│
   │                          │  salva em /uploads/     │
   │                          │                         │
   │                          │ Salva registro no banco  │
   │                          │ { file_path, file_url,  │
   │                          │   waste_record_id, ... } │
   │◄─────────────────────────┤                         │
   │  { id, file_url, ... }   │                         │
```

> **Limitação do MVP:** os arquivos ficam no disco do servidor. Em produção real, serão migrados para object storage (S3/R2). O código do `storage_service.py` isola essa lógica para que a troca seja cirúrgica.

---

## 3. Arquitetura do Sistema Completo (Fase 2+)

### 3.1 Novos Componentes na Fase 2

```
┌────────────────────────────────────────────────────────────────────┐
│                        FASE 2 — Adições                            │
│                                                                     │
│  ┌────────────────┐                  ┌────────────────┐  │
│  │ Object Storage │                  │ Email Service  │  │
│  │ (S3 / R2)      │                  │ (SMTP simples) │  │
│  │                │                  │                │  │
│  │ Evidências e   │                  │ Notificações   │  │
│  │ documentos     │                  │ de certificação│  │
│  │ (MTR, NF)      │                  │                │  │
│  └────────────────┘                  └────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

> **Nota:** O Admin Panel foi movido para o MVP (Etapa 3.5). A Fase 2 adiciona Object Storage (troca `storage_service.py`) e Email Service.

### 3.2 Evolução do Modelo de Dados para o Sistema Completo

```
MVP                           SISTEMA COMPLETO
─────────────────────────     ──────────────────────────────────────
users                    ──►  users  +  organizations
                              (PF, PJ, cooperativas, auditores, eventos)

waste_records            ──►  waste_records  +  waste_flows
                              (Gerador → Transporte → Destinação)

evidences (só imagens)   ──►  evidences  +  documents
                              (MTR, Notas Fiscais, Comprovantes)

certifications           ──►  certifications  +  audit_logs
                              (histórico de revisões por auditores)

[não existe]             ──►  social_credits  +  credit_transactions
                              (Moeda Social)

[não existe]             ──►  reports  +  report_templates
                              (Relatórios técnicos, alinhamento ODS)
```

### 3.3 Módulo de Rastreabilidade (Fase 2)

O fluxo de rastreabilidade introduz um novo conceito: **múltiplos atores participam do ciclo de vida de um resíduo**.

```
waste_flow
─────────────────────────────────────────────────────────────
gerador_id  ──► [waste_record]  ──► waste_flow_id
                                          │
                             ┌────────────┴──────────────┐
                             │                           │
                     transporter_id              destination_id
                     (user: cooperativa)         (user: empresa)
                             │                           │
                     transport_date              destination_date
                     vehicle_plate               destination_type
                     evidence_id (foto)          document_id (MTR)
```

A tela de "linha do tempo" do resíduo percorre esse fluxo da esquerda para a direita, mostrando cada etapa com sua evidência.

### 3.4 Perfis de Usuário no Sistema Completo

```
users.profile_type
──────────────────────────────────────────────────────────
pessoa_fisica     → Cadastro básico, registra resíduos domésticos
pessoa_juridica   → Campos adicionais (CNPJ, CNAE, responsável técnico)
cooperativa       → Atua como transportador/destinatário no waste_flow
auditor           → Pode revisar e aprovar/rejeitar evidências
orgao_publico     → Acesso ao painel consolidado (relatórios da cidade)
evento            → Cadastro temporário com data de início/fim
```

Cada perfil terá seu próprio checklist adaptado (o campo `profile_type` em `checklist_items` já está preparado para isso).

### 3.5 Infraestrutura de Produção (Sistema Completo)

```
                           ┌─────────────────────┐
                           │    Cloudflare CDN   │
                           │  (cache + HTTPS)    │
                           └──────────┬──────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
               ▼                      ▼                      ▼
       ┌──────────────┐     ┌──────────────────┐    ┌──────────────┐
       │   Vercel     │     │   Render / VPS   │    │  Supabase /  │
       │  (Frontend)  │     │   (Backend)      │    │  Neon        │
       │              │     │                  │    │  (PostgreSQL)│
       │  React SPA   │     │  FastAPI         │    │              │
       │  Build est.  │     │  Uvicorn         │    │  Managed DB  │
       └──────────────┘     └─────────┬────────┘    └──────────────┘
                                      │
                            ┌─────────┴──────────┐
                            │   Object Storage   │
                            │  Cloudflare R2     │
                            │  (evidências,      │
                            │   documentos)      │
                            └────────────────────┘
```

**Custo estimado inicial (Fase 2, baixo tráfego):**
- Vercel: gratuito (hobby tier)
- Render: ~$7/mês (tier mínimo com persistência)
- Neon (PostgreSQL serverless): gratuito até 0.5GB
- Cloudflare R2: gratuito até 10GB de storage

---

## 4. Decisões Arquiteturais e Justificativas

Esta seção registra o **porquê** de cada escolha estrutural relevante. Serve como referência quando você questionar "por que fizemos assim?".

### ADR-01: Separar lógica de negócio em `services/`

**Decisão:** A pasta `app/services/` existe separada dos routers.  
**Motivo:** Routers com regras de negócio embutidas crescem e ficam impossíveis de testar e entender. Um `certification_service.py` puro (sem dependência do HTTP) pode ser testado com um simples `pytest` sem subir o servidor. É o padrão mais importante para manter o backend sustentável.

### ADR-02: Não usar repositório pattern no MVP

**Decisão:** Os services acessam o banco diretamente via SQLAlchemy Session, sem uma camada `repository/`.  
**Motivo:** O padrão Repository adiciona uma abstração útil em sistemas grandes (facilita troca de banco, facilita mock em testes). No MVP, com um único banco e prazo curto, seria over-engineering. A Session do SQLAlchemy já é testável via fixtures do pytest.

### ADR-03: Context API em vez de Redux/Zustand

**Decisão:** Estado global gerenciado com React Context API.  
**Motivo:** O único estado global real da aplicação é "quem está logado". TanStack Query gerencia o estado do servidor (dados da API). Redux ou Zustand seriam sobredimensionados — adicionam boilerplate sem benefício para este escopo.

### ADR-04: Armazenamento de arquivos no disco no MVP

**Decisão:** Evidências salvas em `/uploads` no servidor, não em cloud storage.  
**Motivo:** Integrar S3/R2 no MVP adiciona gerenciamento de credenciais cloud, permissões IAM e complexidade de configuração. O `storage_service.py` encapsula essa lógica — na Fase 2, só este arquivo muda, sem impacto no resto do sistema.

### ADR-05: Versionamento de API com `/api/v1/`

**Decisão:** Todos os endpoints são prefixados com `/api/v1/`.  
**Motivo:** Quando (não "se") a API precisar de mudanças breaking (ex: mudar o formato de resposta da certificação), uma `/api/v2/` pode coexistir. Sem versionamento desde o início, essa migração é cirurgia sem anestesia.

### ADR-06: UUID como primary key em vez de integer autoincrement

**Decisão:** Todas as PKs são `UUID`.  
**Motivo:** IDs sequenciais (`id=1`, `id=2`, ...) são previsíveis — facilitam enumeration attacks (tentar `/users/1`, `/users/2`). UUIDs eliminam esse risco. PostgreSQL tem suporte nativo eficiente para `UUID`.

---

## 5. Segurança: Superfície de Ataque do MVP

Mapeamento dos principais vetores e como são mitigados:

| Vetor | Risco | Mitigação |
|---|---|---|
| Senhas no banco | Roubo de dados expõe senhas | bcrypt hash (passlib) — irreversível |
| JWT interceptado | Acesso não autorizado | HTTPS obrigatório em produção; expiração do token |
| Injeção SQL | Leitura/escrita arbitrária no banco | SQLAlchemy ORM — queries parametrizadas por padrão |
| Upload de arquivo malicioso | Execução de código no servidor | Pillow valida que o arquivo é uma imagem real antes de salvar |
| Acesso a dados de outros usuários | IDOR (Insecure Direct Object Reference) | Todos os endpoints filtram por `user_id = current_user.id` |
| Credenciais no repositório | Vazamento de secrets | `.env` no `.gitignore`; `.env.example` sem valores reais |
| CORS aberto | Requisições de qualquer origem | `CORSMiddleware` configurado apenas para o domínio do frontend |
| Escalação de privilégios | Usuário comum acessar rotas admin | `get_current_admin` dependency retorna HTTP 403; `is_admin` não aceito em `/register` |
| Bootstrap de admin | `ADMIN_PASSWORD` no `.env` | Hash bcrypt antes de salvar; variável removida após primeiro deploy em produção |

---

## 6. Contratos de API — Endpoints do MVP

Lista dos endpoints planejados, organizados por domínio:

### Autenticação
```
POST   /api/v1/auth/register     Cadastra novo usuário
POST   /api/v1/auth/login        Retorna token JWT
```

### Usuário
```
GET    /api/v1/users/me          Dados do usuário logado
PATCH  /api/v1/users/me          Atualiza perfil
```

### Registros de Resíduos
```
POST   /api/v1/waste-records/         Cria novo registro
GET    /api/v1/waste-records/         Lista registros do usuário (paginado)
GET    /api/v1/waste-records/{id}     Detalhes de um registro
DELETE /api/v1/waste-records/{id}     Remove um registro
```

### Evidências
```
POST   /api/v1/evidence/upload        Upload de imagem vinculada a um registro
GET    /api/v1/evidence/{id}          Metadados de uma evidência
DELETE /api/v1/evidence/{id}          Remove uma evidência
```

### Checklist
```
GET    /api/v1/checklist/             Lista perguntas do diagnóstico
POST   /api/v1/checklist/responses    Submete respostas do usuário
GET    /api/v1/checklist/my-score     Pontuação do checklist do usuário
```

### Certificação
```
GET    /api/v1/certification/me       Nível e pontuação atual do usuário
GET    /api/v1/certification/history  Histórico de certificações anteriores
```

### Configuração Pública (sem autenticação)
```
GET    /api/v1/config/public          Thresholds de certificação (para landing page)
```

### Admin — Diagnóstico (requer `is_admin`)
```
GET    /api/v1/admin/checklist           Lista todas as perguntas (incluindo inativas)
POST   /api/v1/admin/checklist           Cria nova pergunta
PUT    /api/v1/admin/checklist/{id}      Atualiza pergunta (texto, opções, pontuação, ordem)
DELETE /api/v1/admin/checklist/{id}      Soft-delete (is_active=False)
```

### Admin — Pontuação Global (requer `is_admin`)
```
GET    /api/v1/admin/scoring-config      Parâmetros flat (pts/registro, pts/evidência, pts/tipo)
PUT    /api/v1/admin/scoring-config      Atualiza parâmetros flat
```

### Admin — Certificação (requer `is_admin`)
```
GET    /api/v1/admin/certification-config   Limiares por nível (bronze/prata/ouro)
PUT    /api/v1/admin/certification-config   Atualiza limiares
```

### Admin — Pontuação por Tipo de Resíduo (requer `is_admin`)
```
GET    /api/v1/admin/waste-scoring      Pts/kg por tipo
PUT    /api/v1/admin/waste-scoring      Atualiza pts/kg (bulk)
```

---

## 7. Ambiente de Desenvolvimento vs. Produção

| Aspecto | Desenvolvimento (local) | Produção (MVP) |
|---|---|---|
| Banco de dados | Docker Compose (PostgreSQL local) | Neon / Render PostgreSQL |
| Backend | `uvicorn --reload` (hot reload) | Uvicorn sem `--reload`, com workers |
| Frontend | `vite dev` (HMR) | Build estático servido pelo Vercel |
| Arquivos | `/uploads` local | `/uploads` no servidor Render |
| HTTPS | HTTP (localhost) | HTTPS obrigatório (certificado automático) |
| CORS | Permite `localhost:5173` | Permite apenas o domínio do frontend |
| SECRET_KEY | Valor simples no `.env` local | Gerado com `openssl rand -hex 32` |
| DEBUG | `True` (stack traces visíveis) | `False` (erros genéricos para o cliente) |
