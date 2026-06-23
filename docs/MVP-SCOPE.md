# Escopo do MVP — Sustentabilizar

> Versão 1.0 · Revisado em: 18/05/2026  
> Contexto: ~20h/semana disponíveis · Início: 01/06 · Prazo MVP: 30/06

---

## Critério de Corte

O MVP precisa demonstrar o **núcleo de valor do sistema**: um usuário registra resíduos com evidências, responde ao checklist e recebe uma certificação. Tudo que orbita em torno disso entra. Tudo que depende de parceiros externos, integrações complexas ou infraestrutura adicional fica para a fase 2.

---

## Módulos do Termo de Referência: O Que Entra e O Que Fica de Fora

### ✅ ENTRA no MVP

| Módulo | O que será feito no MVP | Simplificação aplicada |
|---|---|---|
| **4.1 Cadastro** | Registro e login de usuário | Apenas Pessoa Física. Sem PJ, cooperativas, auditores ou eventos. |
| **4.2 Checklist Inteligente** | Questionário de diagnóstico inicial | Conjunto fixo de perguntas para PF. Sem adaptatividade por perfil. Perguntas gerenciadas pelo admin. |
| **4.3 Registro de Evidências** | Upload de imagens com data/hora automáticos | Apenas imagens (JPG/PNG). Sem upload de MTR/notas fiscais por enquanto. |
| **4.4 Registro de Resíduos** | Inserção de tipo, peso e frequência de coleta | Sem cálculo de "percentual de desvio de aterro" — só registro bruto. |
| **4.7 Certificação Automática** | Lógica de pontuação → nível Bronze/Prata/Ouro | Sem QR Code de verificação. Certificado gerado como tela/card na interface. Limiares configuráveis. |
| **Painel Admin** | Login de admin + gestão de configurações do sistema | Acesso via mesmo `/login`; flag `is_admin`. Configura perguntas do diagnóstico, pontuação e limiares de certificação. |

---

### ❌ FICA DE FORA do MVP (vai para a Fase 2, até 23/07)

| Módulo | Motivo de exclusão |
|---|---|
| **4.5 Rastreabilidade** | Requer modelagem de fluxo Gerador → Transporte → Destinação, com múltiplos perfis de usuário ainda ausentes no MVP. |
| **4.6 Moeda Social** | Depende de parceiros (comércio local, feiras) e de uma infra de "carteira digital" que vai além de um MVP demostrável. |
| **4.8 Relatórios** | PDF técnico com ODS requer geração de documento no backend — complexidade alta, baixo impacto de demonstração. |
| **4.9 Gamificação** | Rankings e metas dependem de volume de usuários reais. É um multiplicador de engajamento, não o core do sistema. |
| Múltiplos perfis (PJ, Eventos, Auditores, Cooperativas) | Cada perfil exige fluxos próprios. Foco no PF permite entregar um ciclo completo e funcional. |
| Geolocalização automática em evidências | A API de geolocalização do browser pode ser implementada, mas não é bloqueante para demonstrar o valor central. |
| QR Code no certificado | Nice-to-have visual; a lógica de certificação é o que importa no MVP. |
| Modo offline parcial | Requer Service Workers e estratégia de sincronização — out of scope para o prazo. |

---

## Fluxo Completo do MVP

O usuário percorre este caminho de ponta a ponta:

```
1. Cadastro (nome, e-mail, senha, CPF)
      ↓
2. Login
      ↓
3. Checklist inicial (diagnóstico de práticas de segregação)
      ↓
4. Dashboard pessoal (pontuação atual, nível atual, histórico)
      ↓
5. Novo registro de resíduo (tipo + peso + data)
      ↓
6. Upload de evidência (imagem com timestamp automático)
      ↓
7. Sistema recalcula pontuação automaticamente
      ↓
8. Visualização do nível de certificação (Bronze / Prata / Ouro)
```

Este fluxo fecha o ciclo de valor descrito no item 5 do termo de referência.

---

## Definição dos Níveis de Certificação para o MVP

Os valores abaixo são os **padrões iniciais**, inseridos via seed na migration `0003`. Todos são configuráveis pelo admin via painel sem necessidade de redeploy.

| Nível | Critério padrão | Configurável em |
|---|---|---|
| **Bronze** | ≥ 30 pontos | `/admin/certification` |
| **Prata** | ≥ 70 pontos | `/admin/certification` |
| **Ouro** | ≥ 120 pontos | `/admin/certification` |

Os pontos são compostos por:
- **Checklist:** soma das pontuações de cada resposta (definidas por alternativa pelo admin)
- **Registros:** base flat por registro + pts/kg por tipo de resíduo + bônus por evidência + diversidade de tipos

Todos esses parâmetros são configuráveis em `/admin/pontuacao` e `/admin/residuos`.

> Os valores padrão foram definidos como proposta inicial. O admin pode ajustá-los a qualquer momento após consulta com a pesquisadora.

---

## O Que o MVP Vai Demonstrar

Ao final de 30/06, a aplicação deverá:

- [ ] Permitir cadastro e login de um usuário Pessoa Física
- [ ] Apresentar e registrar respostas ao checklist de diagnóstico
- [ ] Permitir criação de registros de resíduos (tipo + peso)
- [ ] Aceitar upload de imagem como evidência vinculada ao registro
- [ ] Calcular e exibir o nível de certificação atual do usuário
- [ ] Funcionar de forma responsiva no navegador (desktop e mobile web)
- [ ] Permitir login de admin e acesso ao painel administrativo
- [ ] Permitir ao admin gerenciar perguntas do diagnóstico (criar, editar, remover)
- [ ] Permitir ao admin configurar pontuação por alternativa, por tipo de resíduo (pts/kg), por registro e por evidência
- [ ] Permitir ao admin configurar limiares de nível (Bronze/Prata/Ouro)
- [ ] Exibir na landing page os valores de certificação atuais (lidos da API, não hardcoded)
