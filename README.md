# Warhammer 40k Crusade AI Manager

Sistema completo de gerenciamento de campanhas de Cruzada do Warhammer 40.000 com IA controlando a Horda inimiga, desenvolvido com um pipeline de automação baseado em **GitHub Actions**, **CodeRabbit**, **ChatGPT Codex** e **Manus AI**.

> **Repositório:** [lpazpinto/Warhammer40kcrusadeAI](https://github.com/lpazpinto/Warhammer40kcrusadeAI)

---

## Sumário

- [Status do Projeto](#-status-do-projeto)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Stack Tecnológica](#%EF%B8%8F-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Schema do Banco de Dados](#%EF%B8%8F-schema-do-banco-de-dados)
- [Como Executar Localmente](#-como-executar-localmente)
- [Como Usar](#-como-usar)
- [Development Workflow](#-development-workflow)
- [Automation / AI Stack](#-automation--ai-stack)
- [GitHub Actions Overview](#-github-actions-overview)
- [Troubleshooting](#-troubleshooting)
- [How to Validate](#-how-to-validate)
- [Convenções de Código](#-convenções-de-código)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 📋 Status do Projeto

| Campo | Valor |
|---|---|
| **Última Atualização** | Fevereiro de 2026 |
| **Status** | Em desenvolvimento ativo |
| **Versão Atual** | 1.4.0 Beta |
| **Testes** | 86 testes unitários (Vitest) |
| **Linhas de Código** | ~20.000+ |
| **Arquivos** | 130+ |

---

## 🎯 Funcionalidades Implementadas

### Gerenciamento de Campanhas
- Criação e gerenciamento de campanhas cooperativas contra a Horda
- Configuração de jogadores e facções
- Rastreamento de progresso (fases, vitórias, pontos)
- Sistema de Order of Battle completo
- Sistema de convites para jogadores
- Status de "pronto para batalha" para sincronização

### Sistema de IA da Horda
- **1200+ unidades** de 21 facções diferentes importadas do Excel
- Sistema de spawn baseado em 2D6 com modificadores por round (+1 rounds 3-4, +2 round 5+)
- Seleção automática de unidades por brackets de pontos
- **IA de movimento**: prioriza inimigo mais próximo → objetivo → borda do tabuleiro
- **IA de tiro**: seleciona alvo mais próximo dentro do alcance
- **IA de carga**: verifica armas corpo-a-corpo e distância

### Horde Mode (Seções 3.2-3.6)
- **Misery Cards**: 32 cartas de miséria com revelação automática por round (R2: 1, R3-4: 1, R5+: 3)
- **Secondary Missions**: 20 missões secundárias com resolução automática (fim do turno ou fim do round)
- Descarte automático de Misery Cards ativas no início de cada Battle Round
- Punição automática de Misery Card para missões falhadas
- Sem geração de Command Points (regra do Horde Mode)
- Objetivo primário é sobreviver (sem Primary Objectives separados)

### Order of Battle
- Parser de exército (importação do app oficial)
- Gerenciamento de unidades com modelos e armas
- Sistema de XP e progressão de ranks
- Battle Honours e Battle Scars
- **Supply Limit** (1000 pontos iniciais, expansível via requisições)
- Edição de alias de unidades

### Requisições
- Sistema completo de requisições traduzido para português
- Requisition Points (RP) tracking
- Requisições com timing (a qualquer momento, antes da batalha, após a batalha)
- Compra de requisições durante setup de batalha
- 15+ requisições implementadas

### Missões
- **16 missões oficiais** (8 Tabela A, 8 Tabela B), todas traduzidas para português
- Sistema de seleção manual ou aleatória (2D3)

### Agendas
- **5 agendas normais** e **18 agendas táticas** organizadas em 3 tabelas (A, B, C)
- Sistema de rolagem 2D6 para agendas táticas
- Estrutura completa de objetivos e recompensas em português

### Battle Traits
- **13 traits padrão** (positivos e negativos) disponíveis para todas as facções
- Framework para traits específicos por facção
- Categorias: combat, leadership, mobility, resilience, psychic

### Wizard de Batalha (5 Passos)
1. Seleção de missão (Tabela A/B, manual/aleatória)
2. Alocação de pontos e seleção de jogadores
3. Compra de requisições
4. Seleção de unidades (apenas unidades selecionadas participam)
5. Confirmação final com resumo completo

### Sistema de Batalha em Tempo Real
- **Battle Phase Tracker**: Rastreamento completo das 5 fases (Command, Movement, Shooting, Charge, Fight)
- **Turnos alternados**: Horda sempre joga primeiro, depois o jogador
- **Sub-passos detalhados** para cada fase com instruções em português
- **Persistência de estado**: Salva automaticamente fase atual e turno no banco
- **Histórico de batalha**: Log completo de spawns, destruições, compras, missões e Misery Cards
- **Restauração de batalhas**: Continue batalhas pausadas exatamente de onde parou

### Sistema de Cartas de Reabastecimento (Supply Points)
- **25 Cartas Traduzidas**: Todas as cartas oficiais em português brasileiro
- **Supply Points (SP)**: 1 SP por objetivo controlado, 1 SP por unidade Horda destruída, dobro em modo solo
- **Loja de Reabastecimento**: Interface para comprar cartas durante Fase de Comando
- **Tracking por Jogador**: Cada jogador gerencia seus próprios SP

### Unit Tracker Panel
- Rastreamento em tempo real de todas as unidades durante a batalha
- Status visual com indicadores coloridos (verde=ativo, vermelho=destruído)
- Quick Actions para marcar unidades destruídas e adicionar kills
- Rank badges com progressão (Battle Ready → Legendary)

### Sistema de XP Automático
- Cálculo automático: XP base + sobrevivência + kills
- Progressão de ranks: detecção automática de promoções (6/16/31/51 XP)
- Distribuição de RP após batalha

### Interface em Português
- Todas as telas em português (Brasil)
- Design moderno com tema escuro
- Navegação intuitiva com sidebar
- Responsivo para diferentes tamanhos de tela

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Wouter |
| **Backend** | Node.js 22, Express 4, tRPC 11, Superjson |
| **Banco de Dados** | MySQL / TiDB via Drizzle ORM |
| **Autenticação** | Manus OAuth |
| **Testes** | Vitest |
| **CI/CD** | GitHub Actions |
| **Code Review** | CodeRabbit, ChatGPT Codex |
| **Agente de Desenvolvimento** | Manus AI |

---

## 📁 Estrutura do Projeto

```
├── .github/
│   └── workflows/
│       ├── ci.yml                              # CI: lint, test, build
│       ├── manus_autopilot_coderabbit.yml      # Autopilot: review bots → Manus
│       ├── manus_autopilot_checks.yml          # Autopilot: CI falhou → Manus
│       └── enable_auto_merge_after_checks.yml  # Auto-merge de PRs manus/*
├── client/
│   ├── src/
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── components/     # Componentes reutilizáveis (battle, UI, etc.)
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities e configurações (trpc client)
├── server/
│   ├── routers.ts          # Endpoints tRPC
│   ├── db.ts               # Database queries
│   ├── armyParser.ts       # Parser de exército
│   ├── hordeSpawn.ts       # Sistema de spawn da Horda
│   ├── hordeAI.ts          # IA da Horda
│   └── postBattle.ts       # Lógica pós-batalha
├── shared/
│   ├── agendas.ts          # Sistema de agendas (5 normais + 18 táticas)
│   ├── missions.ts         # 16 missões oficiais traduzidas
│   ├── secondaryMissions.ts # 20 missões secundárias do Horde Mode
│   ├── miseryCards.ts      # 32 Misery Cards do Horde Mode
│   ├── requisitions.ts     # Sistema de requisições
│   ├── battleTraits.ts     # Battle traits (13 padrão + por facção)
│   ├── resupplyCards.ts    # 25 cartas de reabastecimento traduzidas
│   └── types.ts            # Tipos compartilhados
├── drizzle/
│   └── schema.ts           # Schema do banco de dados
└── README.md
```

---

## 🗄️ Schema do Banco de Dados

### Principais Tabelas

| Tabela | Descrição |
|---|---|
| **campaigns** | Campanhas de Crusade |
| **players** | Jogadores (Lord Commanders) |
| **crusadeUnits** | Unidades do Order of Battle |
| **models** | Modelos individuais de cada unidade |
| **weapons** | Armas de cada modelo |
| **battleHonours** | Honras de batalha |
| **battleScars** | Cicatrizes de batalha |
| **battles** | Registro de batalhas com estado persistente |
| **battleParticipants** | Participantes e unidades deployadas (com SP tracking) |
| **battleEvents** | Eventos durante batalhas (em desenvolvimento) |
| **resupplyCards** | Definições de 25 cartas de reabastecimento |
| **purchasedCards** | Histórico de compras de cartas por batalha |

---

## 🚀 Como Executar Localmente

### Pré-requisitos

1. **Node.js 22.x ou superior** — https://nodejs.org/
2. **pnpm** — `npm install -g pnpm`
3. **Git** — https://git-scm.com/
4. **MySQL** (opcional — pode usar o banco do Manus) — https://dev.mysql.com/downloads/mysql/

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/lpazpinto/Warhammer40kcrusadeAI.git
cd Warhammer40kcrusadeAI

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
# Copie .env.example para .env e preencha (ver seção abaixo)

# 4. Executar migrações
pnpm db:push

# 5. Iniciar servidor de desenvolvimento
pnpm dev

# 6. Acessar aplicação
# http://localhost:3000
```

### Variáveis de Ambiente (.env)

```env
DATABASE_URL=mysql://root:@localhost:3306/crusade_db
JWT_SECRET=qualquer_texto_longo_e_aleatorio_aqui_12345
VITE_APP_TITLE=Warhammer 40k Crusade AI Manager
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_NAME=Seu Nome
```

> **Nota:** Para produção com OAuth funcionando, publique no Manus — todas as variáveis serão configuradas automaticamente.

---

## 🎯 Como Usar

### 1. Criar Campanha
Faça login → "Nova Campanha" → Escolha facção da Horda, modo de jogo e limite de pontos.

### 2. Adicionar Jogadores
Acesse a campanha → "Adicionar Jogador" → Preencha nome, facção e destacamento.

### 3. Importar Lista
Na página do jogador → "Importar Lista" → Cole o conteúdo do `.txt` exportado do app oficial. Crusade Cards serão criados automaticamente.

### 4. Jogar Batalha
"Iniciar Batalha" → Configure missão, pontos, requisições e unidades → Sistema faz spawn automático e controla a IA → Registre resultados → XP e honours atualizados automaticamente.

---

## 🔄 Development Workflow

Todo o desenvolvimento segue um fluxo baseado em **branches e Pull Requests**. Commits diretos na `main` são proibidos.

### Fluxo Obrigatório

```
main ──┬── manus/feature-xyz ──► PR ──► Review (CodeRabbit + Codex) ──► CI verde ──► Merge (squash)
       │
       └── manus/fix-abc ──────► PR ──► Review ──► CI verde ──► Merge (squash)
```

**Passo a passo:**

1. **Criar branch a partir de `main`:**
   ```bash
   git checkout main
   git pull
   git checkout -b manus/<tema-curto>
   ```

2. **Fazer as mudanças e commitar na branch:**
   ```bash
   git add -A
   git commit -m "<mensagem clara>"
   git push -u origin HEAD
   ```

3. **Abrir um Pull Request para `main`:**
   ```bash
   gh pr create --base main --head manus/<tema-curto> \
     --title "<título>" \
     --body "Resumo das mudanças

   Como testar: pnpm test

   @coderabbitai review"
   ```

4. **Aguardar reviews automáticos** do CodeRabbit e do ChatGPT Codex. Se houver feedback acionável, o Manus será acionado automaticamente para implementar as correções.

5. **Verificar CI verde** (lint, test, build). Se o CI falhar em um PR `manus/*`, o Manus será acionado automaticamente para corrigir.

6. **Merge automático** (squash): PRs `manus/*` com checks verdes e sem conflitos são mergeados automaticamente pelo workflow de auto-merge.

> **Regra de ouro:** Nunca faça push direto na `main`. Sempre use o fluxo branch → PR → review → CI → merge.

---

## 🤖 Automation / AI Stack

Este repositório utiliza um pipeline de automação com três camadas de IA que trabalham em conjunto, orquestradas por GitHub Actions.

### Visão Geral do Pipeline

```
PR aberto
  │
  ├──► CodeRabbit faz review automático
  │       └──► Posta comentários com sugestões
  │
  ├──► ChatGPT Codex faz review automático
  │       └──► Posta "Codex Review" com sugestões de lógica
  │
  └──► GitHub Actions detecta feedback dos bots
          │
          ├── Debounce de 15 minutos (evita placeholder do CodeRabbit)
          ├── Filtra feedback "actionable" (ignora "reviewing...", "in progress...")
          │
          └──► Manus AI recebe o feedback agregado
                  │
                  ├── Lê TODOS os comentários do PR (todas as threads)
                  ├── Implementa as correções necessárias
                  ├── Faz push na mesma branch do PR
                  └── Comenta no PR o que foi feito
```

### 1. CodeRabbit (`coderabbitai`)

CodeRabbit faz review automático de cada Pull Request. Ele analisa o diff e posta comentários com sugestões de melhoria, bugs potenciais, problemas de estilo e segurança.

**Comportamento importante:** O CodeRabbit frequentemente posta um comentário "placeholder" inicial (ex.: "I'm reviewing this PR...") e depois edita ou posta os comentários completos. O pipeline lida com isso através de um debounce de 15 minutos.

### 2. ChatGPT Codex (`chatgpt-codex-connector`)

O ChatGPT Codex também faz review automático, postando um comentário "Codex Review" no PR. As sugestões do Codex tendem a focar em **lógica de negócio** além de estilo e bugs, complementando o CodeRabbit.

### 3. Manus AI (Agente de Desenvolvimento)

O Manus é o agente que **implementa** as mudanças. Ele é acionado automaticamente em dois cenários:

- **Feedback de review:** Quando CodeRabbit ou Codex postam feedback acionável, o Manus recebe um prompt agregado com todo o feedback e implementa as correções na mesma branch do PR.
- **Falha de CI:** Quando o CI ou CodeQL falham em um PR `manus/*`, o Manus é acionado para identificar e corrigir o primeiro erro.

### Proteções Anti-Loop

O pipeline usa **labels** no GitHub para evitar loops e tasks duplicadas:

| Label | Significado |
|---|---|
| `manus-feedback-pending` | Debounce em andamento (15 min). Não disparar outra task. |
| `manus-busy` | Task do Manus em andamento. Não criar nova task. |

O label `manus-busy` é adicionado antes de criar a task e removido quando os checks passam. Se o CI falhar e o PR já estiver com `manus-busy`, nenhuma task adicional é criada.

---

## ⚙️ GitHub Actions Overview

O repositório possui 4 workflows ativos:

### 1. `CI` (`ci.yml`)

| Campo | Valor |
|---|---|
| **Trigger** | `push` em `main`, qualquer `pull_request`, `workflow_dispatch` |
| **Runner** | `ubuntu-latest` |
| **Node** | 20 |
| **Steps** | Checkout → Setup Node → Enable pnpm (Corepack) → Install deps → Lint → Test → Build |

Este é o workflow principal de integração contínua. Executa lint (se presente), testes e build para garantir que o código está funcional.

### 2. `Manus Autopilot (CodeRabbit + Codex)` (`manus_autopilot_coderabbit.yml`)

| Campo | Valor |
|---|---|
| **Trigger** | `issue_comment` (created/edited), `pull_request_review_comment` (created/edited), `pull_request_review` (submitted/edited) |
| **Filtro de Autor** | Apenas bots: `coderabbitai`, `coderabbitai[bot]`, `chatgpt-codex-connector`, `chatgpt-codex-connector[bot]` |
| **Debounce** | 15 minutos após o primeiro comentário detectado |
| **Heurística** | Ignora comentários curtos ("reviewing", "in progress"); considera actionable se contém sinais como "should", "fix", "bug", "security", "nitpick", "finishing touches", ou se o texto tem 600+ caracteres |
| **Labels** | `manus-feedback-pending` (debounce), `manus-busy` (task ativa) |
| **Ação** | Agrega feedback das últimas 24h dos bots e cria task no Manus com prompt instruindo a ler TODO o feedback do PR |

### 3. `Manus Autopilot (checks)` (`manus_autopilot_checks.yml`)

| Campo | Valor |
|---|---|
| **Trigger** | `workflow_run` quando `CI` ou `CodeQL` completam |
| **Condição de Ação** | Check falhou (`failure`, `cancelled`, `timed_out`, `action_required`) em PR `manus/*` que está open e não draft |
| **Em caso de sucesso** | Remove label `manus-busy` e comenta no PR que o autopilot foi liberado |
| **Em caso de falha** | Adiciona label `manus-busy` e cria task no Manus para corrigir o primeiro erro do run |

### 4. `Auto-merge Manus PRs` (`enable_auto_merge_after_checks.yml`)

| Campo | Valor |
|---|---|
| **Trigger** | `workflow_run` quando `CI` ou `CodeQL` completam com sucesso |
| **Condição** | PR é `manus/*`, está open, não é draft, checks verdes, `mergeable_state == clean` |
| **Método** | Squash merge |
| **Retry** | Até 12 tentativas com 5s de intervalo (GitHub pode demorar para calcular `mergeable_state`) |
| **Conflitos** | Se `mergeable_state == dirty`, comenta no PR que não fez merge |
| **Falha de API** | Comenta no PR pedindo merge manual |

### Diagrama de Fluxo dos Workflows

```
PR criado/atualizado
  │
  ├──► CI roda (lint + test + build)
  │       │
  │       ├── ✅ Success ──► Auto-merge tenta squash (se manus/*)
  │       │                    └── Remove manus-busy
  │       │
  │       └── ❌ Failure ──► Manus Autopilot (checks) cria task para corrigir
  │                            └── Adiciona manus-busy
  │
  └──► CodeRabbit / Codex postam review
          │
          ├── Debounce 15 min
          ├── Filtra actionable
          │
          └──► Manus Autopilot (CodeRabbit + Codex) cria task
                 └── Adiciona manus-busy
```

---

## 🔧 Troubleshooting

### Problema: Placeholder do CodeRabbit gera task vazia no Manus

**Sintoma:** O CodeRabbit posta um comentário inicial curto ("I'm reviewing this PR...") e o Manus é acionado antes do review real chegar.

**Solução:** O workflow `manus_autopilot_coderabbit.yml` implementa um debounce de 15 minutos. Após detectar o primeiro comentário de bot, ele espera 15 minutos e só então verifica se há feedback acionável. Comentários curtos como "reviewing", "in progress" e "starting review" são filtrados pela heurística.

---

### Problema: Múltiplas tasks do Manus em loop

**Sintoma:** O Manus faz push de correções, o que dispara novos reviews do CodeRabbit, que disparam novas tasks do Manus, criando um loop.

**Solução:** O sistema usa duas labels de proteção:
- `manus-feedback-pending` — indica que o debounce está em andamento; nenhuma nova task é criada enquanto esta label existir.
- `manus-busy` — indica que já existe uma task do Manus em andamento; o workflow não cria outra task.

A label `manus-busy` é removida automaticamente quando os checks passam (via `manus_autopilot_checks.yml`).

---

### Problema: PR com `mergeable_state` unstable/unknown

**Sintoma:** O auto-merge não executa mesmo com checks verdes. O GitHub reporta `mergeable_state` como "unknown" ou "unstable".

**Solução:** O workflow `enable_auto_merge_after_checks.yml` implementa um retry com até 12 tentativas (intervalo de 5 segundos cada). O GitHub pode demorar alguns minutos para calcular o `mergeable_state` após os checks completarem. Na maioria dos casos, o retry resolve automaticamente.

Se persistir, verifique:
- Se há branch protection rules conflitantes
- Se há required reviews pendentes
- Se o PR tem conflitos com `main`

---

### Problema: PR com conflitos (`mergeable_state == dirty`)

**Sintoma:** O auto-merge comenta no PR que não executou por causa de conflitos.

**Solução:** Resolva os conflitos manualmente:
```bash
git checkout manus/<branch>
git pull origin main
# Resolver conflitos
git add -A
git commit -m "Resolve merge conflicts"
git push
```

---

### Problema: CI falha por variável de ambiente ausente

**Sintoma:** O CI falha com erro de variável de ambiente não encontrada (ex.: `DATABASE_URL`).

**Solução:** O Manus Autopilot (checks) detecta essa situação e, em vez de tentar corrigir, comenta no PR indicando qual variável ou serviço está faltando. Nesse caso, adicione o secret necessário em **Settings → Secrets and variables → Actions** no GitHub.

---

### Problema: Merge manual necessário

**Sintoma:** O auto-merge falha na API do GitHub e comenta pedindo merge manual.

**Solução:** Faça o merge manualmente pela interface do GitHub ou via CLI:
```bash
gh pr merge <PR_NUMBER> --squash
```

---

## ✅ How to Validate

### Comandos Disponíveis

| Comando | Descrição |
|---|---|
| `pnpm install` | Instalar dependências |
| `pnpm dev` | Iniciar servidor de desenvolvimento (http://localhost:3000) |
| `pnpm test` | Executar testes unitários (Vitest — 86 testes) |
| `pnpm run build` | Build de produção (Vite + esbuild) |
| `pnpm run check` | Type-check com TypeScript (`tsc --noEmit`) |
| `pnpm run format` | Formatar código com Prettier |
| `pnpm db:push` | Gerar e aplicar migrações do banco (Drizzle) |

### Validação Rápida

```bash
# Instalar dependências
pnpm install

# Rodar testes
pnpm test

# Verificar tipos
pnpm run check

# Build completo
pnpm run build
```

### O que o CI Executa

O workflow de CI (`ci.yml`) executa os seguintes passos em sequência. Se qualquer um falhar, o PR não pode ser mergeado:

1. `pnpm install --no-frozen-lockfile`
2. `pnpm run --if-present lint`
3. `pnpm run --if-present test`
4. `pnpm run --if-present build`

> **Nota:** Os comandos usam `--if-present`, então se um script não existir no `package.json`, o step é pulado sem erro.

---

## 📊 21 Facções Implementadas

Adepta Sororitas, Adeptus Custodes, Adeptus Mechanicus, Aeldari, Astra Militarum, Chaos Daemons, Chaos Knights, Chaos Space Marines, Death Guard, Drukhari, Genestealer Cults, Grey Knights, Imperial Knights, Leagues of Votann, Necrons, Orks, Space Marines, T'au Empire, Thousand Sons, Tyranids, World Eaters

---

## 📝 Convenções de Código

### Commits
- Mensagens descritivas em inglês
- Formato: `feat/fix/chore: <descrição>`
- Incluir lista de mudanças no corpo do commit
- Sempre via branch → PR (nunca direto na `main`)

### Código
- TypeScript strict mode
- Componentes funcionais com hooks
- tRPC para todas as chamadas de API
- Superjson para serialização
- Prettier para formatação

---

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas. Abra uma issue para discutir mudanças. Ao contribuir, siga o [Development Workflow](#-development-workflow) descrito acima.

---

## 📄 Licença

Gerenciador não oficial para Warhammer 40.000. Warhammer 40.000 é marca registrada da Games Workshop Ltd.

---

*"In the grim darkness of the far future, there is only war... and good project management!"*
