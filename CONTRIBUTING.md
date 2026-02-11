CONTRIBUTING.md — Contributing Guide

Obrigado por contribuir!

Este repositório aceita contribuições humanas e automatizadas (Manus, CodeRabbit, Codex, Dependabot).
Para manter o fluxo seguro e previsível, seguimos regras simples.

============================================================

Regras rápidas (humanos e bots)
============================================================

Nunca faça commit direto na branch "main".

Trabalhe sempre via Pull Request.

Mantenha PRs pequenos, focados e com descrição clara.

Não comite segredos (tokens, API keys, credenciais).

Garanta que CI/CodeQL fiquem verdes antes do merge.

============================================================
2) Branch naming

Para agentes (Manus): manus/<tema-curto>

Para humanos: feature/<tema>, fix/<tema>, chore/<tema> (ou padrão do time)

============================================================
3) Abrindo Pull Request

No PR, inclua:

Resumo das mudanças (bullets)

Como validar/testar (comandos)

Contexto/links (issues, prints, etc. se necessário)

Se você usa CodeRabbit, pode pedir review no corpo/comentário:
@coderabbitai review

============================================================
4) Regras específicas para agentes automatizados

As regras completas para automação (Manus/CodeRabbit/Codex/etc.) estão em AGENTS.md.
Isso inclui:

fluxo obrigatório manus/* -> PR -> checks

como tratar feedback ACTIONABLE vs placeholder

limites de refatoração

requisitos de segurança

Se você está implementando automações, trate AGENTS.md como “fonte da verdade”.

============================================================
5) Checks e qualidade

Antes de marcar PR como pronto:

CI verde

CodeQL verde

feedback relevante resolvido ou justificado

Se houver falha por dependência/serviço externo:

não invente

comente no PR o que falta e como reproduzir/configurar

============================================================
6) Merge policy

O merge padrão é SQUASH.
Agentes não devem fazer merge manualmente sem instrução explícita.

============================================================
7) Segurança

Nunca poste segredos em comentários/Logs

Use Secrets do GitHub Actions para credenciais

Atualizações de dependência devem ser pequenas e testadas

============================================================
8) Dúvidas

Abra uma issue descrevendo:

o que tentou fazer

logs/prints relevantes

link do PR / workflow run
