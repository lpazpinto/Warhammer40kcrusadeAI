---
name: "Exit Manus: Epic"
about: "Epic de migração com checklist macro."
title: "[exit-manus] Epic: rodar fora do Manus"
labels: ["exit-manus"]
---

## Objetivo
Rodar o app fora do Manus (hosting + OAuth), mantendo CI/reviews e reduzindo custo.

## Checklist macro (links para Issues)
- [ ] PR 0.1 — Docs + templates + AGENTS.md atualizado
- [ ] PR 1.1 — Build separado dist/client e dist/server
- [ ] PR 1.2 — Express serve static + SPA fallback
- [ ] PR 2.1 — Dockerfile + /healthz
- [ ] PR 2.2 — Runbook de deploy + checklist de cutover
- [ ] PR 3.1 — GitHub OAuth (paralelo)
- [ ] PR 3.2 — Remover Manus OAuth + limpar README/.env.example
- [ ] PR 4.1 — Remover deps/plugins Manus + limpeza final

## Critérios de sucesso
- `pnpm dev` ok
- `pnpm build && pnpm start` ok
- Login sem Manus ok
- CI verde
