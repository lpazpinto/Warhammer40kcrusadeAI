AGENTS.md — Rules for AI Agents (Manus / CodeRabbit / Codex / Others)

Este arquivo define as regras obrigatórias para qualquer agente automatizado que crie/edite código neste repositório (ex.: Manus, CodeRabbit, Codex, Dependabot, outros).

Objetivo: manter um fluxo seguro, previsível, incremental e 100% automatizável.

============================================================
0) Princípios (invioláveis)

Nunca faça commit direto na branch "main".

Trabalhe sempre via Pull Request a partir de uma branch "manus/<tema-curto>".

Mudanças mínimas: corrija o problema com o menor patch possível. Evite refactors grandes sem pedido explícito.

Não degrade segurança: não desative checks (CI, CodeQL etc.) “para passar”.

Não invente ambiente/segredos: se faltar variável/serviço, pare e reporte.

============================================================

Fluxo obrigatório de Git (branch -> commits -> PR)
============================================================

1.1 Criar branch (sempre a partir de "main")

Comandos:

git checkout main

git pull

git checkout -b manus/<tema-curto>

1.2 Commits (somente na branch manus/*)

Regras:

Faça commits pequenos e claros.

Mensagem objetiva, no imperativo: "fix: ...", "feat: ...", "chore: ...", "refactor: ..." (quando aplicável).

Comandos:

git add -A

git commit -m "fix: <descrição curta>"

git push -u origin HEAD

1.3 Abrir PR para "main"

Se tiver GitHub CLI (gh):

gh pr create --base main --head manus/<tema-curto> --title "<título>" --body "
Resumo:

<bullet 1>

<bullet 2>

Como validar:

<comando(s)>

Revisão automatizada:
@coderabbitai review
"

Se não tiver gh:

informe o nome da branch e um resumo para o mantenedor abrir o PR manualmente.

============================================================
2) Regras de revisão (CodeRabbit + Codex + Checks)

Este repositório usa revisores automatizados. Quando houver feedback, o agente deve:

2.1 Ler TODO o feedback antes de mexer em código:

CodeRabbit: comentário principal + threads + inline comments.

Codex: comentários do bot "chatgpt-codex-connector" (ou equivalente).

Outros bots: Dependabot etc.

2.2 Prioridade de correção (ordem):

Falhas de CI / testes / lint

Alertas de segurança (CodeQL, dependências)

Sugestões ACTIONABLE (CodeRabbit/Codex)

Nits/estilo (somente se não gerar ruído)

2.3 O que é “actionable” (e o que ignorar)

Actionable (exemplos):

pedidos explícitos de mudança: “fix”, “should”, “bug”, “security”, “wrong”, “rename”, “add test”, “handle null”, etc.

comentários com passos claros e objetivos

Ignorar:

comentários placeholder: “review in progress”, “starting review…”, “analyzing…”, etc.

resumos sem pedido concreto

duplicatas já resolvidas

Regra:

se o feedback for parcialmente redundante, aplicar a versão mais completa.

============================================================
3) Testes, validação e qualidade

Antes de concluir:

Rodar testes/lint conforme o repo permitir.

Garantir CI e CodeQL verdes no PR.

3.1 Como escolher o gerenciador de pacotes

Se existir "pnpm-lock.yaml" -> use pnpm

Se existir "package-lock.json" -> use npm

Se existir "yarn.lock" -> use yarn

Exemplos (ajustar conforme o repo):

pnpm install

pnpm test

pnpm lint

pnpm build

Se algum comando não existir, não invente. Use o que estiver documentado no repo.

============================================================
4) Segurança (obrigatório)

Nunca comitar segredos (API keys, tokens, credenciais).

Nunca printar segredos em logs/comentários de PR.

Não alterar workflows para “burlar” security checks.

Se detectar vulnerabilidade:

priorize correção segura e incremental

se a correção for grande, abra issue/PR separado com justificativa

Se houver falta de env var / serviço externo:

pare

comente no PR exatamente qual item falta e como configurar

============================================================
5) Dependências (Dependabot / updates)

PRs de dependência devem ser pequenos e não misturar com features.

Se update quebrar testes, corrija o mínimo necessário.

Se for breaking change grande, comente no PR e aguarde decisão.

============================================================
6) Auto-merge e merge policy

O merge padrão do repositório é SQUASH.

O agente não deve fazer merge manual sem instrução explícita.

O agente deve focar em:

deixar checks verdes

resolver feedback

manter PR limpo e bem explicado

============================================================
7) Integrações e automação (Manus / GitHub)

7.1 Se o agente não conseguir push por falta de integração

Às vezes tasks criadas via API podem não herdar integração GitHub automaticamente.

Regra:

não simular push

comentar no PR:

que não consegue fazer push porque a task não está conectada ao GitHub

o que precisa ser habilitado (integração/permissões)

o estado atual e quais mudanças faria

============================================================
8) O que o agente deve comentar ao finalizar

Ao concluir uma tarefa, comentar no PR:

o que foi feito (bullets)

por que foi feito (1–2 linhas)

arquivos alterados

como validar (comandos)

se algum feedback foi ignorado, por quê (curto e objetivo)

============================================================
9) Escopo e limites

Este repositório favorece melhorias incrementais.

Evitar:

refactors grandes sem pedido explícito

mudanças de arquitetura sem issue/RFC

alterações massivas de estilo/format sem motivo

“corrigir tudo de uma vez” se não for necessário

============================================================
10) Checklist mental final

Antes de enviar commits:

Estou em manus/* (não em main)

Patch mínimo e objetivo

Sem segredos no diff

CI/CodeQL continuam verdes (ou caminho claro para ficar)

Feedback CodeRabbit + Codex foi lido e tratado

Comentário final no PR com o que/por quê/como validar
