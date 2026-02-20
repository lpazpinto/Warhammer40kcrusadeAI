# GitHub Setup — Exit Manus

## 1) Ativar Copilot agent + Codex (se você for usar)
Durante o public preview:
- habilitar repositórios permitidos para agents
- ativar Codex/Claude nos settings do Copilot coding agent

(Obs: cada sessão consome 1 premium request.)

## 2) Labels recomendadas (criar manualmente)
- `exit-manus` (todas as issues/PRs da migração)
- `ai-ready` (issue pronta para agente pegar)
- `blocked` (falta credencial/decisão)
- `needs-human` (precisa ação manual sua: secrets, provider, etc.)
- `risk-auth` (mudanças de auth)
- `risk-deploy` (deploy)

## 3) Branch naming
- Migração: `agent/*`
- (Legado Manus): `manus/*`

## 4) Secrets (para Auth/Deploy)
- GitHub OAuth:
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_CALLBACK_URL`
- App:
  - `DATABASE_URL`
  - `JWT_SECRET`

## 5) Estratégia de PR
- PR pequeno por etapa
- checklist preenchido
- validação local descrita
