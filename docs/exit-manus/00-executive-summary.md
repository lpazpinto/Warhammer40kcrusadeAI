# Exit Manus — Executive Summary (Warhammer40kCrusadeAI)

## Objetivo
Remover dependência de Manus (hosting + OAuth) sem perder qualidade, reduzindo custo e eliminando o risco de "parar de desenvolver porque acabaram créditos".

## Situação atual (baseline)
- Frontend: React + Vite
- Backend: Node.js + Express + tRPC
- DB: MySQL/TiDB via Drizzle
- Auth: Manus OAuth
- CI: GitHub Actions (lint/test/build)
- Revisão: CodeRabbit + (Codex)
- Autopilot Manus: só em branches `manus/*` (review actionable ou CI falhou)

## Decisão recomendada (Target Architecture)
**Arquitetura A — Monolito deployável**
- 1 serviço (Node/Express) servindo:
  - API (/trpc, /api)
  - Frontend buildado (static)
- DB permanece MySQL/TiDB
- Auth migra para GitHub OAuth (ou outro provedor padrão)
- Deploy em provedor padrão (Railway/Render/Fly/etc.)

## Critérios de sucesso (DoD)
- App roda fora do Manus (local + produção) com:
  - `pnpm dev` funcionando
  - `pnpm build` e `pnpm start` funcionando
  - login via GitHub OAuth (sem Manus OAuth)
  - CI verde (test/build)
- Documentação atualizada e sem variáveis Manus como requisito obrigatório.
- Nenhum workflow dispara Manus durante a migração (branches `agent/*`).

## Estratégia
PRs pequenos e sequenciais:
1) Docs + templates + regras de agentes
2) Build/deploy “portável” (dist separado, static serve)
3) Dockerfile/healthcheck + deploy pipeline
4) Auth: GitHub OAuth
5) Remover dependências Manus + limpar docs
6) Opcional: automações extra (com guardrails)
