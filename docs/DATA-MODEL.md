# Modelo de Dados — Sustentabilizar

> Versão MVP · Entidades centrais do sistema

---

## Visão Geral das Entidades

```
┌─────────┐     ┌───────────────┐     ┌──────────┐
│  users  │────►│  waste_records│────►│evidences │
└─────────┘     └───────────────┘     └──────────┘
     │
     │          ┌──────────────────────┐
     ├──────────│  checklist_responses │
     │          └──────────────────────┘
     │               │
     │          ┌────┴─────────────┐
     │          │ checklist_items  │
     │          └──────────────────┘
     │
     └──────────┌──────────────────┐
                │  certifications  │
                └──────────────────┘
```

---

## Entidade 1: `users`

Representa qualquer pessoa cadastrada na plataforma. No MVP, apenas Pessoa Física.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `name` | VARCHAR(255) | Nome completo |
| `email` | VARCHAR(255) UNIQUE | E-mail (usado para login) |
| `cpf` | VARCHAR(14) UNIQUE | CPF formatado (XXX.XXX.XXX-XX) |
| `password_hash` | VARCHAR(255) | Senha hasheada com bcrypt |
| `profile_type` | ENUM | `pessoa_fisica` (MVP) · futuramente: `pessoa_juridica`, `cooperativa`, `auditor` |
| `city` | VARCHAR(100) | Cidade (digitada no MVP; GPS na Fase 2) |
| `state` | VARCHAR(2) | UF |
| `created_at` | TIMESTAMP | Data de cadastro |
| `updated_at` | TIMESTAMP | Última atualização |
| `is_active` | BOOLEAN | Permite desativar conta sem deletar |
| `is_admin` | BOOLEAN | Acesso ao painel de administração (default: `false`) |

**Regras:**
- `email` e `cpf` devem ser únicos no sistema.
- `password_hash` nunca é exposto em nenhum response da API.
- `is_admin` não é aceito em `POST /auth/register` — definido apenas via bootstrap ou diretamente no banco.

---

## Entidade 2: `waste_records`

Cada entrada de resíduo registrada por um usuário.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `user_id` | UUID (FK → users.id) | Usuário que fez o registro |
| `waste_type` | ENUM | `papel`, `plastico`, `vidro`, `metal`, `organico`, `eletronico`, `perigoso`, `outro` |
| `weight_kg` | DECIMAL(8,3) | Peso em quilogramas |
| `volume_liters` | DECIMAL(8,2) | Volume estimado em litros (opcional) |
| `collection_frequency` | ENUM | `diaria`, `semanal`, `quinzenal`, `mensal`, `esporadica` |
| `collection_date` | DATE | Data em que o resíduo foi gerado/coletado |
| `notes` | TEXT | Observações livres (opcional) |
| `created_at` | TIMESTAMP | Data de criação do registro |

**Regras:**
- `weight_kg` > 0.
- Um registro pode ter zero ou várias evidências vinculadas.

**Tipos de resíduo (referência para o frontend):**
```
papel · plástico · vidro · metal · orgânico · eletrônico · perigoso · outro
```

---

## Entidade 3: `evidences`

Arquivos de imagem vinculados a um registro de resíduo.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `waste_record_id` | UUID (FK → waste_records.id) | Registro de resíduo associado |
| `user_id` | UUID (FK → users.id) | Usuário que fez o upload (redundante mas útil para queries) |
| `file_path` | VARCHAR(500) | Caminho do arquivo no servidor (`/uploads/uuid.jpg`) |
| `file_url` | VARCHAR(500) | URL pública para exibição |
| `file_name` | VARCHAR(255) | Nome original do arquivo |
| `file_size_bytes` | INTEGER | Tamanho em bytes |
| `mime_type` | VARCHAR(100) | Ex: `image/jpeg`, `image/png` |
| `captured_at` | TIMESTAMP | Data/hora da captura (extraída do metadata ou do momento do upload) |
| `created_at` | TIMESTAMP | Data de criação do registro |

**Regras:**
- Apenas formatos `image/jpeg` e `image/png` aceitos no MVP.
- Tamanho máximo: 10 MB por arquivo.

---

## Entidade 4: `checklist_items`

As perguntas do diagnóstico inicial. Populadas via seed (dados iniciais fixos).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `question_text` | TEXT | Texto da pergunta |
| `answer_type` | ENUM | `yes_no`, `multiple_choice`, `scale_1_5` |
| `options` | JSONB | Opções de resposta com pontuação por alternativa (ver estrutura abaixo) |
| `points_max` | INTEGER | Pontuação máxima que esta pergunta pode contribuir (derivado das opções) |
| `profile_type` | ENUM | Para qual perfil esta pergunta se aplica (`pessoa_fisica` no MVP) |
| `order` | INTEGER | Ordem de exibição |
| `is_active` | BOOLEAN | Permite ativar/desativar perguntas sem deletar |

**Estrutura do campo `options` (JSONB):**

Cada opção tem `value` (identificador interno), `label` (texto exibido) e `points` (pontuação ao selecionar esta alternativa).

```json
// yes_no
[
  { "value": "sim", "label": "Sim", "points": 10 },
  { "value": "nao", "label": "Não", "points": 0 }
]

// multiple_choice
[
  { "value": "papel_plastico", "label": "Papel e Plástico", "points": 5 },
  { "value": "todos",          "label": "Todos os tipos",  "points": 10 },
  { "value": "nenhum",         "label": "Nenhum",         "points": 0 }
]

// scale_1_5 (gerado automaticamente pelo admin)
[
  { "value": "1", "label": "1 — Muito baixo", "points": 0 },
  { "value": "2", "label": "2",               "points": 3 },
  { "value": "3", "label": "3",               "points": 5 },
  { "value": "4", "label": "4",               "points": 8 },
  { "value": "5", "label": "5 — Muito alto",  "points": 10 }
]
```

O campo `points_max` é calculado automaticamente como o maior `points` entre as opções e armazenado para referência de exibição (`"Vale até X pontos"`).

**Exemplo completo de pergunta:**
```json
{
  "question_text": "Você separa resíduos recicláveis dos orgânicos em casa?",
  "answer_type": "yes_no",
  "options": [
    { "value": "sim", "label": "Sim", "points": 10 },
    { "value": "nao", "label": "Não", "points": 0 }
  ],
  "points_max": 10,
  "profile_type": "pessoa_fisica"
}
```

**Gestão:** As perguntas são gerenciadas pelo admin via painel (`/admin/checklist`). O seed inicial popula o banco na primeira execução; alterações posteriores são feitas via API admin.

---

## Entidade 5: `checklist_responses`

As respostas de um usuário a um diagnóstico.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `user_id` | UUID (FK → users.id) | Usuário que respondeu |
| `checklist_item_id` | UUID (FK → checklist_items.id) | Pergunta respondida |
| `answer_value` | VARCHAR(255) | Valor da resposta (ex: `"sim"`, `"3"`, `"papel_e_plastico"`) |
| `points_earned` | INTEGER | Pontos obtidos com esta resposta |
| `responded_at` | TIMESTAMP | Quando foi respondida |

**Regras:**
- Um usuário pode refazer o checklist ao longo do tempo. Múltiplas respostas para a mesma pergunta são permitidas.
- A pontuação mais recente é a que conta para a certificação.

---

## Entidade 6: `certifications`

O nível de certificação atual de cada usuário. Recalculado automaticamente quando novos dados são inseridos.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | Identificador único |
| `user_id` | UUID (FK → users.id) | Usuário certificado |
| `level` | ENUM | `bronze`, `prata`, `ouro`, `sem_nivel` |
| `total_score` | INTEGER | Pontuação total que gerou este nível |
| `score_from_checklist` | INTEGER | Parcela vinda do checklist |
| `score_from_records` | INTEGER | Parcela vinda dos registros de resíduos |
| `valid_from` | DATE | Data de início da validade |
| `valid_until` | DATE | Data de vencimento (ex: +1 ano) |
| `calculated_at` | TIMESTAMP | Quando foi calculado |

**Regras:**
- Apenas o registro mais recente de certificação é o "ativo".
- A lógica de cálculo fica em `backend/app/services/certification_service.py`.

---

## Diagrama de Relacionamentos (simplificado)

```
users (1) ──────< waste_records (N)
                        │
                        └──────< evidences (N)

users (1) ──────< checklist_responses (N)
                        │
                        └──────> checklist_items (N)

users (1) ──────< certifications (N)
                  [apenas a mais recente é ativa]

[config global] ──── scoring_config         (1 linha)
[config global] ──── certification_thresholds (3 linhas: bronze, prata, ouro)
[config global] ──── waste_type_scoring       (8 linhas: uma por tipo de resíduo)
```

---

## Entidade 7: `scoring_config`

Parâmetros globais de pontuação configuráveis pelo admin. Tabela de linha única (sempre existe exatamente 1 registro).

| Coluna | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | UUID (PK) | — | Identificador único |
| `points_per_record_30d` | INTEGER | `5` | Pontos por registro criado nos últimos 30 dias |
| `points_per_evidence` | INTEGER | `2` | Pontos extras por evidência vinculada a um registro |
| `points_per_unique_type` | INTEGER | `3` | Pontos por diversidade (cada tipo de resíduo distinto) |
| `updated_at` | TIMESTAMP | — | Última atualização |

**Regras:**
- Sempre há exatamente 1 linha nesta tabela (criada no seed da migration).
- Apenas admins podem alterar via `PUT /api/v1/admin/scoring-config`.

---

## Entidade 8: `certification_thresholds`

Limiar de pontuação para cada nível de certificação. Configurável pelo admin.

| Coluna | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | UUID (PK) | — | Identificador único |
| `level` | ENUM | — | `bronze`, `prata`, `ouro` |
| `min_score` | INTEGER | — | Pontuação mínima para atingir este nível |
| `updated_at` | TIMESTAMP | — | Última atualização |

**Valores padrão do seed:**

| Nível | Mínimo padrão |
|---|---|
| `bronze` | 30 |
| `prata` | 70 |
| `ouro` | 120 |

**Regras:**
- Sempre existem exatamente 3 linhas (uma por nível).
- A `certification_service` lê desta tabela — nunca de constantes hardcoded.
- Alteração pelo admin via `PUT /api/v1/admin/certification-config`.
- Validação: `min_score(bronze)` < `min_score(prata)` < `min_score(ouro)`.
- Exposto publicamente (sem autenticação) em `GET /api/v1/config/public` para uso na landing page.

---

## Entidade 9: `waste_type_scoring`

Pontuação por quilograma para cada tipo de resíduo. Somada à pontuação base de registros.

| Coluna | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | UUID (PK) | — | Identificador único |
| `waste_type` | ENUM | — | `papel`, `plastico`, `vidro`, `metal`, `organico`, `eletronico`, `perigoso`, `outro` |
| `points_per_kg` | DECIMAL(6,3) | — | Pontos por kg registrado deste tipo |
| `updated_at` | TIMESTAMP | — | Última atualização |

**Valores padrão do seed:**

| Tipo | Pontos/kg padrão | Justificativa |
|---|---|---|
| `eletronico` | 5.0 | Alto impacto ambiental |
| `perigoso` | 4.0 | Alto impacto ambiental |
| `vidro` | 2.0 | Reciclagem eficiente |
| `metal` | 2.0 | Reciclagem eficiente |
| `plastico` | 1.5 | Alta geração, impacto médio |
| `papel` | 1.0 | Reciclagem comum |
| `organico` | 1.0 | Compostagem relevante |
| `outro` | 0.5 | Tipo não especificado |

**Regras:**
- Sempre existem exatamente 8 linhas (uma por tipo de resíduo).
- Valores somados aos bônus flat da `scoring_config` na `certification_service`.
- Alteração pelo admin via `PUT /api/v1/admin/waste-scoring`.

---

## Lógica de Pontuação

Todos os parâmetros abaixo são configuráveis pelo admin e lidos de tabelas de configuração — nenhum valor está hardcoded no código.

```
pontuação_total = pontos_do_checklist + pontos_dos_registros

pontos_dos_registros:
  Σ por cada registro dos últimos 30 dias:
    + scoring_config.points_per_record_30d          (padrão: +5)
    + weight_kg × waste_type_scoring.points_per_kg  (padrão: varia por tipo)
    + scoring_config.points_per_evidence             (padrão: +2) por evidência vinculada
  + scoring_config.points_per_unique_type × (nº de tipos distintos)
                                                     (padrão: +3 por tipo)

pontos_do_checklist:
  Σ checklist_responses.points_earned (mais recente por pergunta)
  onde points_earned = options[answer_value].points da pergunta respondida

pontuação_total → nível:
  < certification_thresholds[bronze].min_score  → sem_nivel
  ≥ certification_thresholds[bronze].min_score  → bronze
  ≥ certification_thresholds[prata].min_score   → prata
  ≥ certification_thresholds[ouro].min_score    → ouro
```

> Os valores padrão (5 pts/registro, 2 pts/evidência, 3 pts/tipo, thresholds 30/70/120) são inseridos via seed na migration `0003` e podem ser alterados pelo admin a qualquer momento.

---

## Endpoint Público de Configuração

Para que a landing page exiba os valores de certificação corretos (Bronze/Prata/Ouro) sem autenticação:

```
GET /api/v1/config/public
→ Retorna:
  {
    "certification_thresholds": {
      "bronze": 30,
      "prata": 70,
      "ouro": 120
    }
  }
```

Este endpoint é aberto (sem JWT) e é o único que expõe dados de configuração publicamente.

---

## Notas para a Fase 2

Entidades a adicionar depois do MVP:

- `waste_flow` — Rastreabilidade (Gerador → Transporte → Destinação)
- `social_credits` — Saldo de moeda social por usuário
- `credit_transactions` — Histórico de ganhos/usos de créditos
- `organizations` — Cadastro de PJ, cooperativas, parceiros comerciais
- `reports` — Relatórios gerados e suas configurações
