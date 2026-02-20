# Prompt Library — Agents (Copilot/Codex/CodeRabbit)

## Como usar este arquivo
- Copie/cole os prompts em Issues e comentários de PR.
- Sempre inclua: objetivo, escopo, como validar, “não use manus/*”.

---

## Prompt base para Issue (Copilot/Codex coding agent)
Use este texto no corpo da Issue:

### Contexto
Estamos migrando para rodar fora do Manus (hosting + OAuth). Esta tarefa faz parte do plano `docs/exit-manus/01-step-by-step-plan.md`.

### Regras obrigatórias
- Crie branch `agent/<slug-curto>`
- NÃO use branch `manus/*`
- Mudança mínima, sem refactor grande
- Não comitar segredos
- Não alterar workflows para “passar”
- CI deve ficar verde

### O que fazer (escopo)
[DESCREVER TAREFA AQUI EM BULLETS]

### Como validar
- Comandos: `pnpm install`, `pnpm test`, `pnpm build`
- Se aplicável: `pnpm start` e teste manual no browser

### Entregáveis
- Código + testes (quando fizer sentido)
- Atualizar docs se necessário
- PR com resumo e passos de validação

---

## Prompt específico — PR 1.1 (separar dist client/server)
### Escopo
- Alterar script `build` para gerar:
  - `dist/client` (Vite)
  - `dist/server/index.js` (esbuild)
- Ajustar `start` para apontar para o bundle correto
- Sem quebrar `pnpm dev`

### Como validar
- `pnpm build`
- `pnpm start`
- Abrir app no browser e checar que carrega

---

## Prompt específico — PR 1.2 (Express servir static)
### Escopo
- Em produção, servir `dist/client` via Express
- SPA fallback: rotas desconhecidas -> `index.html`
- Garantir que rotas API/tRPC não sofram fallback

### Como validar
- `pnpm build && pnpm start`
- Abrir rota do frontend e confirmar que não dá 404
- Confirmar endpoint de health (se existir) e tRPC

---

## Prompt específico — PR 2.1 (Dockerfile + healthz)
### Escopo
- Dockerfile multi-stage
- Expor `PORT`
- Criar endpoint GET `/healthz` retornando 200 + payload simples

### Como validar
- `docker build -t crusade-ai .`
- `docker run -e DATABASE_URL=... -p 3000:3000 crusade-ai`
- `curl http://localhost:3000/healthz`

---

## Prompt específico — PR 3.1 (GitHub OAuth)
### Escopo
- Adicionar login com GitHub OAuth (clientId/secret/callback)
- Sessão por cookie (httpOnly) ou JWT (com cuidado)
- Criar/atualizar usuário no DB (mínimo necessário)
- Manter compatibilidade com fluxo atual até PR 3.2

### Como validar
- Rodar local e logar com GitHub
- Verificar que rotas protegidas funcionam

---

## Como pedir review do CodeRabbit no PR
Comente no PR:
`@coderabbitai review`

---

## (Opcional) Quando usar Codex GitHub Action
Somente se:
- Gatilho manual (workflow_dispatch) OU label `ai-fix`
- Sem rodar em Dependabot
- Com budget controlado (exige OPENAI_API_KEY como secret)
