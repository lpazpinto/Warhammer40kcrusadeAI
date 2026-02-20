# Exit Manus — Step-by-step Plan

## Regras operacionais
- Tudo em PRs pequenos.
- Branch prefix: `agent/*` (NÃO usar `manus/*` durante migração).
- Cada PR deve ter:
  - objetivo claro
  - como validar localmente
  - checklist do PR template preenchido

---

## Fase 0 — Preparação (1 PR)
### PR 0.1 — Documentação e templates
**Objetivo**
- Adicionar docs de migração, templates de Issue/PR e biblioteca de prompts.
- Atualizar AGENTS.md para aceitar `agent/*`.

**Validação**
- CI deve ficar verde.
- Nenhuma mudança de lógica do app.

---

## Fase 1 — Build portável (1–2 PRs)
> Seu build atual joga client e server dentro do mesmo `dist/`.
> Vamos separar para simplificar deploy e servir static com segurança.

### PR 1.1 — Separar outputs: `dist/client` e `dist/server`
**Objetivo**
- Ajustar Vite build para `dist/client`
- Ajustar esbuild para gerar `dist/server/index.js`
- Garantir que `pnpm start` rode o server bundle

**Validação**
- `pnpm build`
- `pnpm start`
- Acessar app local e navegar páginas básicas

### PR 1.2 — Express serve frontend buildado
**Objetivo**
- Servir `dist/client` via Express em produção
- Fallback de SPA (servir `index.html` em rotas do frontend)
- Manter API funcionando

**Validação**
- `pnpm build && pnpm start`
- Abrir `/` e uma rota interna (ex.: `/campaigns/...`)
- Confirmar que chamadas tRPC continuam

---

## Fase 2 — Deploy fora do Manus (1–2 PRs)
### PR 2.1 — Dockerfile + healthcheck
**Objetivo**
- Dockerfile multi-stage (build + runtime)
- `PORT` configurável
- Health endpoint simples (`/healthz`)

**Validação**
- `docker build .`
- `docker run -e DATABASE_URL=... -p 3000:3000 ...`

### PR 2.2 — Runbook de deploy (sem amarrar provider)
**Objetivo**
- Instruções de deploy para Railway/Render/Fly (sem vendor lock-in)
- Lista de env vars
- Checklist de cutover

---

## Fase 3 — Auth (2–3 PRs)
### PR 3.1 — Introduzir GitHub OAuth (paralelo ao Manus OAuth)
**Objetivo**
- Adicionar GitHub OAuth (clientId/clientSecret/callback)
- Implementar sessão (cookie) e JWT/claims
- Manter Manus OAuth temporariamente para não quebrar tudo

**Validação**
- Login via GitHub em dev
- Usuário persistido/identificado no backend
- Rotas protegidas funcionam

### PR 3.2 — Remover Manus OAuth
**Objetivo**
- Remover dependência de `OAUTH_SERVER_URL` e `VITE_OAUTH_PORTAL_URL`
- Ajustar docs `.env.example`
- Remover “publish on Manus for OAuth” do README

**Validação**
- App roda sem qualquer variável Manus
- Login funciona

---

## Fase 4 — Limpeza final (1 PR)
### PR 4.1 — Remover plugins/deps específicas do Manus
**Objetivo**
- Remover `vite-plugin-manus-runtime` (se não for mais usado)
- Atualizar README/AGENTS para stack nova
- Garantir CI verde

---

## Fase 5 — (Opcional) Automação extra com guardrails
- Se quiser Codex em Actions: criar workflow manual (label `ai-fix`) e medir custo.
- Preferência: Copilot agent + PRs pequenos.

---

## Cutover (produção)
1) Deploy fora do Manus em ambiente novo
2) Smoke test
3) Trocar DNS/URL (se houver)
4) Monitorar logs 24–48h
