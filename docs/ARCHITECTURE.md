# Architecture — Warhammer 40K Crusade AI Manager

> **Version:** 1.0 (initial)
> **Last updated:** 2026-02-11
> **Source of truth:** code in `lpazpinto/Warhammer40kcrusadeAI` (branch `main`)

This document describes the current architecture of the application based exclusively on files and configurations present in the repository. Items marked **TODO:** indicate areas that need further clarification.

---

## 1. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, shadcn/ui | SPA with client-side routing via `wouter` |
| **Backend** | Express 4, tRPC 11, TypeScript | RPC-first API under `/api/trpc` |
| **Database** | MySQL / TiDB | Managed via Drizzle ORM; connection string in `DATABASE_URL` |
| **Auth** | Manus OAuth | Session cookie; callback at `/api/oauth/callback` |
| **Build** | Vite (frontend), esbuild (server bundle) | Single `pnpm build` produces both client and server artifacts |
| **Package Manager** | pnpm 10.4.1 | Lockfile: `pnpm-lock.yaml` |
| **Runtime** | Node.js 20+ | CI uses Node 20; local dev uses `tsx watch` |
| **Testing** | Vitest | Server-side tests only (`server/**/*.test.ts`) |
| **Serialisation** | Superjson | Drizzle rows (including `Date`) pass through tRPC without manual conversion |

---

## 2. Directory Structure

The repository follows a monorepo-like layout with three main areas: `client/`, `server/`, and `shared/`. The table below lists every important directory and its responsibility.

| Path | Responsibility |
|---|---|
| `client/src/pages/` | Page-level React components (one per route). Key pages: `Home.tsx`, `Campaigns.tsx`, `CampaignDetail.tsx`, `PlayerDetail.tsx`, `BattleSetup.tsx`, `BattlePlay.tsx`, `BattleTracker.tsx`. |
| `client/src/components/` | Reusable UI components. Domain-specific: `BattlePhaseTracker`, `BattleRoundEvents`, `StartOfRoundModal`, `SecondaryMissionResolutionModal`, `SecondaryMissionsPanel`, `MiseryCardsPanel`, `ResupplyShop`, `CommandPhaseSteps`, `MovementPhaseSteps`, `ShootingPhaseSteps`, `ChargePhaseSteps`, `FightPhaseSteps`, `UnitTrackerPanel`, `HordeSpawnPanel`. |
| `client/src/components/ui/` | shadcn/ui primitives (button, card, dialog, etc.). Auto-generated; avoid manual edits. |
| `client/src/contexts/` | React contexts (`ThemeContext`). |
| `client/src/hooks/` | Custom hooks (`useComposition`, `useMobile`, `usePersistFn`). |
| `client/src/lib/` | Utility modules: `trpc.ts` (tRPC client binding), `utils.ts`. |
| `client/src/_core/` | Framework-level client code (auth hooks, constants). Do not edit. |
| `server/routers.ts` | All tRPC procedure definitions. Routers: `auth`, `campaign`, `player`, `crusadeUnit`, `battle`, `horde`, `postBattle`, `battleParticipant`, `storage`. |
| `server/db.ts` | Drizzle query helpers (user upsert, generic DB access). |
| `server/hordeSpawn.ts` | Horde spawn roll logic (2D6 + modifiers, bracket lookup, zone selection). |
| `server/hordeAI.ts` | Horde AI decision engine (distance-based priority system). |
| `server/postBattle.ts` | Post-battle processing (OoA rolls, XP, rank-up, honours, scars). |
| `server/armyParser.ts` | Army list `.txt` file parser (imports units into Order of Battle). |
| `server/storage.ts` | S3 file storage helpers (`storagePut`, `storageGet`). |
| `server/data/` | Static data files: `spawn_tables.json`. |
| `server/_core/` | Framework plumbing: OAuth, context, cookies, env, LLM helper, Vite bridge. **Do not edit.** |
| `shared/` | Code shared between client and server. Domain data: `miseryCards.ts`, `secondaryMissions.ts`, `missions.ts`, `resupplyCards.ts`, `agendas.ts`, `battleTraits.ts`, `requisitions.ts`, `narrativeObjectives.ts`, `crusadeRelics.ts`, `badges.ts`. Also `const.ts` and `types.ts`. |
| `drizzle/` | Database schema (`schema.ts`), relations (`relations.ts`), and migration SQL files. |
| `scripts/` | Utility scripts: `parse_spawn_tables.py`, `seed-resupply-cards.mjs`. |
| `.github/workflows/` | CI and automation workflows (see Section 5). |

---

## 3. Data Flow

The application follows a straightforward tRPC request/response pattern. The frontend calls typed procedures via `trpc.*.useQuery()` and `trpc.*.useMutation()` hooks. The backend resolves these by querying the database through Drizzle ORM helpers in `server/db.ts` or by executing domain logic in modules like `hordeSpawn.ts` and `postBattle.ts`.

Authentication is handled by Manus OAuth. The callback at `/api/oauth/callback` sets a session cookie. Every tRPC request builds a context (`server/_core/context.ts`) that optionally includes the authenticated `user`. Protected procedures (`protectedProcedure`) require a valid session; public procedures (`publicProcedure`) do not.

File uploads go through the `storage.uploadImage` tRPC mutation, which calls `storagePut()` to store bytes in S3 and returns a public URL. Metadata (URL, key) is stored in the database alongside the owning entity.

---

## 4. Running Locally

The following commands are available in `package.json`:

| Command | Purpose |
|---|---|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start the dev server (`tsx watch server/_core/index.ts`) with hot-reload |
| `pnpm build` | Production build: Vite for client, esbuild for server → `dist/` |
| `pnpm start` | Run the production build (`node dist/index.js`) |
| `pnpm check` | TypeScript type-check (`tsc --noEmit`) |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run Vitest test suite |
| `pnpm db:push` | Generate and apply database migrations (`drizzle-kit generate && drizzle-kit migrate`) |

**Required environment variables** (injected by the platform; see `server/_core/env.ts`): `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID`, `OWNER_NAME`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`.

**TODO:** Document how to set up a local MySQL/TiDB instance for fully offline development.

---

## 5. Test Organisation

Tests use **Vitest** and are located alongside the server modules they test. The configuration is in `vitest.config.ts`, which includes files matching `server/**/*.test.ts` and `server/**/*.spec.ts`.

| Test File | Scope | Tests |
|---|---|---|
| `server/command-phase-sp.test.ts` | SP calculation logic (solo vs. multiplayer, edge cases) | 18 |
| `server/horde-spawn.test.ts` | Spawn roll, bracket mapping, modifiers, zone selection | 27 |
| `server/movement-phase.test.ts` | Movement phase step structure and validation | 26 |

There is also a disabled test file (`server/__tests__/resupply-system.test.ts.disabled`) for the resupply card system.

**TODO:** There are no frontend (component/integration) tests. Consider adding React Testing Library or Playwright tests for critical flows like battle setup and phase progression.

---

## 6. CI, Security, and Automated Reviewers

The repository uses **four GitHub Actions workflows** to maintain code quality and automate the review pipeline. The **CI workflow** (`.github/workflows/ci.yml`) runs on every push to `main` and on all pull requests, executing `pnpm install`, `lint` (if present), `test`, and `build` in sequence on Node 20. The **Manus Autopilot CodeRabbit** workflow (`.github/workflows/manus_autopilot_coderabbit.yml`) monitors CodeRabbit review comments on PRs opened by `manus-agent` and dispatches fixes to **ChatGPT Codex** when actionable feedback is detected, while ignoring placeholder or non-actionable comments. The **Manus Autopilot Checks** workflow (`.github/workflows/manus_autopilot_checks.yml`) watches for CI failures on `manus/*` branches and similarly dispatches Codex to attempt automated fixes. Finally, the **Auto-merge** workflow (`.github/workflows/enable_auto_merge_after_checks.yml`) enables auto-merge on PRs from `manus-agent` once all required checks pass. Together, these workflows form a closed-loop automation pipeline: Manus creates PRs → CodeRabbit reviews → Codex fixes issues → CI validates → auto-merge completes. The rules governing agent behaviour are codified in `AGENTS.md`, and human contribution guidelines are in `CONTRIBUTING.md`.
