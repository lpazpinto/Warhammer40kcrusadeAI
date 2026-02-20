# AGENTS.md — Rules for AI Agents (Manus / CodeRabbit / Codex / Dependabot / Others)

Este arquivo define as regras obrigatórias para qualquer agente automatizado que crie/edite código neste repositório (ex.: Manus, CodeRabbit, Codex, Dependabot, outros).

Objetivo: manter um fluxo seguro, previsível, incremental e 100% automatizável, com custo controlado.

============================================================
## 0) Princípios (invioláveis)

- Nunca faça commit direto na branch "main".
- Trabalhe sempre via Pull Request a partir de uma branch "manus/" (ou conforme regra do item 1).
- Mudanças mínimas: corrija o problema com o menor patch possível. Evite refactors grandes sem pedido explícito.
- Não degrade segurança: não desative checks (CI, CodeQL etc.) “para passar”.
- Não invente ambiente/segredos: se faltar variável/serviço, pare e reporte.
- Não altere lógica de negócio sem solicitação explícita (especialmente em tarefas de hardening).
- Não execute comandos destrutivos ou irreversíveis. Se houver dúvida, pare e reporte.

============================================================
## 1) Fluxo obrigatório de Git (branch -> commits -> PR)

### 1.1 Criar branch (sempre a partir de "main")

**Branches permitidas:**
- `manus/*` (fluxo legado com autopilot)
- `agent/*` (fluxo para Copilot/Codex agents e migrações sem acionar Manus)
- `dependabot/*` (automático)

**Padrão (durante o fadeout do Manus – até <DATA>):**
git checkout main
git pull
git checkout -b manus/<nome-curto>

> Observação: use nomes curtos e descritivos: manus/harden-workflows, manus/fix-ci, manus/deps-audit, etc.

**Novo padrão (pós-Manus – a partir de <DATA>):**
git checkout main
git pull
git checkout -b agent/<slug-curto>

> Observação: branches agent/* NÃO acionam o Manus Autopilot. Use para tarefas executadas por Copilot/Codex.

### 1.2 Commits (somente na branch manus/*)

Regras:
- Faça commits pequenos e claros.
- Mensagem objetiva, no imperativo: "fix: ...", "feat: ...", "chore: ...", "refactor: ..." (quando aplicável).
- Evite commits “varredura” que misturam tópicos.

Comandos:

git add -A  
git commit -m "fix: <descrição curta>"  
git push -u origin HEAD  

### 1.3 Abrir PR para "main"

Se tiver GitHub CLI (gh):

gh pr create --base main --head manus/<nome-curto> --title "<título>" --body "Resumo:
- <bullet 1>
- <bullet 2>

Como validar:
- <comando(s)>

Revisão automatizada: @coderabbitai review"

Se não tiver gh:
- informe o nome da branch e um resumo para o mantenedor abrir o PR manualmente.

============================================================
## 2) Regras de revisão (CodeRabbit + Codex + Checks)

Este repositório usa revisores automatizados. Quando houver feedback, o agente deve:

### 2.1 Ler TODO o feedback antes de mexer em código
- CodeRabbit: comentário principal + threads + inline comments.
- Codex: comentários do bot "chatgpt-codex-connector" (ou equivalente).
- Outros bots: Dependabot etc.

### 2.2 Prioridade de correção (ordem)
1) Falhas de CI / testes / lint  
2) Alertas de segurança (CodeQL, dependências)  
3) Sugestões ACTIONABLE (CodeRabbit/Codex)  
4) Nits/estilo (somente se não gerar ruído)

### 2.3 O que é “actionable” (e o que ignorar)

Actionable (exemplos):
- pedidos explícitos de mudança: “fix”, “should”, “bug”, “security”, “wrong”, “rename”, “add test”, “handle null”, etc.
- comentários com passos claros e objetivos

Ignorar:
- comentários placeholder: “review in progress”, “starting review…”, “analyzing…”, etc.
- resumos sem pedido concreto
- duplicatas já resolvidas

Regra:
- se o feedback for parcialmente redundante, aplicar a versão mais completa.

============================================================
## 3) Testes, validação e qualidade

Antes de concluir:
- Rodar testes/lint conforme o repo permitir.
- Garantir CI e CodeQL verdes no PR (ou registrar caminho claro para ficar verde).

### 3.1 Como escolher o gerenciador de pacotes
- Se existir "pnpm-lock.yaml" -> use pnpm
- Se existir "package-lock.json" -> use npm
- Se existir "yarn.lock" -> use yarn

Exemplos (ajustar conforme o repo):
- pnpm install
- pnpm test
- pnpm lint
- pnpm build

Se algum comando não existir, não invente. Use o que estiver documentado no repo.

============================================================
## 4) Segurança (obrigatório)

- Nunca comitar segredos (API keys, tokens, credenciais).
- Nunca printar segredos em logs/comentários de PR.
- Não alterar workflows para “burlar” security checks.
- Se detectar vulnerabilidade:
  - priorize correção segura e incremental
  - se a correção for grande, abra issue/PR separado com justificativa
- Se houver falta de env var / serviço externo:
  - pare
  - comente no PR exatamente qual item falta e como configurar

### 4.1 Regras específicas para hardening (OpenSSF / CI / Actions)
Em tarefas de hardening, o escopo padrão é:
- Ajustes em `.github/workflows/*`
- Arquivos de política e governança: `SECURITY.md`, `.github/CODEOWNERS`, `.github/dependabot.yml`
- Ajustes mecânicos (sem tocar em lógica de app)

Proibido (sem pedido explícito):
- alterar comportamento funcional do app (client/server/shared)
- introduzir automerge em mudanças de segurança
- reduzir cobertura de checks para “passar”

============================================================
## 5) Workflows e automação (obrigatório)

### 5.1 Least privilege em GitHub Actions
- Sempre declarar `permissions:` no workflow (ou no job) com o mínimo necessário.
- Padrão preferido: `contents: read`.
- Elevar permissões apenas quando necessário e justificando no PR (ex.: `security-events: write` para SARIF).

### 5.2 Evitar loops e custo desnecessário
- Não criar workflows que comentam/alteram PR e se re-disparam em loop.
- Preferir ações baratas primeiro; jobs caros devem ser `schedule` semanal ou `workflow_dispatch`.

### 5.3 Dependabot
- PRs do Dependabot devem rodar CI normalmente.
- Nunca acionar Manus em PR do Dependabot.
- Se PR do Dependabot falhar e não houver correção mecânica simples:
  - abrir Issue com diagnóstico e próximos passos
  - não iniciar loops de “tenta de novo indefinidamente”.

============================================================
## 6) Dependências (Dependabot / updates)

- PRs de dependência devem ser pequenos e não misturar com features.
- Se update quebrar testes, corrija o mínimo necessário.
- Se for breaking change grande, comente no PR e aguarde decisão.

============================================================
## 7) Auto-merge e merge policy

- O merge padrão do repositório é SQUASH.
- O agente não deve fazer merge manual sem instrução explícita.
- O agente deve focar em:
  - deixar checks verdes
  - resolver feedback
  - manter PR limpo e bem explicado

============================================================
## 8) Integrações e limitações (Manus / GitHub / Codex)

### 8.1 Se o agente não conseguir push por falta de integração
Às vezes tasks criadas via API podem não herdar integração GitHub automaticamente.

Regra:
- não simular push
- comentar no PR:
  - que não consegue fazer push porque a task não está conectada ao GitHub
  - o que precisa ser habilitado (integração/permissões)
  - o estado atual e quais mudanças faria

### 8.2 Regras para agentes em CI (ex.: Codex via GitHub Actions)
- Evitar executar comandos (build/test/install) a menos que o workflow peça explicitamente.
- Não usar sudo.
- Não baixar ferramentas fora do que o pipeline já instala.
- Gerar PRs com mudanças pequenas e justificadas.
- Se o patch ficar grande demais, dividir em “batch” (por exemplo: permissões em workflows primeiro, pin de actions depois).

============================================================
## 9) O que o agente deve comentar ao finalizar

Ao concluir uma tarefa, comentar no PR:
- o que foi feito (bullets)
- por que foi feito (1–2 linhas)
- arquivos alterados
- como validar (comandos)
- se algum feedback foi ignorado, por quê (curto e objetivo)

============================================================
## 10) Escopo e limites

Este repositório favorece melhorias incrementais.

Evitar:
- refactors grandes sem pedido explícito
- mudanças de arquitetura sem issue/RFC
- alterações massivas de estilo/format sem motivo
- “corrigir tudo de uma vez” se não for necessário

============================================================
## 11) Checklist mental final

Antes de enviar commits:
- Estou em manus/* (não em main)
- Patch mínimo e objetivo
- Sem segredos no diff
- CI/CodeQL continuam verdes (ou caminho claro para ficar)
- Feedback CodeRabbit + Codex foi lido e tratado
- Comentário final no PR com o que/por quê/como validar
