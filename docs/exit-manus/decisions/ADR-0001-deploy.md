# ADR-0001: Deploy Infrastructure Decision

| Field       | Value                              |
|-------------|------------------------------------|
| **Status**  | Accepted                           |
| **Date**    | 2026-02-21                         |
| **Authors** | @lpazpinto                         |

## References

- Decision discussion: [#43 — Decisão: provider de deploy + arquitetura (monolito vs FE separado)](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/43)
- Parent epic: [#34 — Epic: rodar fora do Manus](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/34)
- This ADR: [#44 — ADR-0001: registrar decisão de deploy](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/44)

---

## Context

The Warhammer 40K Crusade AI Manager is currently hosted on the Manus platform. While Manus provides a convenient all-in-one environment (hosting, database, OAuth, LLM integration), several factors drive the need to migrate to independent infrastructure:

**Cost and credit risk.** Manus operates on a credit-based billing model. Continued development and hosting consume credits that may be exhausted unpredictably, creating a risk of service interruption.

**Vendor lock-in.** The application relies on Manus-specific integrations (OAuth flow, built-in LLM helpers, S3 storage helpers, notification API). Remaining on the platform increases coupling and makes future migration progressively harder.

**AI-friendly and low operational complexity.** The project is developed and maintained with heavy AI agent assistance (Manus, Codex, CodeRabbit). The chosen infrastructure must minimize the number of moving parts — fewer services to configure, fewer environment variables to manage, simpler validation (one URL, one deploy, one health check). This reduces the surface area for agent errors and keeps PRs small and reviewable.

**Technical requirements.** The application is a Node.js 20+ monolith (Express + Vite) backed by a MySQL-compatible database. The stack is already built as a single service that serves both the API (`/api/*`) and the client static assets (`dist/client/`) from the same process.

---

## Decision

The project will adopt the following infrastructure for production deployment outside Manus:

| Component       | Choice                          | Tier / Plan          |
|-----------------|---------------------------------|----------------------|
| **Hosting**     | Railway                         | Hobby ($5/month)     |
| **Architecture**| Monolith (single service)       | Express serves API + static client |
| **Database**    | TiDB Cloud                      | Starter (serverless, MySQL-compatible) |

**Target budget:** approximately $5/month for the application, plus $0 to low cost for the database (with spend limits configured).

The monolith architecture means a single Railway service runs the Express server, which handles both API routes (`/api/trpc/*`, `/api/oauth/*`) and serves the Vite-built client assets. There is one deploy pipeline, one URL, and one health check endpoint (`/healthz`).

---

## Alternatives Considered

### Hosting

| Provider   | Verdict      | Reason                                                                                   |
|------------|--------------|------------------------------------------------------------------------------------------|
| **Railway**| **Chosen**   | Predictable pricing ($5/month + usage credits), simple deploy from Dockerfile, good DX.  |
| Render     | Not chosen   | Free tier suspends services after inactivity; not ideal for continuous uptime.            |
| Fly.io     | Not chosen   | Potentially cheaper, but increases operational complexity (Fly CLI, Machines API, WireGuard networking). |

### Architecture

| Approach                | Verdict      | Reason                                                                                   |
|-------------------------|--------------|------------------------------------------------------------------------------------------|
| **Monolith**            | **Chosen**   | One service, one deploy, no CORS configuration, fewer environment variables. More agent-friendly. |
| Separated FE/BE         | Not chosen   | Adds a second hosting target (Vercel/Netlify for frontend), requires CORS setup, two deploy pipelines, and more configuration surface for agents to manage. |

### Database

| Provider        | Verdict      | Reason                                                                                   |
|-----------------|--------------|------------------------------------------------------------------------------------------|
| **TiDB Cloud**  | **Chosen**   | MySQL-compatible (matches current Drizzle schema), serverless with scale-to-zero, $0 starter tier with spend limits. |
| Managed MySQL   | Not chosen   | Typically more expensive at low scale; no serverless/scale-to-zero option on most providers. |
| PlanetScale     | Not chosen   | MySQL-compatible and serverless, but free tier was removed; pricing less predictable for hobby projects. |

---

## Consequences

### Positive

**Reduced cost.** Railway Hobby at $5/month plus TiDB Cloud Starter at $0 (with spend limits) replaces the credit-based Manus model with predictable, low monthly costs.

**Operational simplicity.** A single service means one Dockerfile, one deploy target, one URL, one set of environment variables, and one health check. This drastically reduces the configuration surface and the number of things that can go wrong during automated deployments.

**AI-agent-friendly stack.** Fewer moving parts means agents (Manus, Codex) produce smaller, more focused PRs. Validation is straightforward: build succeeds, tests pass, health check responds. No cross-service coordination is needed.

### Negative (mitigated)

**Provider dependency.** Railway is a managed PaaS, which introduces some dependency. However, the application runs in a standard Docker container with a standard Node.js entrypoint. Migration to another container-based platform (Render, Fly.io, or even a VPS) requires only changing the deploy target — no code changes.

**OAuth migration required.** The current Manus OAuth flow must be replaced with GitHub OAuth (or another provider) before the application can run outside Manus. This is a prerequisite that does not depend on the hosting choice, but it is the most critical follow-up task.

### Trade-offs

**Vertical scaling limits.** Railway Hobby tier has resource limits. For the current project scale (single-user to small-group Crusade campaigns), this is more than adequate. If the project grows significantly, the architecture can be revisited without changing the codebase — only the deploy target and tier would change.

---

## Follow-ups

The following tasks are unblocked or required by this decision:

| Task                                      | Reference                                                                                   | Priority  |
|-------------------------------------------|---------------------------------------------------------------------------------------------|-----------|
| Create Dockerfile (multi-stage + `/healthz`) | [#38 — PR 2.1](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/38)              | High      |
| Create deploy runbook (provider-agnostic) | [#39 — PR 2.2](https://github.com/lpazpinto/Warhammer40kcrusadeAI/issues/39)               | High      |
| Migrate OAuth from Manus to GitHub        | (next critical step, not yet tracked)                                                       | Critical  |
| Configure Railway environment variables   | (part of runbook execution)                                                                 | High      |
| Configure TiDB Cloud connection + spend limits | (part of runbook execution)                                                            | High      |
