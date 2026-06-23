# Design System — Sustentabilizar

> Guia de implementação de UI. Todo novo componente ou tela deve seguir este documento para garantir consistência visual.  
> Baseado no protótipo aprovado em `screenshots/`.

---

## 1. Princípios

- **Consistência total:** Mesma cor, espaçamento, tipografia e componentes em todas as telas.
- **Verde = sustentabilidade:** A identidade visual usa exclusivamente verde como cor primária. Amarelo/laranja apenas para avisos.
- **Fundo neutro, conteúdo em branco:** O fundo da página é cinza muito suave; os cards são brancos com sombra discreta.
- **Simplicidade:** Sem gradientes, sem sombras pesadas, sem animações complexas. Interface limpa e funcional.

---

## 2. Paleta de Cores (Tailwind)

### Cores Primárias

| Token | Classe Tailwind | Hex aproximado | Uso |
|---|---|---|---|
| `primary` | `green-700` | `#15803D` | Botões primários, links ativos, texto de destaque verde |
| `primary-hover` | `green-800` | `#166534` | Hover de botões primários |
| `primary-light` | `green-50` | `#F0FDF4` | Background item ativo na sidebar, hero section, info boxes |
| `primary-border` | `green-200` | `#BBF7D0` | Bordas de elementos com destaque verde |
| `primary-dark` | `green-900` | `#14532D` | Background do footer CTA |

### Cores Neutras

| Token | Classe Tailwind | Uso |
|---|---|---|
| `bg-page` | `bg-gray-100` | Background de todas as páginas |
| `bg-card` | `bg-white` | Cards, sidebar, modais |
| `text-heading` | `text-gray-900` | Títulos principais (H1, H2) |
| `text-body` | `text-gray-700` | Texto corrido |
| `text-muted` | `text-gray-500` | Subtítulos, datas, hints |
| `text-placeholder` | `text-gray-400` | Placeholder de inputs |
| `border-default` | `border-gray-200` | Bordas de cards e inputs |
| `border-input` | `border-gray-300` | Borda de campos de formulário |

### Cores de Estado

| Estado | Classe Tailwind | Hex | Uso |
|---|---|---|---|
| Sucesso / Atingido | `text-green-600` / `bg-green-100` | `#16A34A` | Badge "1 evidência", critério atingido ✅ |
| Aviso | `text-amber-600` / `bg-amber-50` | `#D97706` | Badge "Sem evidência" ⚠️ |
| Erro | `text-red-500` | `#EF4444` | Critério não atingido 🔴, mensagens de erro |
| Desabilitado | `bg-green-200 text-white` | — | Botão primário desabilitado (não atingido) |

### Cores dos Níveis de Certificação

| Nível | Texto | Badge bg | Ícone | Borda do card (landing) |
|---|---|---|---|---|
| Bronze | `text-amber-700` | `bg-amber-50` | 🥉 | `border-amber-300` |
| Prata | `text-gray-500` | `bg-gray-100` | 🥈 | `border-gray-300` |
| Ouro | `text-yellow-600` | `bg-yellow-50` | 🥇 | `border-yellow-400` |
| Sem nível | `text-gray-400` | `bg-gray-50` | — | `border-gray-200` |

---

## 3. Tipografia

> **Fonte:** Inter (importar via Google Fonts ou Fontsource). Fallback: `system-ui, sans-serif`.

```css
/* Em index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body { font-family: 'Inter', system-ui, sans-serif; }
```

### Escala

| Uso | Classe Tailwind | Tamanho | Peso |
|---|---|---|---|
| Título de página (H1) | `text-2xl font-bold text-gray-900` | 24px | 700 |
| Título de seção (H2) | `text-xl font-semibold text-gray-900` | 20px | 600 |
| Título de card | `text-lg font-semibold text-gray-900` | 18px | 600 |
| Label de campo | `text-sm font-medium text-gray-700` | 14px | 500 |
| Corpo de texto | `text-sm text-gray-700` | 14px | 400 |
| Subtítulo / hint | `text-sm text-gray-500` | 14px | 400 |
| Timestamp / muted | `text-xs text-gray-400` | 12px | 400 |
| Badge / pill | `text-xs font-medium` | 12px | 500 |
| Número de destaque (pontos) | `text-4xl font-bold text-gray-900` | 36px | 700 |

---

## 4. Espaçamento e Layout

### Escala de espaçamento
Usar múltiplos de 4px (escala padrão Tailwind). Os espaçamentos mais usados:

| Uso | Classe |
|---|---|
| Padding interno de card | `p-6` (24px) |
| Padding interno de card compacto | `p-4` (16px) |
| Gap entre cards em grid | `gap-4` (16px) |
| Gap entre campos de formulário | `space-y-4` (16px) |
| Gap entre seções dentro de uma página | `space-y-6` (24px) |
| Padding lateral do conteúdo principal | `px-6 py-6` |
| Border radius de cards | `rounded-xl` (12px) |
| Border radius de botões | `rounded-lg` (8px) |
| Border radius de inputs | `rounded-lg` (8px) |
| Border radius de badges | `rounded-full` |

### Breakpoints responsivos
- Mobile-first. Dashboard usa sidebar colapsável em mobile (hamburger).
- `sm`: 640px · `md`: 768px · `lg`: 1024px · `xl`: 1280px

---

## 5. Componentes Base

### 5.1 Botão — Primário
```jsx
// Verde sólido, canto arredondado
<button className="w-full bg-green-700 hover:bg-green-800 text-white 
                   font-medium py-3 px-4 rounded-lg 
                   transition-colors duration-200 
                   disabled:bg-green-200 disabled:cursor-not-allowed">
  Criar conta e começar
</button>
```
- Largura: `w-full` dentro de forms, `px-6` em contextos inline.
- Ícone opcional: emoji ou SVG à esquerda com `mr-2`.

### 5.2 Botão — Secundário (outline)
```jsx
<button className="w-full bg-white hover:bg-gray-50 text-gray-700 
                   font-medium py-3 px-4 rounded-lg 
                   border border-gray-300 
                   transition-colors duration-200">
  Já tenho conta
</button>
```

### 5.3 Botão — Ghost / Link
```jsx
<button className="text-green-700 hover:text-green-800 
                   text-sm font-medium underline-offset-2 hover:underline">
  Pular por agora (não recomendado)
</button>
```

### 5.4 Input de Texto
```jsx
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Nome completo
  </label>
  <input
    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 
               text-sm text-gray-900 placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
               transition-shadow duration-150"
    placeholder="Ana Beatriz Silva"
  />
  {/* Estado de erro */}
  <p className="text-xs text-red-500">Mensagem de erro aqui</p>
</div>
```
- `focus:ring-green-500` para manter consistência com a paleta primária.
- Label sempre acima do input, nunca dentro (sem floating label).

### 5.5 Select
```jsx
<select className="w-full px-3 py-2.5 rounded-lg border border-gray-300 
                   text-sm text-gray-900 bg-white
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                   transition-shadow duration-150">
  <option value="">Selecione...</option>
</select>
```

### 5.6 Textarea
```jsx
<textarea
  rows={3}
  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 
             text-sm text-gray-900 placeholder-gray-400 resize-none
             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
  placeholder="Descreva o resíduo, condições de descarte, etc."
/>
```

### 5.7 Card
```jsx
// Card padrão — branco, borda sutil, sombra leve
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
  {/* conteúdo */}
</div>

// Card clicável (registro na lista)
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 
                hover:shadow-md hover:border-gray-300 cursor-pointer 
                transition-all duration-150">
  {/* conteúdo */}
</div>
```

### 5.8 Badge
```jsx
// Evidência confirmada
<span className="inline-flex items-center gap-1 text-xs font-medium 
                 text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
  📷 1 evidência
</span>

// Sem evidência (aviso)
<span className="inline-flex items-center gap-1 text-xs font-medium 
                 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
  ⚠️ Sem evidência
</span>

// Nível Prata (exemplo — trocar cores por nível)
<span className="inline-flex items-center gap-1 text-xs font-medium 
                 text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
  🥈 Prata
</span>
```

### 5.9 Barra de Progresso
```jsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-green-600 h-2 rounded-full transition-all duration-500"
    style={{ width: `${percent}%` }}
  />
</div>
```

### 5.10 Breadcrumb / Voltar
```jsx
<button onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-1 text-sm text-gray-500 
                   hover:text-gray-700 mb-4 transition-colors">
  ← Voltar
</button>
// Variante com destino específico:
<span className="text-sm text-gray-500">← Voltar para registros</span>
```

---

## 6. Sistema de Ícones de Tipo de Resíduo

Cada tipo tem um emoji + cor de fundo específicos. Usar sempre em conjunto.

| Tipo | Emoji | `bg` (ícone) | Texto de cor |
|---|---|---|---|
| Papel | 📄 | `bg-blue-100` | `text-blue-600` |
| Plástico | ♻️ | `bg-green-100` | `text-green-600` |
| Vidro | 🫙 | `bg-teal-100` | `text-teal-600` |
| Metal | 🔩 | `bg-gray-100` | `text-gray-600` |
| Orgânico | 🌿 | `bg-lime-100` | `text-lime-600` |
| Eletrônico | 💻 | `bg-purple-100` | `text-purple-600` |
| Perigoso | ⚠️ | `bg-red-100` | `text-red-600` |
| Outro | 📦 | `bg-orange-100` | `text-orange-600` |

```jsx
// Componente WasteTypeIcon — usado em listas e no seletor de tipo
const iconMap = {
  papel:      { emoji: '📄', bg: 'bg-blue-100'  },
  plastico:   { emoji: '♻️', bg: 'bg-green-100' },
  vidro:      { emoji: '🫙', bg: 'bg-teal-100'  },
  metal:      { emoji: '🔩', bg: 'bg-gray-100'  },
  organico:   { emoji: '🌿', bg: 'bg-lime-100'  },
  eletronico: { emoji: '💻', bg: 'bg-purple-100'},
  perigoso:   { emoji: '⚠️', bg: 'bg-red-100'   },
  outro:      { emoji: '📦', bg: 'bg-orange-100'},
}

// Na lista: ícone pequeno (40×40)
<div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconMap[type].bg}`}>
  <span className="text-lg">{iconMap[type].emoji}</span>
</div>

// No seletor de tipo (/novo): ícone grande (card 100%×auto)
<button className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 
                    ${selected ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                    transition-all duration-150 cursor-pointer`}>
  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconMap[type].bg}`}>
    <span className="text-2xl">{iconMap[type].emoji}</span>
  </div>
  <span className="text-xs font-medium text-gray-700">{label}</span>
</button>
```

---

## 7. Layouts de Página

### 7.1 Layout: Páginas Públicas (Landing, Login, Register, Checklist)
```
┌─────────────────────────────────────────┐
│ bg-gray-100  (toda a página)            │
│   centralized content max-w-lg / max-w-xl│
└─────────────────────────────────────────┘
```
- Background: `bg-gray-100 min-h-screen`
- Conteúdo centralizado: `flex flex-col items-center justify-center`
- **Não** usar sidebar nessas páginas.

### 7.2 Layout: Dashboard (todas as rotas `/dashboard`, `/registros`, etc.)
```
┌──────────────┬──────────────────────────────────┐
│   Sidebar    │       Área de conteúdo            │
│   w-44       │       flex-1                      │
│   bg-white   │       bg-gray-100                 │
│   border-r   │       overflow-y-auto             │
│   fixed/h-full│      p-6                         │
└──────────────┴──────────────────────────────────┘
```
```jsx
// DashboardLayout.jsx
<div className="flex h-screen bg-gray-100">
  <Sidebar /> {/* w-44 flex-shrink-0 */}
  <main className="flex-1 overflow-y-auto p-6">
    <Outlet />
  </main>
</div>
```

---

## 8. Especificação de Cada Tela

### 8.1 Landing Page (`/`)

**Estrutura:**
```
Header (sticky, bg-white, border-b border-gray-200, shadow-sm)
  └── Logo + "Sustentabilizar" (text-gray-900 font-semibold) | nav: "Entrar" (text-sm text-gray-600) + "Começar" (btn primário compacto px-4 py-2)

Seção Hero (bg-green-50, py-20, text-center)
  └── Pill badge: "🌿 Plataforma de Certificação Ambiental" (bg-white border border-green-200 text-green-700 text-xs px-3 py-1 rounded-full)
  └── H1: "Comprove suas práticas [quebra linha] sustentáveis com evidências reais"
        "sustentáveis" em text-green-700
  └── Subtítulo: text-gray-500 text-base max-w-md mx-auto mt-3
  └── Dois botões lado a lado: primário "🚀 Criar minha conta grátis" + secundário "Já tenho conta"

Seção "Como funciona" (bg-white, py-16, text-center)
  └── H2: "Como funciona" + subtítulo gray-500
  └── Grid 4 colunas (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10)
  └── Cada passo: ícone circular bg-green-50 (w-14 h-14) + "Passo N" text-xs text-green-600 + título font-semibold + descrição text-sm text-gray-500

Seção "Níveis de certificação" (bg-gray-50, py-16)
  └── H2 centralizado
  └── Grid 3 colunas (max-w-3xl mx-auto grid-cols-3 gap-6 mt-8)
  └── Card Bronze: border-2 border-amber-300 rounded-xl p-6 text-center bg-white
        emoji medal + "Bronze" text-amber-700 font-bold text-xl + "≥ 30 pts" text-amber-600 font-semibold + descrição text-sm text-gray-500
  └── Card Prata: border-2 border-gray-300
  └── Card Ouro: border-2 border-yellow-400

Rodapé CTA (bg-green-900, py-16, text-center, text-white)
  └── H2 text-white + subtítulo text-green-300
  └── Botão "🌿 Criar conta grátis" (bg-white text-green-900 hover:bg-green-50 font-semibold px-8 py-3 rounded-lg)
```

---

### 8.2 Tela de Cadastro (`/register`)

```
bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4

Logo + "Sustentabilizar" (text-xl font-semibold) — centralizado no topo, mb-6
H1: "Crie sua conta" (text-2xl font-bold text-gray-900 text-center)
Subtítulo: "Pessoa Física · Gratuito" (text-sm text-gray-500 text-center mt-1 mb-6)

Card formulário: bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md

Campos (space-y-4):
  - Nome completo
  - E-mail
  - CPF (placeholder "000.000.000-00"; aplicar máscara ao digitar)
  - Cidade + Estado: grid grid-cols-3 gap-3
      Cidade: col-span-2
      Estado: col-span-1 (select com 27 UFs)
  - Senha
  - Confirmar senha

Botão primário full-width: "🌿 Criar conta e começar"

Rodapé do card: "Já tem conta? [Entrar]" — text-sm text-gray-500, link text-green-700 font-medium
```

**Login (`/login`):** Mesmo layout, apenas campos E-mail + Senha + botão "Entrar".

---

### 8.3 Diagnóstico Inicial (`/checklist`)

```
bg-gray-100 min-h-screen flex flex-col items-center pt-10 px-4

Logo centralizado no topo
H1: "Diagnóstico inicial" (text-2xl font-bold text-gray-900 text-center)
Subtítulo: text-sm text-gray-500 text-center mt-1

Barra de progresso (max-w-xl w-full mx-auto mt-8):
  Linha 1: "Pergunta X de Y" (text-sm text-gray-500) | "X% concluído" (text-sm text-gray-500) — justify-between
  Linha 2: ProgressBar component

Card da pergunta (max-w-xl w-full mx-auto mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6):
  Badge tipo: text-xs font-semibold uppercase tracking-wide text-green-700 mb-3
    ex: "SIM / NÃO" | "MÚLTIPLA ESCOLHA" | "ESCALA DE 1 A 5"
  Pergunta: text-base font-semibold text-gray-900 leading-snug
  "Vale até X pontos": text-sm text-gray-400 mt-1

  Opções (space-y-3 mt-5):
    — yes_no: 2 cards clicáveis
      não selecionado: bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 hover:border-green-400 cursor-pointer
      selecionado: bg-green-50 border-2 border-green-600 rounded-lg px-4 py-3 text-sm font-medium text-green-800
    — multiple_choice: N cards (mesmo estilo)
    — scale_1_5: grid grid-cols-5 gap-2
      cada box: botão quadrado w-full aspect-square flex items-center justify-center rounded-lg border text-sm font-medium
      rótulos abaixo: "Muito baixo" (text-xs text-gray-400) à esquerda | "Muito alto" à direita

Navegação (max-w-xl w-full mx-auto mt-4 flex items-center justify-between):
  "← Voltar": ghost button (oculto na 1ª pergunta)
  Hint "Selecione uma opção para continuar" (text-xs text-gray-400 text-center)
  "Próxima →": botão primário (desabilitado até seleção, aparência disabled:bg-green-200)
```

**Tela de resultado final (última pergunta → submit):**
```
Card resultado (max-w-xl mx-auto):
  Ícone grande do nível desbloqueado centralizado
  "Diagnóstico concluído!" H2
  "Você obteve X pontos" — pontos em destaque verde
  ProgressBar mostrando posição no nível
  Seção "Próximos passos" (lista com ícones)
  Botão primário full-width: "🏠 Ir para o Dashboard →"
```

---

### 8.4 Sidebar do Dashboard

```
w-44 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0

Topo (p-4 border-b border-gray-100):
  🌿 "Sustentabilizar" (text-sm font-semibold text-gray-900)

Nav (flex-1, p-3, space-y-1):
  Cada item: link ou button, flex items-center gap-3, px-3 py-2 rounded-lg text-sm font-medium
  Estado INATIVO:  text-gray-600 hover:bg-gray-100 hover:text-gray-900
  Estado ATIVO:    bg-green-50 text-green-700 font-semibold

  Ícones (usar react-icons ou emojis):
    🏠 Início     → /dashboard
    📋 Registros  → /registros
    ➕ Novo       → /novo
    🏆 Certificado → /certificado
    👤 Perfil     → /perfil

Base (p-3 border-t border-gray-100):
  🚪 "Sair" — text-sm text-gray-500 hover:text-red-500 hover:bg-red-50
               flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-colors
```

---

### 8.5 Dashboard — Início (`/dashboard`)

```
Conteúdo (p-6 space-y-6):

Cabeçalho:
  "Olá, [Nome]! 👋" — text-2xl font-bold text-gray-900
  data atual — text-sm text-gray-500 mt-0.5

Card de Certificação (bg-white rounded-xl border border-gray-200 shadow-sm p-6):
  Linha topo: Badge do nível (ex: 🥈 Prata — compact) | à direita: ícone grande do nível (w-10 h-10 float-right)
  Número de pontos: "87" text-4xl font-bold text-gray-900 + "pontos" text-base text-gray-500 ml-1
  ProgressBar mt-3:
    Linha de rótulos: nível atual (text-xs text-gray-500) | próximo nível (text-xs text-gray-500)
    Barra (h-2 rounded-full bg-gray-200 > div bg-green-600)
  "Faltam X pontos para o nível [próximo]" — text-xs text-gray-400 mt-1

Grid de stats (grid grid-cols-3 gap-4):
  Cada stat card: bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center
    Emoji ícone (text-2xl)
    Número: text-2xl font-bold text-gray-900
    Label: text-xs text-gray-500 mt-1

Ações rápidas:
  "Ações rápidas" — text-sm font-semibold text-gray-700
  Dois botões em grid grid-cols-2 gap-3:
    "➕ Novo registro" — btn primário
    "🏆 Ver certificado" — btn secundário

Últimos registros:
  Header: "Últimos registros" font-semibold | "Ver todos →" text-sm text-green-700 hover:underline
  Lista de até 4 itens: cada um = Card clicável compacto (py-3 px-4)
    Ícone do tipo (w-9 h-9 rounded-lg) | nome do tipo font-medium | peso text-sm text-gray-500
    Badge evidência (opcional) | data text-xs text-gray-400 ml-auto
```

---

### 8.6 Dashboard — Registros (`/registros`)

```
Cabeçalho (flex items-start justify-between):
  "Meus registros" H1 + "N registros no total" subtitle
  Botão "➕ Novo" — btn primário compacto

Tabs de filtro (flex gap-2 flex-wrap mt-4):
  "Todos (N)" — ativo: bg-green-700 text-white rounded-full px-3 py-1 text-sm font-medium
  "📄 Papel (N)" — inativo: bg-white border border-gray-200 text-gray-600 rounded-full px-3 py-1 text-sm hover:border-gray-400

Lista de registros (mt-4 space-y-3):
  Cada card: bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3
    flex items-start gap-3
    WasteTypeIcon (w-10 h-10)
    Coluna central (flex-1):
      Tipo: text-sm font-semibold text-gray-900
      Peso + Volume: text-sm text-gray-500 (ex: "2.5 kg  ·  15 dm³")
      Badges: evidência ou "Sem evidência" + observações truncadas (text-xs text-gray-400 truncate max-w-xs)
    Direita: data (text-xs text-gray-400) + "›" (text-gray-300)
```

---

### 8.7 Dashboard — Registro Individual (`/registros/:id`)

```
"← Voltar para registros" (ghost, mb-4)
Header:
  WasteTypeIcon grande (w-12 h-12 rounded-xl)
  Tipo: H1 inline
  data: text-sm text-gray-500

Card "Detalhes do registro" (bg-white rounded-xl border border-gray-200 p-6 mt-4):
  Grid 2 colunas (grid-cols-2 gap-x-8 gap-y-4):
    Cada campo: label (text-xs text-gray-500 uppercase tracking-wide) + valor (text-sm font-medium text-gray-900 mt-0.5)
  Campos: Tipo, Peso, Volume, Frequência, Data de coleta, Registrado em, Observações (col-span-2)

Card "Evidências (N)" (bg-white rounded-xl border border-gray-200 p-6 mt-4):
  Header: "Evidências (N)" font-semibold | btn "+ Adicionar" (compacto outline verde)
  Grid de thumbnails (grid-cols-3 gap-3 mt-4):
    Cada thumbnail: img object-cover w-full aspect-square rounded-lg border border-gray-200
                    + filename (text-xs text-gray-600 truncate mt-1)
                    + timestamp (text-xs text-gray-400)
  Se sem evidências:
    Estado vazio: text-sm text-gray-400 py-6 text-center "Nenhuma evidência adicionada"
    + btn primário "Adicionar evidência"
```

---

### 8.8 Dashboard — Novo Registro (`/novo`)

```
"← Voltar" (ghost, mb-4)
H1: "Novo registro de resíduo"
Subtítulo: text-sm text-green-700 mt-0.5 "Registre o tipo e quantidade do resíduo gerado"

Formulário (space-y-6 max-w-2xl):

Seletor de tipo de resíduo:
  Label: "Tipo de resíduo *" (text-sm font-medium text-gray-700 mb-2)
  Grid 4 colunas (grid-cols-4 gap-3):
    8 cards clicáveis (ver seção 6 — ícone grande)
    Selecionado: border-2 border-green-600 bg-green-50

Linha Peso + Volume (grid grid-cols-2 gap-4):
  Peso: input numérico com unidade "kg" inline
  Volume: input numérico com unidade "dm³" + "(— opcional)" em gray-400

Linha Frequência + Data (grid grid-cols-2 gap-4):
  Frequência: select
  Data: input type="date"

Observações: textarea 3 linhas

Botões (flex gap-3 justify-end mt-2):
  "Cancelar" — btn secundário
  "Salvar e adicionar evidência →" — btn primário
```

---

### 8.9 Dashboard — Upload de Evidência (`/evidencia/:recordId`)

```
"← Voltar" (ghost, mb-4)
H1: "Adicionar evidência"
Subtítulo: text-sm text-gray-500

Info box de timestamp (bg-green-50 border border-green-200 rounded-lg px-4 py-3 mt-4 flex items-center gap-2):
  "📅" + "Timestamp automático:" text-sm font-medium text-green-800
  + data/hora atual em text-sm text-green-600 font-semibold

Dropzone (mt-6 border-2 border-dashed border-gray-300 rounded-xl p-10 text-center
          hover:border-green-400 hover:bg-green-50 transition-colors cursor-pointer):
  "📁" (text-4xl text-gray-300 mb-3)
  "Clique ou arraste uma imagem aqui" — text-sm font-medium text-gray-700
  "JPG ou PNG · Máximo 10 MB" — text-xs text-gray-400 mt-1
  btn "Escolher arquivo" — outline compacto mt-4

Preview (após seleção): img thumbnail + nome + tamanho + botão remover (×)

Link "Pular por agora (não recomendado)" — ghost, text-sm text-gray-400, centralizado, mt-6
```

---

### 8.10 Dashboard — Certificado (`/certificado`)

```
H1: "Meu Certificado"
Subtítulo: text-sm text-gray-500

Card principal (bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4):
  "CERTIFICADO AMBIENTAL" — text-xs font-semibold uppercase tracking-widest text-gray-400
  Linha: ícone nível (grande) + "Nível [Bronze/Prata/Ouro]" H2 (cor do nível) | pontos badge no canto direito (text-3xl font-bold text-gray-900 + "pontos" text-sm)
  Divisor (border-t border-gray-100 my-4)
  Nome do usuário: text-sm font-semibold text-gray-900
  CPF: text-sm text-gray-500
  Data de emissão: text-xs text-gray-400 mt-0.5
  Divisor
  Mensagem motivacional: text-sm text-green-700 italic

Card "Progressão de níveis" (bg-white rounded-xl border border-gray-200 p-6 mt-4):
  Título: "Progressão de níveis" font-semibold mb-4
  3 medalhas em flex justify-around:
    Cada medalha: flex flex-col items-center gap-1
      Círculo (w-14 h-14 rounded-full border-2 flex items-center justify-center):
        Nível atingido: border-green-500 bg-green-50 (com ✓ sobreposto para nível passado)
        Nível ATUAL: border-2 border-gray-900 bg-white (destaque)
        Nível futuro: border-gray-200 bg-gray-50 opacity-60
      Emoji medal
      Nome: text-xs font-medium (cor do nível)
      "≥ Xpts": text-xs text-gray-400
  "Progresso para [próximo]": label text-xs text-gray-500 mt-4
  ProgressBar mt-1
  "Faltam X pontos para atingir o nível [Y]": text-xs text-gray-500 text-center mt-1
    X pontos em font-semibold text-gray-900

Card "Critérios avaliados" (bg-white rounded-xl border border-gray-200 p-6 mt-4):
  Título: "Critérios avaliados" font-semibold mb-4
  Lista (space-y-3):
    Atingido: "✅" + texto text-sm text-gray-700 | "+Xpts" text-xs font-semibold text-green-600 ml-auto
    Não atingido: "🔴" + texto text-sm text-gray-400 | "—" ml-auto

Card "Composição da pontuação" (bg-white rounded-xl border border-gray-200 p-6 mt-4):
  Título: "Composição da pontuação" font-semibold mb-4
  Linhas (space-y-2):
    "📝 Checklist inicial" text-sm text-gray-700 | "X pts" text-sm text-gray-900 ml-auto
    "📦 Registros de resíduos" | "X pts"
    Divisor border-t
    "Total" font-semibold | "X pts" text-green-700 font-bold text-lg

Botão "➕ Adicionar mais registros para evoluir" — btn secundário full-width mt-4
```

---

### 8.11 Dashboard — Perfil (`/perfil`)

```
H1: "Meu Perfil"

Card do usuário (bg-white rounded-xl border border-gray-200 p-6 mt-4):
  flex gap-4 items-start:
    Avatar: w-16 h-16 rounded-full bg-green-700 flex items-center justify-center
            text-white text-2xl font-bold (inicial do nome)
    Coluna de dados:
      Nome: text-lg font-semibold text-gray-900
      E-mail: text-sm text-gray-500
      Badge do nível (compacto, mt-1)
  Grid 2 colunas mt-4 gap-y-3:
    Cada campo: label (text-xs text-gray-400 uppercase tracking-wide) + valor (text-sm text-gray-900 mt-0.5)
    Campos: CPF, Cidade/Estado, Tipo de perfil, Membro desde
  Botão "Editar dados" — btn secundário compacto mt-4

Card "Minhas estatísticas" (bg-white rounded-xl border border-gray-200 p-6 mt-4):
  Título: "Minhas estatísticas" font-semibold mb-4
  Grid 3 colunas (grid-cols-2 sm:grid-cols-3 gap-4):
    Cada stat: text-center
      Número: text-2xl font-bold text-gray-900
      Label: text-xs text-gray-500 mt-0.5

"Tipos de resíduo registrados": 
  Título text-sm font-medium text-gray-700 mb-2
  flex flex-wrap gap-2:
    Para cada tipo com registro: badge colorido (emoji + nome, estilo pill bg-X-100 text-X-700)

Botões de ação (space-y-3 mt-6):
  "🏆 Ver meu certificado completo" — btn secundário full-width
  "🔄 Refazer diagnóstico" — btn secundário full-width
  "🚪 Sair da conta" — bg-white text-red-600 border border-red-200 hover:bg-red-50 full-width rounded-lg py-2.5 text-sm font-medium
```

---

## 9. Estados Interativos

| Elemento | Estado | Aparência |
|---|---|---|
| Botão primário | Hover | `bg-green-800` |
| Botão primário | Disabled | `bg-green-200 text-white cursor-not-allowed opacity-60` |
| Botão primário | Loading | Spinner no lugar do ícone + texto "Carregando..." + disabled |
| Card clicável | Hover | `shadow-md border-gray-300` |
| Opção de checklist | Selecionada | `bg-green-50 border-2 border-green-600 text-green-800` |
| Tipo de resíduo (selector) | Selecionado | `bg-green-50 border-2 border-green-600` |
| Input | Focus | `ring-2 ring-green-500 border-transparent` |
| Input | Erro | `border-red-400 focus:ring-red-400` + mensagem abaixo em `text-xs text-red-500` |
| Nav sidebar | Ativo | `bg-green-50 text-green-700 font-semibold` |
| Tab de filtro | Ativo | `bg-green-700 text-white` |
| Tab de filtro | Inativo | `bg-white border border-gray-200 text-gray-600 hover:border-gray-400` |

---

## 10. Mensagens de Feedback ao Usuário

Usar **toast notifications** (biblioteca `react-hot-toast` ou similar) posicionadas no canto superior direito:

```jsx
// Sucesso
toast.success('Registro salvo com sucesso!')

// Erro
toast.error('Erro ao salvar. Tente novamente.')

// Loading (durante submit)
const toastId = toast.loading('Salvando...')
toast.dismiss(toastId)
```

Cores dos toasts: seguir paleta padrão da lib, não customizar. Manter simples.

---

## 11. Animações e Transições

Usar apenas o que o Tailwind oferece nativamente — sem bibliotecas de animação:

| Contexto | Classe |
|---|---|
| Hover em botões e cards | `transition-colors duration-150` ou `transition-all duration-150` |
| Barra de progresso (preenchimento) | `transition-all duration-500` |
| Dropdown / toggle | `transition-opacity duration-200` |

Sem animações de entrada de página. Sem `framer-motion` no MVP.

---

## 12. Checklist de Consistência

Antes de considerar qualquer tela pronta, verificar:

- [ ] Background da página é `bg-gray-100`?
- [ ] Cards são `bg-white rounded-xl border border-gray-200 shadow-sm`?
- [ ] Botão primário usa `bg-green-700 hover:bg-green-800`?
- [ ] Inputs têm `focus:ring-2 focus:ring-green-500`?
- [ ] Tipografia de título usa `text-2xl font-bold text-gray-900`?
- [ ] Textos secundários usam `text-gray-500` ou `text-gray-400`?
- [ ] Ícones de tipo de resíduo usam a tabela da seção 6?
- [ ] Links usam `text-green-700 hover:underline`?
- [ ] Tela funciona em mobile (min-width 375px)?
