# Plano de Migração — GitHub OAuth

> **Status:** Planejamento  
> **Issue:** [#40 — PR 3.1 Auth GitHub OAuth (plan-first)](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/40)  
> **Parent Epic:** [#34 — Epic: rodar fora do Manus](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/34)  
> **ADR relacionada:** [ADR-0001 — Deploy Infrastructure Decision](decisions/ADR-0001-deploy.md)

*Última atualização: 28 de fevereiro de 2026*

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Decisões de Design](#decisões-de-design)
3. [Fluxo OAuth do GitHub](#fluxo-oauth-do-github)
4. [Estratégia de Rotas](#estratégia-de-rotas)
5. [Gerenciamento de Sessões e Cookies](#gerenciamento-de-sessões-e-cookies)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [Configuração no GitHub](#configuração-no-github)
8. [Estratégia de Rollout Paralelo](#estratégia-de-rollout-paralelo)
9. [Migração de Dados de Usuários](#migração-de-dados-de-usuários)
10. [Checklist de Validação Pré-Implementação](#checklist-de-validação-pré-implementação)
11. [Checklist de Validação Pós-Implementação](#checklist-de-validação-pós-implementação)
12. [Riscos e Mitigações](#riscos-e-mitigações)
13. [Procedimento de Rollback](#procedimento-de-rollback)

---

## Visão Geral

Este documento planeja a migração do sistema de autenticação de **Manus OAuth** para **GitHub OAuth**, conforme definido na Fase 3 do [plano de migração](01-step-by-step-plan.md). O objetivo é substituir o provider de autenticação com mínimo risco, mantendo compatibilidade com a infraestrutura existente de sessões JWT e cookies.

A migração será feita em duas etapas (PRs):

| PR | Objetivo | Referência |
|---|---|---|
| **PR 3.1** | Introduzir GitHub OAuth **em paralelo** ao Manus OAuth | [#40](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/40) |
| **PR 3.2** | Remover Manus OAuth após período de estabilização | [#41](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/41) |

A abordagem paralela garante que o sistema de autenticação existente continue funcionando durante toda a transição, eliminando risco de downtime de autenticação.

---

## Decisões de Design

### Escolha da biblioteca OAuth

| Opção | Veredicto | Justificativa |
|---|---|---|
| **Implementação direta (`fetch`)** | **Escolhida** | Mantém consistência com o padrão atual do codebase (`sdk.ts`, `oauth.ts`), minimiza dependências novas, e permite reutilizar a estrutura existente com modificações pontuais. |
| `@octokit/oauth-app` | Não escolhida | Biblioteca oficial do GitHub com helpers para fluxo OAuth, mas adiciona dependência desnecessária para um fluxo simples. |
| `passport-github2` | Não escolhida | Strategy Passport.js para GitHub OAuth, mas introduz o framework Passport inteiro como dependência, aumentando complexidade sem benefício proporcional. |

### Identificador único do usuário GitHub

| Opção | Veredicto | Justificativa |
|---|---|---|
| GitHub user ID numérico (ex: `12345678`) | Não escolhida | Não permite identificação clara do provedor de autenticação. |
| GitHub username (ex: `octocat`) | Não escolhida | Usernames podem ser alterados pelo usuário, causando inconsistência. |
| **Formato prefixado (`github:<user_id>`)** | **Escolhida** | Permite identificação clara do provedor, evita colisões futuras com outros providers, e o campo `openId` (varchar 64) comporta este formato. |

---

## Fluxo OAuth do GitHub

O fluxo de autenticação segue o padrão OAuth 2.0 Authorization Code Grant:

```text
┌──────────┐     1. Redirect      ┌──────────────┐
│  Browser  │ ──────────────────► │ GitHub Login  │
│ (Cliente) │                     │    Page       │
└──────────┘                     └──────────────┘
      ▲                                  │
      │                          2. Callback com
      │                             `code` + `state`
      │                                  │
      │                                  ▼
      │                          ┌──────────────┐
      │    4. Set cookie         │   Servidor    │
      │◄─────────────────────── │  (Express)    │
      │    (app_session_id)      │              │
      │                          └──────────────┘
      │                                  │
      │                          3. Token exchange
      │                             + User info
      │                                  │
      │                                  ▼
      │                          ┌──────────────┐
      │                          │  GitHub API   │
      │                          └──────────────┘
```

### Endpoints GitHub necessários

| Endpoint | URL | Método | Descrição |
|---|---|---|---|
| Authorization | `https://github.com/login/oauth/authorize` | GET | Redireciona o usuário para a página de login do GitHub |
| Token Exchange | `https://github.com/login/oauth/access_token` | POST | Troca o `code` temporário por um `access_token` |
| User Info | `https://api.github.com/user` | GET | Obtém informações do usuário autenticado |
| User Emails | `https://api.github.com/user/emails` | GET | Obtém lista de emails do usuário (requer escopo `user:email`). Necessário porque usuários com email privado não expõem email em `/user`. |

### Escopos mínimos necessários

| Escopo | Descrição |
|---|---|
| `read:user` | Acesso de leitura ao perfil público do usuário |
| `user:email` | Acesso aos endereços de email do usuário (necessário para vincular contas) |

---

## Estratégia de Rotas

### Novas rotas (GitHub OAuth)

| Rota | Método | Descrição |
|---|---|---|
| `/api/oauth/github/login` | GET | Gera URL de autorização GitHub com parâmetro `state` para proteção CSRF e redireciona o navegador |
| `/api/oauth/github/callback` | GET | Recebe o `code` e `state` do GitHub, troca por token, obtém dados do usuário, cria/atualiza registro no banco, e define cookie de sessão |

### Rotas existentes (Manus OAuth — mantidas durante período paralelo)

| Rota | Status |
|---|---|
| `/api/oauth/callback` | **Mantida** — continua funcionando para usuários que ainda usam Manus OAuth |

### Coexistência de providers

Ambos os providers compartilham:

- O mesmo formato de sessão JWT (payload: `{openId, appId, name}`)
- O mesmo cookie `app_session_id`
- A mesma lógica de verificação de sessão em `sdk.ts`

Isso significa que, uma vez autenticado por qualquer provider, o restante da aplicação funciona de forma idêntica. A diferença está apenas no fluxo de login inicial.

### Proteção CSRF (parâmetro `state`)

O parâmetro `state` será implementado da seguinte forma:

1. **Geração:** No endpoint `/api/oauth/github/login`, gerar um valor aleatório criptograficamente seguro (ex: `crypto.randomBytes(32).toString('hex')`)
2. **Armazenamento:** Salvar o `state` em um cookie httpOnly com tempo de expiração curto (5 minutos)
3. **Validação:** No endpoint `/api/oauth/github/callback`, comparar o `state` recebido do GitHub com o valor armazenado no cookie
4. **Limpeza:** Após validação (sucesso ou falha), remover o cookie de `state`

---

## Gerenciamento de Sessões e Cookies

### Reutilização do JWT existente

O JWT existente será reutilizado sem alterações no formato do payload.

**Para novos usuários (sem conta Manus prévia):**

```json
{
  "openId": "github:12345678",
  "appId": "<VITE_APP_ID>",
  "name": "octocat"
}
```

**Para usuários vinculados (conta Manus existente com `githubId` preenchido):**

```json
{
  "openId": "abc123def456",
  "appId": "<VITE_APP_ID>",
  "name": "octocat"
}
```

> **Crítico (PR 3.1):** Usuários vinculados **devem** receber o JWT com o `openId` Manus original (não `github:<id>`), pois `sdk.authenticateRequest` resolve usuários pelo campo `openId` na tabela `users`. Se o JWT contiver `github:<id>` para um usuário vinculado cujo `openId` ainda é o Manus original, a autenticação falhará ou criará um registro duplicado. Apenas no PR 3.2 (após migração de `openId`) todos os JWTs usarão o formato `github:<id>`.

O campo `openId` para **novos** usuários GitHub será formatado como `github:<user_id>`, onde `<user_id>` é o ID numérico do GitHub (estável e imutável, diferente do username).

### Configurações de cookie

Todas as configurações de cookie existentes em `server/_core/cookies.ts` serão mantidas:

| Configuração | Valor | Descrição |
|---|---|---|
| `httpOnly` | `true` | Cookie não acessível via JavaScript |
| `secure` | `true` (em produção) | Cookie enviado apenas via HTTPS |
| `sameSite` | `none` | Permite requisições cross-site (valor atual em `server/_core/cookies.ts`). Considerar alterar para `lax` após migração completa para domínio próprio. |
| `path` | `/` | Cookie válido para todas as rotas |

### Campo `loginMethod`

Para novos usuários autenticados via GitHub, o campo `loginMethod` na tabela `users` será preenchido com `"github"`. Isso permite:

- Distinguir entre usuários Manus e GitHub no banco de dados
- Facilitar auditoria e debugging
- Suportar lógica condicional futura (se necessário)

### Independência do provider na verificação de sessão

A verificação de sessão em `sdk.ts` funciona independente do provider porque:

1. O JWT é assinado com `JWT_SECRET` (compartilhado entre providers)
2. O payload contém apenas `openId`, `appId` e `name` (sem referência ao provider)
3. A validação verifica apenas a assinatura e expiração do token

---

## Variáveis de Ambiente

### Novas variáveis necessárias

| Variável | Obrigatória | Descrição | Onde configurar |
|---|---|---|---|
| `GITHUB_CLIENT_ID` | Sim | Client ID da aplicação OAuth registrada no GitHub | Provedor de hospedagem (Railway, etc.) |
| `GITHUB_CLIENT_SECRET` | Sim | Client Secret da aplicação OAuth (**nunca commitado**) | Provedor de hospedagem (secrets) |
| `GITHUB_CALLBACK_URL` | Sim | URL completa de callback (ex: `https://app.example.com/api/oauth/github/callback`) | Provedor de hospedagem |

### Variáveis existentes reutilizadas

| Variável | Uso |
|---|---|
| `JWT_SECRET` | Continua sendo usado para assinatura de sessões JWT (compartilhado entre providers) |
| `DATABASE_URL` | Sem alteração — mesma tabela `users` |

### Atualização necessária

| Variável | Ação |
|---|---|
| `OWNER_OPEN_ID` | Atualizar para formato `github:<id>` do administrador após migração. O ID numérico do GitHub pode ser obtido via `https://api.github.com/users/<username>` |

### Variáveis Manus (a serem removidas no PR 3.2)

| Variável | Status |
|---|---|
| `OAUTH_SERVER_URL` | Mantida durante período paralelo; removida no PR 3.2 |
| `VITE_APP_ID` | Mantida durante período paralelo; removida no PR 3.2. **Atenção:** `ENV.appId` (sourced de `VITE_APP_ID` em `server/_core/env.ts`) é usado na assinatura de sessões JWT e validado por `sdk.verifySession`. O PR 3.2 **deve** definir uma fonte substituta para `appId` (ex: variável de ambiente própria como `APP_ID`) ou remover a validação de `appId` do `verifySession` antes de remover `VITE_APP_ID`, caso contrário novas sessões serão inválidas. |
| `VITE_OAUTH_PORTAL_URL` | Mantida durante período paralelo; removida no PR 3.2 |

> **Nota de segurança:** `GITHUB_CLIENT_SECRET` é um segredo sensível. Nunca commite este valor no repositório. Use o gerenciador de segredos do provedor de hospedagem ou GitHub Actions Secrets.

---

## Configuração no GitHub

### Passo a passo para criar a OAuth App

1. Acessar [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Clicar em **"New OAuth App"**
3. Preencher os campos obrigatórios:

| Campo | Valor | Exemplo |
|---|---|---|
| **Application name** | Nome descritivo da aplicação | `Warhammer 40K Crusade Manager` |
| **Homepage URL** | URL principal da aplicação | `https://seudominio.com` |
| **Authorization callback URL** | URL de callback (deve corresponder exatamente a `GITHUB_CALLBACK_URL`) | `https://seudominio.com/api/oauth/github/callback` |

4. Clicar em **"Register application"**
5. Copiar o **Client ID** exibido na página
6. Clicar em **"Generate a new client secret"** e copiar o **Client Secret** (exibido apenas uma vez)

### Desenvolvimento local

Para desenvolvimento local, a callback URL deve apontar para `localhost`:

```text
http://localhost:3000/api/oauth/github/callback
```

> **Nota:** O GitHub permite registrar múltiplas OAuth Apps. Recomenda-se criar uma app separada para desenvolvimento local com callback URL apontando para `localhost`.

### OAuth App vs. GitHub App

| Tipo | Recomendação | Justificativa |
|---|---|---|
| **OAuth App** | **Recomendada** | Mais simples, fluxo direto, sem necessidade de instalação em repositórios. Ideal para autenticação de usuários. |
| GitHub App | Não recomendada | Mais complexa, projetada para integrações com repositórios e organizações. Overhead desnecessário para autenticação simples. |

---

## Estratégia de Rollout Paralelo

A migração será feita em três fases, garantindo que o sistema de autenticação existente nunca seja interrompido:

### Fase A — Implementar rotas GitHub OAuth (PR 3.1-impl)

- Adicionar rotas `/api/oauth/github/login` e `/api/oauth/github/callback` **paralelas** às rotas Manus existentes
- Implementar fluxo completo: autorização → token exchange → user info → sessão JWT
- Rotas Manus (`/api/oauth/callback`) permanecem **intactas e funcionais**
- Nenhuma alteração no frontend nesta fase (apenas backend)

### Fase B — Atualizar UI/cliente (PR 3.1-impl)

- Adicionar botão/link "Login com GitHub" na interface de login
- Manter opção de login Manus visível (período de transição)
- Redirecionar para `/api/oauth/github/login` ao clicar no botão GitHub
- Atualizar `getLoginUrl()` para suportar ambos os providers

### Fase C — Remover Manus OAuth (PR 3.2)

- Remover rotas Manus OAuth (`/api/oauth/callback`)
- Remover variáveis de ambiente Manus (`OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`)
- Remover código do SDK Manus (`sdk.ts` — partes específicas do Manus)
- Atualizar documentação e `.env.example`
- Executar apenas após período de estabilização (mínimo 1 semana com ambos os providers ativos)

### Cronograma de coexistência

```text
Tempo ──────────────────────────────────────────────►

Manus OAuth:  ████████████████████████████░░░░░░░░░░
GitHub OAuth:  ░░░░░░░░░░░████████████████████████████

               ▲              ▲              ▲
               │              │              │
           PR 3.1         Estabilização   PR 3.2
         (paralelo)       (1+ semana)    (remoção)
```

---

## Migração de Dados de Usuários

### Novos usuários (pós-migração)

Novos usuários que fazem login via GitHub criam **novos registros** na tabela `users` com:

| Campo | Valor |
|---|---|
| `openId` | `github:<user_id>` (ex: `github:12345678`) |
| `loginMethod` | `"github"` |
| `name` | Nome do perfil GitHub (`name` da resposta de `/user`). **Fallback:** se `name` for `null` (GitHub permite nome vazio), usar o campo `login` (username) como fallback, pois `sdk.verifySession` rejeita sessões com `name` vazio. |
| `email` | Email primário verificado do GitHub (obtido via `GET /user/emails`, filtrado por `verified=true` e `primary=true`) |

### Usuários existentes (Manus)

- Usuários existentes com login Manus **mantêm acesso** durante o período de coexistência
- Campanhas e dados permanecem vinculados ao `id` interno do usuário (chave primária autoincremento), **não ao `openId`**
- Isso significa que mesmo que o `openId` mude (de Manus para GitHub), os dados permanecem acessíveis desde que o usuário esteja vinculado ao mesmo `id`

### Vinculação de contas

A vinculação de contas Manus → GitHub pode ser feita por **email verificado e primário**:

1. Usuário faz login via GitHub
2. Sistema obtém emails via `GET /user/emails` (requer escopo `user:email`) e seleciona apenas o email com `verified=true` **e** `primary=true`
3. Se existir **exatamente um** usuário com esse email verificado no banco, **adiciona** o `githubId` ao registro existente (ver estratégia de mapeamento abaixo) e atualiza `loginMethod` para `"github"`
4. Se existirem **múltiplos** usuários com o mesmo email (campo `email` não é unique no schema atual), **não vincular automaticamente** — exigir confirmação explícita do usuário para evitar vincular ao registro errado
5. Se não houver email verificado e primário disponível, **não vincular automaticamente** — exigir confirmação explícita do usuário para vincular contas
6. Se não existir usuário com esse email, cria novo registro

> **Nota sobre unicidade de email:** O campo `users.email` no schema atual (`drizzle/schema.ts`) não possui constraint `unique`. A implementação **deve** verificar que existe exatamente um match antes de vincular automaticamente. Se houver duplicatas, o sistema deve solicitar confirmação explícita do usuário.
> **Importante:** A validação de `verified=true` e `primary=true` é obrigatória para segurança. Sem essa validação, seria possível vincular contas usando emails não verificados ou secundários, o que representa um risco de segurança.
> **Decisão:** Não haverá migração automática de contas. Usuários existentes fazem re-login com GitHub, e a vinculação acontece via email verificado. Isso simplifica a implementação e evita riscos de migração de dados.

### Estratégia de mapeamento de identidade (PR 3.1)

> **Crítico:** Durante o período de coexistência (PR 3.1), o `openId` Manus original **não deve ser sobrescrito**. O fluxo atual de upsert (`server/_core/oauth.ts` e `server/db.ts`) e lookup de auth (`server/_core/sdk.ts`) usam `openId` como chave. Se o `openId` for substituído por `github:<id>` enquanto o login Manus ainda está ativo, um usuário que fizer login via Manus após a vinculação criará um **segundo registro**, perdendo acesso às campanhas vinculadas ao `id` original.

**Solução:** Adicionar um campo `githubId` (nullable) à tabela `users` no PR 3.1:

```sql
ALTER TABLE users ADD COLUMN githubId VARCHAR(64) UNIQUE DEFAULT NULL;
```

| Fase | Comportamento |
|---|---|
| **PR 3.1** (coexistência) | Vinculação armazena GitHub ID em `githubId`, mantém `openId` Manus original. Login GitHub faz lookup por `githubId` primeiro, depois por email. Login Manus continua usando `openId` normalmente. |
| **PR 3.2** (remoção Manus) | Migra `openId` para formato `github:<id>` usando `githubId` como fonte. Remove campo `githubId` após migração. |

Isso garante que ambos os provedores funcionem simultaneamente sem conflito de identidade.

### Coexistência de `openId`

Durante o período de transição, a tabela `users` pode conter registros com dois formatos de `openId`:

| Formato | Provider | Exemplo |
|---|---|---|
| ID Manus (sem prefixo) | Manus OAuth | `abc123def456` |
| `github:<id>` | GitHub OAuth (novos usuários) | `github:12345678` |

Usuários vinculados mantêm o `openId` Manus original até o PR 3.2, com `githubId` preenchido para lookup via GitHub.

---

## Checklist de Validação Pré-Implementação

Antes de iniciar a implementação do PR 3.1, verificar:

- [ ] Aplicação OAuth criada no GitHub com credentials obtidos (`GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`)
- [ ] Variáveis de ambiente configuradas no ambiente de desenvolvimento
- [ ] Callback URL acessível externamente (para teste local, usar [ngrok](https://ngrok.com) ou similar, ou criar OAuth App separada para localhost)
- [ ] Banco de dados acessível e schema `users` compatível (campos `openId`, `loginMethod`, `email` existem)
- [ ] CI verde antes de iniciar implementação
- [ ] Revisão deste documento de planejamento concluída

---

## Checklist de Validação Pós-Implementação

Após implementação do PR 3.1, validar:

### Fluxo de autenticação

- [ ] Fluxo completo de login GitHub funciona (redirect → autorização → callback → sessão criada)
- [ ] Cookie `app_session_id` definido corretamente com flags de segurança (`httpOnly`, `secure`, `sameSite`)
- [ ] Endpoint `auth.me` retorna usuário autenticado após login GitHub
- [ ] Logout limpa sessão corretamente (cookie removido)
- [ ] Rotas protegidas (`protectedProcedure`) funcionam para usuários GitHub

### Coexistência

- [ ] Login Manus continua funcionando em paralelo (não quebrado)
- [ ] Usuários Manus existentes mantêm acesso aos seus dados

### Dados

- [ ] Novo usuário criado no banco com `loginMethod: "github"` e `openId: "github:<id>"`
- [ ] Email do usuário GitHub salvo corretamente (se disponível)
- [ ] Vinculação por email funciona (usuário existente com mesmo email é atualizado, não duplicado)

### Segurança

- [ ] Parâmetro `state` CSRF validado corretamente no callback
- [ ] Access token do GitHub não é logado ou exposto
- [ ] `GITHUB_CLIENT_SECRET` não está no código-fonte

---

## Riscos e Mitigações

| # | Risco | Severidade | Mitigação |
|---|---|---|---|
| 1 | **State CSRF não validado** permite ataques de replay | Alta | Implementar geração de `state` criptograficamente seguro (`crypto.randomBytes`) e validação obrigatória no callback. Rejeitar requisições sem `state` válido. |
| 2 | **Token GitHub exposto** em logs ou mensagens de erro | Alta | Nunca logar access tokens. Usar o token apenas para obter user info e descartar imediatamente. Não armazenar no banco de dados. |
| 3 | **Usuários perdem acesso a dados** após migração | Média | Vincular contas por email. Manter Manus OAuth ativo durante todo o período de transição. Não remover registros de usuários Manus. |
| 4 | **Callback URL não corresponde** ao configurado no GitHub | Média | Usar variável de ambiente `GITHUB_CALLBACK_URL` para configuração flexível. Documentar configuração claramente. Validar URL no startup do servidor. |
| 5 | **Rate limiting da API GitHub** | Baixa | Autenticação usa 3 chamadas por login (token exchange + user info + user emails). Rate limit autenticado é 5.000 req/hora. Risco extremamente baixo para uso normal. |

---

## Procedimento de Rollback

Se problemas críticos forem identificados após o deploy do PR 3.1:

### Rollback rápido (sem perda de dados)

1. **Reverter o PR 3.1** via `git revert` do commit squash
2. **Redeployar** a versão anterior
3. Sessões JWT existentes (Manus ou GitHub) **permanecem válidas** — usuários com sessão ativa não são afetados
4. Usuários que fizeram login via GitHub **mantêm seus registros** no banco de dados (sem impacto)
5. Manus OAuth **permanece funcional** durante todo o período paralelo — nenhum usuário perde acesso

> **Nota:** Este repositório usa política de **squash merge**, portanto não haverá merge commit. O revert deve ser feito diretamente no commit squash (sem a flag `-m`).

### Passos detalhados

```bash
# 1. Garantir que estamos na main atualizada
git checkout main
git pull origin main

# 2. Criar branch de rollback (respeita branch protection e fluxo de PR)
git checkout -b rollback/revert-github-oauth

# 3. Identificar o commit squash do PR 3.1
git log --oneline -10

# 4. Reverter o commit squash (sem -m, pois não é merge commit)
git revert <squash-commit-hash>

# 5. Push da branch de rollback e criar PR
git push -u origin rollback/revert-github-oauth
gh pr create --base main --head rollback/revert-github-oauth \
  --title "revert: rollback GitHub OAuth (PR 3.1)" \
  --body "Rollback do PR 3.1 devido a [descrever problema]"

# 6. Após merge do PR, redeployar
```

### O que NÃO é afetado pelo rollback

- Dados de usuários existentes (Manus) permanecem intactos
- Registros de usuários GitHub criados durante o período paralelo permanecem no banco (orphaned, mas sem impacto)
- Sessões ativas continuam funcionando até expiração natural
- Nenhuma migração de dados é necessária para rollback

---

## Referências

| Documento | Descrição |
|---|---|
| [00-executive-summary.md](00-executive-summary.md) | Resumo executivo da estratégia de saída |
| [01-step-by-step-plan.md](01-step-by-step-plan.md) | Plano passo a passo (Fase 3 = Auth) |
| [03-github-setup.md](03-github-setup.md) | Setup inicial do GitHub (labels, branches, secrets) |
| [ADR-0001-deploy.md](decisions/ADR-0001-deploy.md) | Decisão de infraestrutura de deploy |
| [deploy.md](../deploy.md) | Runbook de deploy (variáveis de ambiente) |
