# AGENTS-hardening-batches.md — Plano de Hardening (OpenSSF / Repo Security)

Objetivo: melhorar achados do OpenSSF Scorecard e a postura de segurança do repositório com mudanças pequenas e revisáveis, sem alterar lógica da aplicação.

Regras globais:
- NÃO alterar código de negócio (client/server/shared) sem pedido explícito.
- Mudanças devem ser pequenas, mecânicas e revisáveis.
- Nunca desativar checks de segurança/CI “para passar”.
- Nunca criar automações que rodem em PRs do Dependabot (evitar loops/custo).
- PRs geradas automaticamente NÃO devem fazer automerge.

============================================================
## Batch 1 — “Foundations” (baixo risco, alto retorno, PR pequeno)

Escopo:
- `.github/workflows/*` (somente permissões mínimas e pequenas correções seguras)
- `SECURITY.md`
- `.github/CODEOWNERS`
- `.github/dependabot.yml`

Tarefas:
1) Workflows: aplicar least privilege em TODOS
   - Adicionar `permissions:` no workflow/job com padrão:
     - `contents: read`
   - Elevar apenas se necessário e justificando no PR:
     - `security-events: write` (upload SARIF)
     - `pull-requests: write` (comentar/abrir PR)
     - `contents: write` (somente workflows que abrem PR/commitam — evitar se não for indispensável)

2) Criar/atualizar `SECURITY.md` (política mínima)
3) Criar `.github/CODEOWNERS` (ex.: `* @lpazpinto`)
4) Criar `.github/dependabot.yml`
   - Atualizações semanais
   - github-actions + npm/pnpm
   - limitar PRs abertas (ex.: 5)
   - agrupar updates quando fizer sentido (opcional)

Critérios de aceite:
- CI continua verde
- Nenhuma mudança em código de negócio
- PR com descrição clara do porquê (Scorecard findings)

============================================================
## Batch 2 — “Pinned Actions” (médio esforço, pode gerar PR maior)

Escopo:
- `.github/workflows/*` (somente pinning de actions)

Tarefas:
1) Pin de actions por commit SHA (principalmente nos workflows críticos)
   - Prioridade:
     - CI principal
     - release/deploy
     - automerge
     - security scanning
2) Evitar “pin em massa” em um PR se ficar enorme:
   - dividir por workflow
   - ou dividir por criticidade

Critérios de aceite:
- PR não deve misturar outras mudanças (somente pin)
- CI verde

Observação:
- Se for impraticável pinning completo agora, fazer parcial (workflows críticos) e abrir Issue para completar.

============================================================
## Batch 3 — “Supply chain gates” (baixo custo, alta utilidade)

Escopo:
- novos workflows leves em `.github/workflows/`

Tarefas:
1) Adicionar workflow `dependency-review` em PRs
   - Falhar apenas em severidade alta/critica (ajustável)
   - Permissões mínimas: `contents: read`
2) (Opcional) adicionar `ossf-scorecard` semanal (já existe no repo)
3) (Opcional) adicionar verificação semanal barata de vulnerabilidades:
   - `pnpm audit` (somente schedule, não em PR)
   - ou usar GitHub Dependabot security updates como principal fonte

Critérios de aceite:
- Não aumentar custo em PRs (evitar jobs pesados)
- Não criar loops de comentários/bots
- CI verde

============================================================
## Batch 4 — “Repository settings / Rulesets” (não é via PR; exige admin)

IMPORTANTE:
- Branch protection / Rulesets são settings do repo.
- Não automatizar sem guardrails (token forte + ambiente protegido).

Tarefas (manual recomendado):
1) Habilitar Ruleset/Branch protection para `main`
   - PR required
   - required status checks (CI)
   - 1 review mínimo (ou CODEOWNERS)
   - bloquear force-push
2) Exigir “signed commits” (se fizer sentido)
3) Restringir permissões de Actions se aplicável

Alternativa automatizada (somente se explicitamente aprovado):
- Criar workflow `workflow_dispatch` que aplica rulesets via GitHub API
- Exigir aprovação manual via Environment (protegido)

Critérios de aceite:
- Sem mudanças automáticas silenciosas
- Mudanças auditáveis

============================================================
## Batch 5 — “Backlog de Scorecard” (iterativo, conforme findings)

Processo:
- Rodar Scorecard semanalmente
- Cada finding relevante vira um PR pequeno (ou Issue)
- Não “corrigir tudo” num PR só

Exemplos de itens comuns:
- README/SECURITY policy mais detalhada
- Contribuição: CONTRIBUTING.md
- Release process e tags assinadas
