# ROADMAP — Sustentabilizar

> Início: 21/06/2026 · MVP: 25/07/2026 · Versão apresentável: 09/08/2026  
> Disponibilidade: ~20h/semana · Stack: React + FastAPI + PostgreSQL  
> Referência de UI: `screenshots/UI-REFERENCE.md` + screenshots do protótipo aprovado

---

## Fase 1 — MVP (21/06 → 25/07)

### ✅ Etapa 1 · Fundação + Landing Page — CONCLUÍDA (21/06/2026)
**Objetivo:** Projeto rodando localmente. Primeira tela pública visível no browser.  
**Semana:** 21–27/jun

#### Infra
| Tarefa | Status |
|---|---|
| Criar estrutura de pastas (monorepo) | ✅ `frontend/` e `backend/` criados |
| Criar `.gitignore` | ✅ node_modules, .env, __pycache__, uploads/ ignorados |
| Configurar Docker Compose (PostgreSQL + backend + frontend) | ✅ `docker compose up` sobe os 3 serviços |
| Criar `.env.example` para backend e frontend | ✅ Documentados; `.env` nunca comitado |

#### Backend
| Tarefa | Status |
|---|---|
| Inicializar projeto FastAPI com estrutura de routers `/api/v1/` | ✅ `app/api/router.py` central; `/docs` disponível |
| Configurar CORS middleware no FastAPI | ✅ `localhost:5173` permitido |
| Configurar Alembic para migrações | ✅ `alembic upgrade head` cria tabela `users` |
| Criar modelo SQLAlchemy `User` + Pydantic schemas (`UserCreate`, `UserOut`) + migration | ✅ Todas as colunas do DATA-MODEL.md presentes |
| Configurar variáveis de ambiente (`.env`) | ✅ `DATABASE_URL`, `SECRET_KEY`, etc. via pydantic-settings |

#### Frontend — Setup
| Tarefa | Status |
|---|---|
| Inicializar projeto Vite + React | ✅ Build sem erros; porta 5173 |
| Instalar dependências: React Router v6, Axios, TanStack Query, React Hook Form, Zod, Tailwind CSS | ✅ `npm install` limpo |
| Configurar QueryClient provider (TanStack Query) | ✅ `<QueryClientProvider>` em `main.jsx` |
| Definir sistema de cores no Tailwind | ✅ Paleta Inter + verde primário conforme UI-DESIGN.md |
| Criar componentes base: `Button`, `Card`, `Input`, `Badge`, `ProgressBar` | ✅ Em `src/components/ui/` |

#### Frontend — Landing Page (`/`)
| Tarefa | Status |
|---|---|
| Header: logo + link "Entrar" + botão "Começar" | ✅ Links para `/login` e `/register` |
| Seção Hero: tagline, descrição, CTAs | ✅ Layout responsivo centralizado |
| Seção "Como funciona": 4 passos | ✅ Grid desktop / coluna mobile |
| Seção "Níveis de certificação": 3 cards (Bronze, Prata, Ouro) | ✅ Pontuação mínima e critérios |
| Rodapé CTA: fundo verde escuro + botão | ✅ `bg-green-900` consistente com protótipo |

**Entregável:** ✅ Ambiente 100% funcional. FastAPI importa sem erros. Landing page visível e clicável. `npm run build` limpo.

---

### ✅ Etapa 2 · Autenticação — CONCLUÍDA (21/06/2026)
**Objetivo:** Usuário consegue se cadastrar e fazer login. Token JWT funcionando.  
**Semana:** 28/jun–04/jul

#### Backend
| Tarefa | Status |
|---|---|
| Implementar `core/security.py` (bcrypt hash + JWT geração/validação) | ✅ `hash_password`, `verify_password`, `create_access_token`/`create_token`, `decode_access_token`/`decode_token` |
| Implementar dependência `get_current_user` em `core/dependencies.py` | ✅ Rotas protegidas rejeitam requests sem token válido com HTTP 401 |
| Endpoint `POST /api/v1/auth/register` | ✅ Retorna `UserOut`; CPF e e-mail únicos; conflito retorna 409 |
| Endpoint `POST /api/v1/auth/login` | ✅ Retorna token JWT com expiração de 7 dias |
| Endpoint `GET /api/v1/users/me` (protegido) | ✅ Retorna dados do usuário logado (sem senha) |

#### Frontend — Serviços e Estado
| Tarefa | Status |
|---|---|
| Implementar `auth.service.js` (`login`, `register`, `getMe`) | ✅ Funções chamam a API via Axios; sem lógica de estado |
| Configurar Axios interceptor para injetar JWT no header `Authorization` | ✅ `src/lib/axios.js` — todos os requests autenticados incluem `Bearer <token>` |
| `AuthContext` + `useAuth()` hook | ✅ Token salvo em localStorage; usuário persiste entre reloads; logout limpa o estado |
| Rotas privadas: redirect para `/login` sem token | ✅ `PrivateRoute` — `/dashboard` sem token redireciona corretamente |

#### Frontend — Telas de Auth
| Tarefa | Status |
|---|---|
| Tela `/register` — "Crie sua conta" | ✅ Campos: Nome, E-mail, CPF (máscara), Cidade, Estado (27 UFs), Senha, Confirmar senha; validação Zod; redireciona para `/checklist` |
| Tela `/login` | ✅ Campos: E-mail + Senha; erros inline; redireciona para `/dashboard` |

**Entregável:** ✅ Fluxo completo de auth. Usuário cadastra com CPF → redirecionado ao checklist → ou faz login → acessa o dashboard.

---

### ✅ Etapa 3 · Dashboard Shell + Registros de Resíduos + Evidências — CONCLUÍDA (21/06/2026)
**Objetivo:** Shell do dashboard navegável. Core operacional — usuário registra o que descarta e anexa prova.  
**Semana:** 05–11/jul

#### Backend — Resíduos
| Tarefa | Critério de conclusão |
|---|---|
| Modelo SQLAlchemy `WasteRecord` + Pydantic schemas (`WasteRecordCreate`, `WasteRecordOut`) + migration | ✅ Tabela `waste_records` criada com todas as colunas do DATA-MODEL.md |
| Endpoints: `POST /api/v1/waste-records`, `GET /api/v1/waste-records` (lista do usuário), `GET /api/v1/waste-records/:id` | ✅ Apenas registros do usuário autenticado; ordenados por `collection_date` desc |
| Recálculo automático da certificação após salvar registro | ✅ `certification_service.recalculate(db, user_id)` chamado ao final de cada `POST` (stub; lógica completa na Etapa 4) |

#### Backend — Evidências
| Tarefa | Critério de conclusão |
|---|---|
| Modelo SQLAlchemy `Evidence` + Pydantic schemas (`EvidenceOut`) + migration | ✅ Tabela `evidences` criada com todas as colunas do DATA-MODEL.md |
| Implementar `storage_service.py` (salvar arquivo em `/uploads` com UUID como nome) | ✅ Lógica de I/O isolada; valida imagem com Pillow; troca por object storage na Fase 2 sem alterar o router |
| Endpoint `POST /api/v1/evidence/upload` | ✅ Valida formato (jpeg/png) e tamanho (máx 10 MB) via Pillow; salva em `/uploads`; retorna URL |

#### Frontend — Serviços
| Tarefa | Critério de conclusão |
|---|---|
| Implementar `waste.service.js` (`createRecord`, `listRecords`, `getRecord`) | ✅ Funções chamam a API via Axios |
| Implementar `evidence.service.js` (`uploadEvidence(file, recordId)`) | ✅ Envia `multipart/form-data`; retorna URL da imagem salva |

#### Frontend — Shell do Dashboard
| Tarefa | Critério de conclusão |
|---|---|
| Layout do Dashboard: sidebar fixa à esquerda + área de conteúdo | ✅ `DashboardLayout` envolve todas as rotas autenticadas via `<Outlet />` |
| Sidebar: logo "Sustentabilizar", itens de navegação (Início, Registros, Novo, Certificado, Perfil) com ícones, botão "Sair" na base | ✅ Item ativo destacado com fundo verde claro; logout chama `signOut()` + navega para `/` |
| Roteamento interno: `/dashboard`, `/registros`, `/registros/:id`, `/novo`, `/evidencia/:recordId`, `/certificado`, `/perfil` | ✅ Navegação entre todas as páginas funciona sem reload |

#### Frontend — Telas do Dashboard (Resíduos)
| Tarefa | Critério de conclusão |
|---|---|
| `/dashboard` — Início (placeholder): saudação "Olá, [Nome]! 👋" + data atual + mensagem de boas-vindas | ✅ Tela funcional; será completada com dados reais na Etapa 4 |
| `/novo` — Novo Registro: seletor visual de tipo (grid 4×2 com ícone + label); campos Peso + Volume em linha; select Frequência + date picker Data; textarea Observações; botões "Cancelar" e "Salvar e adicionar evidência →" | ✅ `useMutation` salva e redireciona para `/evidencia/:id` |
| `/evidencia/:recordId` — Upload de Evidência: info box com timestamp; dropzone (clique ou arraste); link "Pular por agora" | ✅ Upload envia para o backend; ao concluir redireciona para `/registros/:id` |
| `/registros` — Meus Registros: título + contagem total; tabs de filtro por tipo; botão "Novo" no topo direito; lista de cards com badge de evidência | ✅ Lista carregada via `useQuery`; filtro ativo altera a lista sem reload |
| `/registros/:id` — Registro Individual: breadcrumb; header com ícone + tipo + data; seção "Detalhes"; seção "Evidências (N)" com thumbnails + botão "+ Adicionar" | ✅ Dados carregados via `useQuery`; botão Adicionar navega para `/evidencia/:id` |

**Entregável:** ✅ Dashboard navegável. Usuário cria registro → faz upload de evidência → visualiza no histórico.

---

### ✅ Etapa 3.5 · Painel Administrativo — CONCLUÍDA (23/06/2026)
**Objetivo:** Admin configura o sistema antes da Etapa 4. Pré-requisito para implementar checklist e certificação com valores dinâmicos.
**Semana:** 28/jun–11/jul (paralelo ou imediatamente antes da Etapa 4)

#### Backend — Fundação Admin
| Tarefa | Critério de conclusão |
|---|---|
| Adicionar campo `is_admin: Boolean, default=False` ao modelo `User` + schema `UserOut` | ✅ Campo presente na migration e exposto no response de `/users/me` |
| Criar modelos SQLAlchemy `ScoringConfig`, `CertificationThreshold`, `WasteTypeScoring`, `ChecklistItem` | ✅ Tabelas mapeadas conforme DATA-MODEL.md |
| Criar schemas Pydantic para admin em `schemas/admin.py`: checklist CRUD, scoring config, certification config, waste scoring | ✅ Todos os schemas com validações (ex: `min_score(bronze) < min_score(prata)`) |
| Migration `0003_add_admin_config_tables.py` | ✅ `ALTER TABLE users ADD COLUMN is_admin`; criação das 4 tabelas de config; seed com valores padrão (30/70/120 pts, 8 tipos de resíduo, 6 perguntas checklist) |
| Criar dependência `get_current_admin` em `core/dependencies.py` | ✅ Retorna HTTP 403 se `user.is_admin == False` |
| Startup event: criar admin via `ADMIN_EMAIL` + `ADMIN_PASSWORD` do `.env` se nenhum admin existir | ✅ Idempotente (não cria duplicata); senha hasheada com bcrypt antes de salvar |
| Adicionar `ADMIN_EMAIL` e `ADMIN_PASSWORD` ao `.env` e `.env.example` | ✅ admin@sustentabilizar.com / sustentabilizaruenf@dmin123 |

#### Backend — Endpoints Admin (todos requerem `is_admin`)
| Tarefa | Critério de conclusão |
|---|---|
| `GET / POST /api/v1/admin/checklist` | ✅ Lista todas as perguntas (incluindo inativas) / cria nova pergunta |
| `PUT / DELETE /api/v1/admin/checklist/{id}` | ✅ Atualiza pergunta (texto, opções com pontos por alternativa, ordem, is_active) / soft-delete |
| `GET / PUT /api/v1/admin/scoring-config` | ✅ Lê e atualiza parâmetros flat (pts/registro_30d, pts/evidência, pts/tipo_distinto) |
| `GET / PUT /api/v1/admin/certification-config` | ✅ Lê e atualiza limiares de nível (bronze/prata/ouro); valida ordenação crescente |
| `GET / PUT /api/v1/admin/waste-scoring` | ✅ Lê e atualiza pts/kg por tipo de resíduo (bulk update dos 8 tipos) |
| `GET /api/v1/config/public` | ✅ Endpoint **público** (sem auth); retorna `certification_thresholds` para uso na landing page |

#### Backend — Integração e Atualização de Serviço
| Tarefa | Critério de conclusão |
|---|---|
| Incluir `admin_router` + rota `/api/v1/config/public` em `app/api/router.py` | ✅ Todos os endpoints acessíveis e documentados no `/docs` |
| Atualizar `certification_service.py`: ler thresholds e scoring config do banco | ✅ `recalculate()` lê `ScoringConfig`, `CertificationThreshold` e `WasteTypeScoring` (sem constantes hardcoded) |

#### Frontend — Autenticação Admin
| Tarefa | Critério de conclusão |
|---|---|
| Atualizar `AuthContext.jsx`: expor `isAdmin` derivado de `user.is_admin` | ✅ `useAuth()` retorna `{ user, isAdmin, signIn, signOut }` |
| Após login bem-sucedido: redirecionar para `/admin` se `isAdmin == true`, senão `/dashboard` | ✅ Fluxo de redirecionamento implementado nos dois caminhos |
| Criar `AdminRoute.jsx` | ✅ Sem token → `/login`; token válido mas `!isAdmin` → `/dashboard` |

#### Frontend — Painel Admin (4 páginas)
| Tarefa | Critério de conclusão |
|---|---|
| Criar `AdminLayout.jsx`: sidebar com Diagnóstico, Pontuação, Certificação, Resíduos + botão Sair | ✅ Item ativo destacado; layout separado do `DashboardLayout` do usuário |
| Criar `admin.service.js` com todas as funções de chamada à API admin | ✅ Funções para checklist CRUD, scoring config, certification config, waste scoring |
| `/admin/checklist` — Tabela de perguntas + modal criar/editar | ✅ Tabela: texto, tipo, pontos_max, ordem, ativo. Modal: editor de alternativas (label + pontos), tipo de resposta, ordem, is_active toggle. Botão deletar com confirmação. |
| `/admin/pontuacao` — Configuração de pontuação flat | ✅ 3 campos: pts/registro_30d, pts/evidência, pts/tipo_distinto. Botão "Salvar". |
| `/admin/certificacao` — Limiares de nível | ✅ 3 campos numéricos (Bronze min, Prata min, Ouro min). Validação: bronze < prata < ouro. Botão "Salvar". |
| `/admin/residuos` — Pontuação por tipo de resíduo | ✅ Tabela com 8 linhas fixas + campo pts/kg editável por linha. Botão "Salvar alterações" (bulk). |
| Rotas `/admin/**` em `App.jsx` com `<AdminRoute>` + `<AdminLayout>` | ✅ Index `/admin` redireciona para `/admin/checklist` |

#### Frontend — Landing Page dinâmica
| Tarefa | Critério de conclusão |
|---|---|
| Seção "Níveis de certificação" na landing page: carregar thresholds via `GET /api/v1/config/public` | ✅ Valores exibidos refletem o banco; fallback para valores padrão (30/70/120) se API falhar |

**Entregável:** ✅ Admin faz login → acessa painel → configura perguntas do diagnóstico com pontuação por alternativa → define limiares Bronze/Prata/Ouro → ajusta pts/kg por tipo de resíduo → ajusta parâmetros flat de pontuação. Landing page exibe valores atuais lidos da API. Credenciais: admin@sustentabilizar.com / sustentabilizaruenf@dmin123

---

### ✅ Etapa 4 · Checklist + Certificação + Dashboard Completo — CONCLUÍDA (23/06/2026)
**Objetivo:** Diagnóstico onboarding, certificação automática e dashboard Início/Certificado/Perfil finalizados.  
**Semana:** 12–18/jul

> ✅ **Pré-requisito resolvido (Etapa 3.5):** Os critérios de pontuação são configuráveis pelo admin. Os valores padrão estão no seed da migration `0003`. A pesquisadora pode ajustá-los via painel sem redeploy.

#### Backend — Checklist
| Tarefa | Critério de conclusão |
|---|---|
| Modelos SQLAlchemy `ChecklistItem` + `ChecklistResponse` + Pydantic schemas + migration | ✅ `ChecklistResponse` criado em `models/checklist_response.py`; migration `0004_checklist_certs` executada |
| Modelo SQLAlchemy `Certification` + Pydantic schema (`CertificationOut`) + migration | ✅ `Certification` criado em `models/certification.py`; migration `0004_checklist_certs` executada |
| Endpoint `GET /api/v1/checklist` | ✅ Retorna 7 perguntas ativas ordenadas por `order` para `pessoa_fisica` |
| Endpoint `POST /api/v1/checklist/responses` | ✅ Salva respostas; calcula `points_earned` lendo `options[answer_value].points`; dispara recálculo de certificação |
| Implementar `certification_service.py` (lógica completa) | ✅ `recalculate()` calcula checklist + records; persiste `Certification` via upsert; `get_certification_out()` retorna dados completos com critérios |
| Endpoint `GET /api/v1/certification/me` | ✅ Retorna nível, pontuação total, composição (checklist + registros), critérios e thresholds |
| Endpoint `PUT /api/v1/users/me` (protegido) | ✅ Permite editar nome, cidade e estado; e-mail e CPF imutáveis |

#### Frontend — Serviços
| Tarefa | Critério de conclusão |
|---|---|
| Implementar `checklist.service.js` (`getChecklist`, `submitResponses`) | ✅ Funções chamam a API via Axios |
| Implementar `certification.service.js` (`getMyCertification`) | ✅ Retorna dados completos para a tela de certificado |
| Adicionar `updateMe` ao `auth.service.js` | ✅ `PUT /users/me` implementado |

#### Frontend — Tela de Diagnóstico Inicial (`/checklist`)
| Tarefa | Critério de conclusão |
|---|---|
| Barra de progresso: "Pergunta X de Y" + "X% concluído" + barra verde | ✅ Atualiza a cada navegação |
| Card de pergunta dinâmico: badge tipo, texto, pontos máximos | ✅ Renderizado a partir dos dados da API |
| Opções de resposta por tipo: `yes_no`, `multiple_choice`, `scale_1_5` | ✅ Seleção ativa visualmente; botão Próxima desabilitado sem seleção |
| Navegação: Voltar / Próxima / Concluir | ✅ Navega sem recarregar; Voltar oculto na 1ª pergunta |
| Tela de resultado final: pontuação + nível + próximos passos + botão Dashboard | ✅ Exibida após submissão |
| Redirect: cadastro → `/checklist`; checklist → `/dashboard` | ✅ Fluxo de onboarding completo |

#### Frontend — Tela de Certificado (`/certificado`)
| Tarefa | Critério de conclusão |
|---|---|
| Card principal: badge, ícone, nível, pontos, nome, CPF mascarado, data de emissão | ✅ Dados carregados da API |
| Seção "Progressão de níveis": 3 medalhas + barra de progresso + "Faltam X pontos" | ✅ Cálculo baseado em `total_score` |
| Seção "Critérios avaliados": ✅/🔴 por critério + pontos | ✅ Renderizado dinamicamente |
| Seção "Composição da pontuação": checklist + registros + total | ✅ |
| CTA "+ Adicionar mais registros para evoluir" | ✅ Navega para `/novo` |

#### Frontend — Dashboard/Início (finalização)
| Tarefa | Critério de conclusão |
|---|---|
| Card de certificação com badge, pontuação, barra de progresso e "Faltam X pontos" | ✅ Dados reais da API de certificação |
| 3 stat cards: Registros (30d), Total, Tipos | ✅ |
| Seção "Ações rápidas": Novo registro + Ver certificado | ✅ |
| Seção "Últimos registros": 4 mais recentes com ícone, tipo, peso, badge de evidência | ✅ |

#### Frontend — Tela de Perfil (`/perfil`)
| Tarefa | Critério de conclusão |
|---|---|
| Card do usuário: avatar, nome, e-mail, badge nível, CPF, cidade, estado, membro desde | ✅ |
| Botão "Editar dados": formulário inline com Nome, Cidade, Estado; salva via `PUT /users/me` | ✅ E-mail e CPF somente leitura |
| 6 métricas em grade: pontuação, registros, peso, evidências, tipos, 30d | ✅ |
| Tags de tipos de resíduo registrados | ✅ |
| Botões: Ver certificado / Refazer diagnóstico / Sair da conta | ✅ |

**Entregável:** ✅ Fluxo completo de ponta a ponta. Cadastro → Diagnóstico → Dashboard → Registros + Evidências → Certificado automático. Testado com curl: 7 perguntas, 55 pts → Bronze. Build frontend: 176 módulos, sem erros.

---

### Etapa 5 · Polimento do MVP
**Objetivo:** Deixar o MVP demonstrável, sem bugs críticos.  
**Semana:** 19–25/jul

| Tarefa | Tipo |
|---|---|
| Implementar exception handlers globais no FastAPI (400, 401, 403, 404, 422, 500) | Backend |
| Tratar erros de API com mensagens claras no frontend (toasts ou mensagens inline) | UX |
| Revisar responsividade (mobile web) em todas as telas | UI |
| Criar página 404 e fallback de rotas no React Router | Frontend |
| Testar fluxo completo do zero com um novo usuário (QA manual) | QA |
| Deploy básico (Render.com para backend + Vercel para frontend) | Infra |
| Verificar variáveis de ambiente em produção (`DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`) | Infra |
| `README.md` com instruções de instalação local e deploy | Docs |

**Entregável:** MVP publicado online, demonstrável a qualquer pessoa com um link.

---

## Fase 2 — Versão Apresentável (26/07 → 09/08)

### Etapa 6 · Rastreabilidade (base)
**Semana:** 26/jul–01/ago
- Modelagem do fluxo Gerador → Transporte → Destinação (entidade `waste_flow`)
- Endpoints de registro de cada etapa do fluxo
- Tela de linha do tempo de um resíduo

### Etapa 7 · Relatórios
**Semana:** 02–05/ago
- Endpoint que agrega dados do usuário por período
- Tela de "Relatório Pessoal" com gráficos (Recharts)
- Cálculo de percentual de desvio de aterro

### Etapa 8 · Moeda Social (básico) + Gamificação
**Semana:** 02–05/ago (paralelo ao 7)
- Sistema de pontos adicionais por ação (`credit_transactions`)
- Saldo de créditos visível no perfil
- Ranking simples entre usuários cadastrados

### Etapa 9 · Preparação para Apresentação
**Semana:** 06–09/ago
- Revisão geral de UX e visual
- Dados de exemplo (seed) para demonstração ao vivo
- Documentação técnica resumida
- Ensaio de apresentação / demo walkthrough

---

## Marcos de Verificação

| Data | Marco |
|---|---|
| 27/06 | Ambiente local funcionando; banco conectado; estrutura base criada |
| 04/07 | Autenticação completa (cadastro com CPF + login + JWT + rotas protegidas) |
| 11/07 | Registros de resíduos + upload de evidências + recálculo de certificação |
| 18/07 | Checklist respondido + Certificação automática exibida no dashboard |
| **25/07** | **🏁 MVP publicado online** |
| 01/08 | Rastreabilidade (base) |
| **09/08** | **🏁 Versão apresentável** |

---

## Decisões Pendentes

| Decisão | Impacto | Prazo |
|---|---|---|
| ~~Confirmar critérios de pontuação Bronze/Prata/Ouro com a pesquisadora~~ | ~~Bloqueia implementação da `certification_service`~~ | ✅ Resolvido — valores são configuráveis pelo admin (seed padrão: bronze=30, prata=70, ouro=120). Pesquisadora ajusta via painel sem redeploy. |
| Definir se `PUT` e `DELETE` de waste records entram no MVP | Escopo da Etapa 3 | Início da Etapa 3 |
| Alinhar valores iniciais de pts/kg por tipo de resíduo com a pesquisadora | Seed da migration `0003` usa valores padrão do DATA-MODEL.md; admin ajusta via painel | Antes da Etapa 3.5 |

---

## Legenda de Status

- ⬜ Não iniciado
- 🔄 Em andamento
- ✅ Concluído
- ⚠️ Bloqueado / Necessita revisão