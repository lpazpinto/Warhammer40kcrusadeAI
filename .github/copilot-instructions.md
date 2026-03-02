# Copilot Instructions — Warhammer40kcrusadeAI

## Project Summary

Full-stack web application for managing Warhammer 40,000 Crusade campaigns. An AI controls the enemy Horde (1200+ units across 21 factions). Features campaign management, Order of Battle tracking, battle phase tracking, requisitions, XP/rank progression, and a real-time battle wizard. All UI text is in Brazilian Portuguese.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (local dev); CI workflow pins Node 20 |
| Package manager | **pnpm** (use `pnpm`, not npm/yarn) |
| Language | TypeScript (strict mode) |
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, Wouter (routing), TanStack Query |
| Backend | Express 4, tRPC 11, Superjson |
| Database | MySQL / TiDB via Drizzle ORM |
| Auth | GitHub OAuth + JWT cookies (jose) |
| Tests | Vitest (`server/**/*.test.ts`) |
| Build | Vite (client) + esbuild (server) |
| Formatter | Prettier |

## Bootstrap & Commands

```bash
# Install (local development — respects lockfile)
pnpm install

# Type-check (no emit)
pnpm run check

# Run tests (Vitest, server only, no DB required)
pnpm test

# Lint (no lint script currently — step is skipped if absent)
pnpm run --if-present lint

# Production build (Vite client + esbuild server → dist/)
pnpm run build

# Dev server (http://localhost:3000, requires .env)
pnpm dev

# Apply DB migrations (requires DATABASE_URL in .env)
pnpm db:push
```

**CI order (ci.yml):** `pnpm install --no-frozen-lockfile` (ci.yml uses this flag intentionally) → lint → test → build.  
All steps use `--if-present`; missing scripts are skipped without error.  
Tests run without a database connection (pure unit tests).  
Build requires no environment variables.

## Project Layout

```
.github/
  copilot-instructions.md   # This file
  workflows/
    ci.yml                  # lint + test + build on every PR
    codeql.yml              # CodeQL security scan
    scorecard.yml           # OpenSSF Scorecard
    dependabot_automerge.yml
    enable_auto_merge_after_checks.yml
    manus_autopilot_checks.yml
    manus_autopilot_coderabbit.yml
client/src/
  pages/          # Route-level pages (Wouter)
  components/     # Reusable React components (battle/, ui/ shadcn)
  hooks/          # Custom React hooks
  lib/            # tRPC client config, utilities
  App.tsx         # Root component + router
  main.tsx        # Entry point
server/
  _core/          # Express app, tRPC adapter, auth, env, LLM, storage
  routers.ts      # All tRPC procedures
  db.ts           # Drizzle query helpers
  armyParser.ts   # Import army list from .txt
  hordeAI.ts      # Horde AI movement/shooting/charge logic
  hordeSpawn.ts   # Horde spawn system (2D6 + round modifiers)
  postBattle.ts   # XP, rank, RP calculation after battle
  __tests__/      # Unit tests
shared/
  types.ts        # Shared TypeScript types (used by client + server)
  missions.ts     # 16 official missions
  agendas.ts      # 5 normal + 18 tactical agendas
  miseryCards.ts  # 32 Misery Cards
  requisitions.ts # Requisition system
  battleTraits.ts # Battle traits
  resupplyCards.ts
  secondaryMissions.ts
drizzle/
  schema.ts       # Drizzle ORM schema (single source of truth for DB types)
  relations.ts    # Drizzle table relations
  *.sql           # Auto-generated migration files
vitest.config.ts  # Test config (aliases @shared, @)
tsconfig.json     # TypeScript config
vite.config.ts    # Vite config (client build)
.env.example      # Required env vars template
```

## Key Conventions

- **No direct commits to `main`**. Always use a PR from a `manus/*` or `agent/*` branch.
- **Minimal patches**: fix only what's requested; avoid refactors.
- **tRPC for all API calls**: add new procedures to `server/routers.ts`; consume with `trpc.*` hooks.
- **Drizzle schema is the source of truth**: edit `drizzle/schema.ts`, then run `pnpm db:push` to migrate.
- **Shared types in `shared/types.ts`**: used by both client and server — import via `@shared/types`.
- **Path aliases**: `@` → `client/src/`, `@shared` → `shared/` (configured in `tsconfig.json` and `vitest.config.ts`).
- **Prettier**: run `pnpm run format` before committing to avoid CI formatting failures.
- **Workflows**: always declare `permissions:` with least privilege (`contents: read` as default).
- **Never trigger automations on Dependabot PRs**.
- **No expensive jobs on every PR**: prefer `schedule` or `workflow_dispatch` for heavy jobs.

## CI Checks to Keep Green

1. `pnpm run check` — TypeScript must pass with no errors.
2. `pnpm test` — All Vitest tests in `server/**/*.test.ts` must pass.
3. `pnpm run build` — Client + server must build without errors.

## Environment Variables (see `.env.example`)

Required at runtime: `DATABASE_URL`, `JWT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`.  
Build and tests run without any env vars set.

