# Runbook de Deploy — Warhammer 40K Crusade AI Manager

> **Estado:** Documento de migração — reflete o período de transição da plataforma Manus para hospedagem independente.
> Para contexto completo sobre a estratégia de saída, consulte [`docs/exit-manus/00-executive-summary.md`](exit-manus/00-executive-summary.md).

*Última atualização: Fevereiro 2026*

---

## Sumário

1. [Contexto de Migração](#contexto-de-migração)
2. [Pré-requisitos](#pré-requisitos)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Deploy Node.js (Baseline)](#deploy-nodejs-baseline)
5. [Deploy Docker (Opcional)](#deploy-docker-opcional)
6. [Banco de Dados](#banco-de-dados)
7. [Monitoramento e Health Checks](#monitoramento-e-health-checks)
8. [Troubleshooting](#troubleshooting)
9. [Cutover Checklist](#cutover-checklist)
10. [Exemplos de Provedores (Sem Lock-in)](#exemplos-de-provedores-sem-lock-in)

---

## Contexto de Migração

Este runbook documenta como implantar a aplicação **fora da plataforma Manus**, de forma agnóstica a provedores. O projeto está em período de transição, o que significa que algumas dependências da plataforma Manus ainda existem no código e serão removidas progressivamente.

A arquitetura escolhida é **monolito** (Express serve API + assets estáticos), conforme documentado em [`docs/exit-manus/decisions/ADR-0001-deploy.md`](exit-manus/decisions/ADR-0001-deploy.md). O servidor Express entrega tanto a API tRPC (em `/api/trpc`) quanto o frontend React (SPA com fallback para `index.html`).

**Issues relacionadas que afetam este runbook:**

| Issue | Impacto |
|---|---|
| [#38 — Dockerfile multi-stage + /healthz](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/38) | Configuração Docker (já mergeada) |
| [#40 — Auth GitHub OAuth (plano)](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/40) | Plano de migração OAuth (concluído) |
| [#41 — Implementar GitHub OAuth + sessão](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/41) | GitHub OAuth implementado (concluído) |
| [#56 — Remover Manus OAuth](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/56) | Remoção completa do OAuth Manus |

---

## Pré-requisitos

| Requisito | Versão | Referência |
|---|---|---|
| **Node.js** | 20.11+ (LTS recomendado) | `Dockerfile:2` — `node:20-alpine`; projeto usa `import.meta.dirname` (requer >= 20.11) |
| **pnpm** | 10.4.1 | `package.json` — campo `packageManager` |
| **MySQL** | 8.0+ ou TiDB (MySQL-compatível) | `drizzle.config.ts` — dialect `mysql` |
| **Git** | Qualquer versão recente | Para clonar o repositório |

Para habilitar o pnpm via corepack (incluído no Node.js 20+):

```bash
corepack enable
corepack prepare pnpm@10.4.1 --activate
```

---

## Variáveis de Ambiente

### Core (Permanentes)

Estas variáveis são fundamentais para o funcionamento da aplicação independentemente do provedor de autenticação.

| Variável | Obrigatória | Default | Descrição | Referência |
|---|---|---|---|---|
| `DATABASE_URL` | Sim | — | Connection string MySQL/TiDB no formato `mysql://user:pass@host:port/database` | `server/_core/env.ts:4` |
| `JWT_SECRET` | Sim | — | Segredo para assinatura de cookies de sessão. Deve ser uma string longa e aleatória (mínimo 32 caracteres). | `server/_core/env.ts:3` |
| `PORT` | Não | `3000` | Porta HTTP do servidor. Se ocupada, o servidor tenta automaticamente até +20 portas acima. | `server/_core/index.ts` |
| `NODE_ENV` | Não | — | Definir como `production` para deploy. Controla modo de execução (Vite dev vs. static serving). | `server/_core/env.ts:7` |
| `OWNER_OPEN_ID` | Não | — | OpenID do proprietário. Usuários com este ID recebem role `admin` automaticamente no primeiro login. | `server/_core/env.ts:6` |

### GitHub OAuth

A autenticação é feita via GitHub OAuth. Crie um OAuth App em https://github.com/settings/developers.

| Variável | Obrigatória | Descrição | Referência |
|---|---|---|---|
| `GITHUB_CLIENT_ID` | Sim | Client ID do GitHub OAuth App | `server/_core/env.ts` |
| `GITHUB_CLIENT_SECRET` | Sim | Client Secret do GitHub OAuth App | `server/_core/env.ts` |
| `GITHUB_CALLBACK_URL` | Sim | URL de callback (ex: `https://seudominio.com/api/oauth/github/callback`) | `server/_core/env.ts` |
| `APP_ID` | Não | Identificador da aplicação usado em JWT. Default: `crusade-ai` | `server/_core/env.ts` |

### Cliente (Vite)

Variáveis prefixadas com `VITE_` são injetadas no bundle do frontend em tempo de build. Elas **não são secretas** e ficam visíveis no código-fonte do cliente.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_APP_TITLE` | Não | Título exibido no header e login |
| `VITE_APP_LOGO` | Não | URL da imagem do logo |
| `VITE_ANALYTICS_ENDPOINT` | Não | Endpoint de analytics (se configurado) |
| `VITE_ANALYTICS_WEBSITE_ID` | Não | ID do website no serviço de analytics |

### Integração (Opcionais)

| Variável | Descrição | Referência |
|---|---|---|
| `BUILT_IN_FORGE_API_URL` | URL da API Forge (LLM, storage, etc.) | `server/_core/env.ts:8` |
| `BUILT_IN_FORGE_API_KEY` | Bearer token para API Forge | `server/_core/env.ts:9` |

> **Nota de segurança:** Nunca commite arquivos `.env` no repositório. Use o gerenciador de segredos do seu provedor de hospedagem ou variáveis de ambiente do sistema operacional.

---

## Deploy Node.js (Baseline)

Este é o **método recomendado** para deploy durante a fase de migração. É o mais simples, portável, e funciona em qualquer plataforma que suporte Node.js (Railway, Render, Heroku, VPS, etc.).

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/lpazpinto/Warhammer40kcrusadeAI.git
cd Warhammer40kcrusadeAI

# 2. Instalar dependências
pnpm install --frozen-lockfile

# 3. Configurar variáveis de ambiente
cp .env.example .env   # se existir, ou criar manualmente
# Editar .env com os valores corretos (ver seção Variáveis de Ambiente)

# 4. Build do frontend (Vite) e backend (esbuild)
pnpm build
# Gera: dist/client/ (assets estáticos) e dist/server/index.js (servidor)

# 5. Executar migrações do banco de dados
pnpm db:push
# Executa: drizzle-kit generate && drizzle-kit migrate

# 6. Iniciar o servidor em modo produção
pnpm start
# Executa: NODE_ENV=production node dist/server/index.js
```

### Estrutura de build

Após `pnpm build`, a pasta `dist/` contém:

```text
dist/
├── client/          ← Assets estáticos (HTML, CSS, JS) gerados pelo Vite
│   ├── index.html
│   └── assets/
└── server/
    └── index.js     ← Bundle do servidor (Express + tRPC) gerado pelo esbuild
```

### Gerenciadores de processo (produção)

Para ambientes de produção, é recomendável usar um gerenciador de processo para reinício automático e gerenciamento de logs.

**PM2:**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar com PM2
pm2 start dist/server/index.js --name crusade-manager

# Configurar para iniciar com o sistema
pm2 startup
pm2 save
```

**systemd (Linux):**

```ini
[Unit]
Description=Warhammer 40K Crusade AI Manager
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/crusade-manager
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/opt/crusade-manager/.env
ExecStart=/usr/bin/node dist/server/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## Deploy Docker (Opcional)

O projeto inclui um Dockerfile multi-stage que gera uma imagem de produção otimizada. Este método é uma alternativa ao deploy Node.js direto, ideal para ambientes que já utilizam containers.

> **Referência:** Configuração Docker implementada na issue [#38](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/38).

### Arquitetura do Dockerfile

O Dockerfile utiliza duas stages:

| Stage | Base | Função |
|---|---|---|
| **builder** | `node:20-alpine` | Instala todas as dependências (incluindo dev), executa `pnpm build` |
| **runtime** | `node:20-alpine` | Apenas dependências de produção, copia `dist/` do builder, roda como usuário não-root (`appuser`) |

### Comandos

```bash
# Build da imagem
docker build -t crusade-manager .

# Executar com variáveis de ambiente
docker run -d \
  --name crusade-manager \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:pass@host:3306/dbname" \
  -e JWT_SECRET="sua-chave-secreta-longa" \
  -e GITHUB_CLIENT_ID="seu-github-client-id" \
  -e GITHUB_CLIENT_SECRET="seu-github-client-secret" \
  -e GITHUB_CALLBACK_URL="https://seudominio.com/api/oauth/github/callback" \
  -e NODE_ENV=production \
  crusade-manager

# Ou usando arquivo .env
docker run -d \
  --name crusade-manager \
  -p 3000:3000 \
  --env-file .env \
  crusade-manager
```

### docker-compose.yml (referência)

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

> **Nota:** O Dockerfile não inclui instrução `HEALTHCHECK` nativa. O health check é exposto via endpoint HTTP (`GET /healthz`) e deve ser configurado no orquestrador (Docker Compose, Kubernetes, ou painel do provedor).

---

## Banco de Dados

### Requisitos

A aplicação utiliza **MySQL 8.0+** ou **TiDB** (compatível com protocolo MySQL). O ORM é **Drizzle** com dialect `mysql`, conforme definido em `drizzle.config.ts`.

### Formato da connection string

```plaintext
mysql://usuario:senha@host:porta/nome_do_banco
```

Exemplo para TiDB Cloud (com SSL):

```plaintext
mysql://user:pass@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/crusade?ssl={"rejectUnauthorized":true}
```

### Migrações

O comando `pnpm db:push` executa duas operações em sequência:

1. `drizzle-kit generate` — gera arquivos de migração SQL a partir do schema em `drizzle/schema.ts`
2. `drizzle-kit migrate` — aplica as migrações pendentes no banco de dados

```bash
# Executar migrações (requer DATABASE_URL configurado)
pnpm db:push
```

### Seed de dados (opcional)

O projeto inclui um script de seed para popular as cartas de resupply:

```bash
node scripts/seed-resupply-cards.mjs
```

### Conexão lazy

A aplicação utiliza conexão lazy com o banco de dados (`server/db.ts`). Isso significa que o servidor **inicia normalmente** mesmo sem banco de dados disponível, operando em modo degradado. Funcionalidades que dependem do banco retornarão erros, mas o health check e rotas estáticas continuarão funcionando.

---

## Monitoramento e Health Checks

### Endpoints disponíveis

| Endpoint | Método | Resposta | Descrição |
|---|---|---|---|
| `/healthz` | GET | `{"status": "ok"}` (200) | Health check HTTP simples. Disponível mesmo sem `dist/client/` (modo degradado). |
| `/api/trpc/system.health` | GET | Resposta tRPC | Health check via tRPC (requer stack completa). |

O endpoint `/healthz` é registrado **antes** da verificação do diretório de build, garantindo que esteja disponível mesmo quando a aplicação está em modo degradado (sem assets estáticos).

### Prefixos de log

A aplicação utiliza prefixos consistentes nos logs para facilitar filtragem e diagnóstico:

| Prefixo | Módulo | Exemplo |
|---|---|---|
| `[Database]` | Conexão e queries | `[Database] Failed to connect: ...` |
| `[OAuth]` | Autenticação GitHub | `[OAuth] GitHub OAuth callback processed` |
| `[Auth]` | Sessão e JWT | `[Auth] Invalid token: ...` |
| `[Static]` | Serving de arquivos | `[Static] Could not find the build directory: ...` |

### Configuração no provedor

A maioria dos provedores PaaS permite configurar health checks via dashboard. Configure o endpoint `GET /healthz` com intervalo de 30 segundos e timeout de 5 segundos como ponto de partida.

---

## Troubleshooting

### Conexão com banco de dados

**Sintoma:** Logs com `[Database] Failed to connect` ou `[Database] Cannot upsert user: database not available`.

**Causas e resoluções:**

| Causa | Resolução |
|---|---|
| `DATABASE_URL` não definido ou vazio | Verificar variáveis de ambiente no provedor |
| Servidor MySQL/TiDB inacessível | Verificar firewall, security groups, e IP allowlist |
| Credenciais inválidas | Testar conexão com `mysql -u user -p -h host -P port` |
| SSL necessário (TiDB Cloud) | Adicionar `?ssl={"rejectUnauthorized":true}` à connection string |

### Configuração OAuth

**Sintoma:** Login redireciona para página de erro ou retorna 401.

**Causas e resoluções:**

| Causa | Resolução |
|---|---|
| `GITHUB_CLIENT_ID` não configurado | Criar OAuth App em https://github.com/settings/developers e definir o Client ID |
| `GITHUB_CLIENT_SECRET` incorreto | Verificar o Client Secret no painel do GitHub OAuth App |
| `GITHUB_CALLBACK_URL` não registrada | Registrar `https://seudominio.com/api/oauth/github/callback` no GitHub OAuth App |

### Diretório de build ausente

**Sintoma:** Log `[Static] Could not find the build directory` — servidor inicia mas retorna 404 para todas as rotas do frontend.

**Resolução:** Executar `pnpm build` antes de `pnpm start`. Verificar que `dist/client/` e `dist/server/index.js` existem.

### Porta em uso

**Sintoma:** Servidor inicia em porta diferente da esperada.

**Explicação:** O servidor tenta automaticamente até +20 portas acima da porta configurada se a porta base estiver ocupada. Verifique os logs para confirmar em qual porta o servidor iniciou.

### Sessão e autenticação

**Sintoma:** Usuários são deslogados inesperadamente ou cookies não funcionam.

**Causas e resoluções:**

| Causa | Resolução |
|---|---|
| `JWT_SECRET` alterado entre deploys | Manter o mesmo `JWT_SECRET` entre restarts — alterá-lo invalida todas as sessões ativas |
| Cookies não persistem | Verificar se o domínio e path dos cookies estão corretos para o ambiente |

### Rate limiting (429)

**Sintoma:** Resposta HTTP 429 em rotas do frontend.

**Explicação:** O SPA catch-all possui rate limiting de **120 requisições por minuto por IP**. Em uso normal, isso não é atingido. Se ocorrer, pode indicar um bot ou loop de requisições no frontend.

---

## Cutover Checklist

Lista de verificação para migração de produção. Copie este checklist para uma issue ou documento de acompanhamento.

### Pré-cutover

- [ ] Banco de dados provisionado (MySQL 8+ ou TiDB)
- [ ] Connection string testada localmente (`pnpm db:push` funciona)
- [ ] DNS configurado (se usando domínio customizado)
- [ ] Variáveis de ambiente configuradas no provedor (ver seção acima)
- [ ] Build local bem-sucedido (`pnpm build` sem erros)
- [ ] Testes passando (`pnpm test`)
- [ ] OAuth callback URL registrada para o novo domínio

### Cutover

- [ ] Executar migrações no banco de produção (`pnpm db:push`)
- [ ] Executar seed de dados se necessário (`node scripts/seed-resupply-cards.mjs`)
- [ ] Deploy da aplicação (Node.js direto ou Docker)
- [ ] Verificar health check: `curl https://seudominio.com/healthz`
- [ ] Testar login OAuth (fluxo completo de autenticação)
- [ ] Verificar que o frontend carrega corretamente
- [ ] Verificar que a API tRPC responde (`/api/trpc/system.health`)

### Pós-cutover

- [ ] Monitorar logs por 30 minutos (erros de conexão, OAuth, etc.)
- [ ] Verificar funcionalidades críticas (criar campanha, iniciar batalha)
- [ ] Confirmar que dados persistem após restart
- [ ] Documentar procedimento de rollback (se necessário, reverter DNS ou redeployar versão anterior)
- [ ] Comunicar equipe sobre o novo ambiente

---

## Exemplos de Provedores (Sem Lock-in)

> **Nota:** Os exemplos abaixo são apenas referências. A aplicação é agnóstica a provedores e funciona em qualquer plataforma que suporte Node.js 20+ e MySQL. Escolha o provedor que melhor atende suas necessidades de custo, localização e suporte.

### Railway

[Railway](https://railway.app) suporta deploy via Dockerfile ou Nixpacks (detecção automática de Node.js). O plano Hobby custa $5/mês com créditos incluídos.

**Configuração:**

1. Conectar repositório GitHub no dashboard do Railway
2. Railway detecta automaticamente o `Dockerfile` ou usa Nixpacks
3. Configurar variáveis de ambiente na aba "Variables"
4. Railway expõe a porta automaticamente (não precisa configurar `PORT`)
5. Configurar health check em Settings → Health Check Path: `/healthz`

### Render

[Render](https://render.com) suporta Web Services com Docker ou Node.js nativo. O plano gratuito tem limitações de sleep; o plano Starter é $7/mês.

**Configuração:**

1. Criar Web Service conectado ao repositório GitHub
2. Escolher "Docker" (usa `Dockerfile`) ou "Node" (configurar build/start commands)
3. Se Node.js: Build Command = `pnpm install && pnpm build`, Start Command = `pnpm start`
4. Configurar variáveis de ambiente na aba "Environment"
5. Health Check Path: `/healthz`

### TiDB Cloud (Banco de Dados)

[TiDB Cloud](https://tidbcloud.com) oferece um tier Serverless gratuito compatível com MySQL, ideal para começar sem custo.

**Configuração:**

1. Criar cluster Serverless no dashboard do TiDB Cloud
2. Copiar connection string (formato MySQL padrão)
3. Adicionar `?ssl={"rejectUnauthorized":true}` à connection string
4. Definir como `DATABASE_URL` nas variáveis de ambiente do provedor

---

## Referências Internas

| Documento | Descrição |
|---|---|
| [`docs/exit-manus/00-executive-summary.md`](exit-manus/00-executive-summary.md) | Resumo executivo da estratégia de saída |
| [`docs/exit-manus/01-step-by-step-plan.md`](exit-manus/01-step-by-step-plan.md) | Plano passo a passo de migração |
| [`docs/exit-manus/decisions/ADR-0001-deploy.md`](exit-manus/decisions/ADR-0001-deploy.md) | ADR: Railway + Monolito + TiDB |
| [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | Arquitetura do projeto |
| [`docs/DOMAIN.md`](DOMAIN.md) | Regras de domínio e entidades |
