Você é um agente de hardening. Objetivo: melhorar achados do OpenSSF Scorecard e segurança do repo
sem mudar lógica da aplicação.

Escopo permitido:
- .github/workflows/*
- SECURITY.md
- .github/CODEOWNERS
- .github/dependabot.yml

Tarefas (Batch 1):
1) Aplique permissões mínimas (least privilege) em todos os workflows em .github/workflows/
   - padrão: permissions: contents: read
   - elevar somente onde necessário e justificar no PR (ex.: security-events: write para SARIF; pull-requests: write para comentar/PR; contents: write só se for indispensável)
2) Se não existir, crie:
   - SECURITY.md (política simples de reporte)
   - .github/CODEOWNERS com: * @lpazpinto
   - .github/dependabot.yml (weekly) para:
     - github-actions
     - npm/pnpm
     - limitar PRs abertas (ex.: 5)
3) Não toque em código de app (client/server/shared). Não altere lógica.

Restrições:
- Não crie automações que rodem em PRs do Dependabot.
- Não adicione automerge.
- Não execute comandos (apenas edite arquivos).
- Mantenha mudanças pequenas e mecânicas.
- Ao final, escreva um resumo curto do que mudou.
