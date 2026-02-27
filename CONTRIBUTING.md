# CONTRIBUTING.md — Contributing Guide

Obrigado por contribuir!

Este repositório aceita contribuições humanas e automatizadas (Manus, CodeRabbit, Codex, Dependabot).
Para manter o fluxo seguro e previsível, seguimos regras simples.

---

## 1) Regras rápidas (humanos e bots)

- Nunca faça commit direto na branch `main`.
- Trabalhe sempre via Pull Request.
- Mantenha PRs pequenos, focados e com descrição clara.
- Não comite segredos (tokens, API keys, credenciais).
- Garanta que CI/CodeQL fiquem verdes antes do merge.

---

## 2) Branch naming

- Para agentes: `manus/<tema-curto>` ou `agent/<tema-curto>` (use `manus/*` até 01/04/2026; após essa data, use `agent/*` para Copilot/Codex)
- Para humanos: `feature/<tema>`, `fix/<tema>`, `chore/<tema>` (ou padrão do time)

---

## 3) Abrindo Pull Request

No PR, inclua:

- Resumo das mudanças (bullets)
- Como validar/testar (comandos)
- Contexto/links (issues, prints, etc. se necessário)

Se você usa CodeRabbit, pode pedir review no corpo/comentário:

```text
@coderabbitai review
```

---

## 4) Regras específicas para agentes automatizados

As regras completas para automação (Manus/CodeRabbit/Codex/etc.) estão em `AGENTS.md`.
Isso inclui:

- Fluxo obrigatório `manus/*` ou `agent/*` → PR → checks
- Como tratar feedback ACTIONABLE vs placeholder
- Limites de refatoração
- Requisitos de segurança

Se você está implementando automações, trate `AGENTS.md` como "fonte da verdade".

---

## 5) Checks e qualidade

Antes de marcar PR como pronto:

- CI verde
- CodeQL verde
- Feedback relevante resolvido ou justificado

Se houver falha por dependência/serviço externo:

- Não invente
- Comente no PR o que falta e como reproduzir/configurar

---

## 6) Merge policy

O merge padrão é **SQUASH**.
Agentes não devem fazer merge manualmente sem instrução explícita.

---

## 7) Segurança

- Nunca poste segredos em comentários/logs
- Use Secrets do GitHub Actions para credenciais
- Atualizações de dependência devem ser pequenas e testadas

---

## 8) Dúvidas

Abra uma issue descrevendo:

- O que tentou fazer
- Logs/prints relevantes
- Link do PR / workflow run
