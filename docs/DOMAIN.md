# Domain Model — Warhammer 40K Crusade AI Manager

> **Version:** 1.0 (initial)
> **Last updated:** 2026-02-11
> **Source of truth:** code in `lpazpinto/Warhammer40kcrusadeAI` (branch `main`)

This document describes the core business rules and domain concepts of the application, based exclusively on evidence found in the repository. Items marked **TODO:** or **Assumption:** indicate areas where the code is ambiguous or incomplete.

---

## 1. Core Entities

The database schema lives in `drizzle/schema.ts`. The table below summarises every persisted entity, its purpose, and the file where it is defined.

| Entity | DB Table | Purpose | Key Fields |
|---|---|---|---|
| **User** | `users` | Authenticated account (Manus OAuth). Has a `role` enum (`admin` \| `user`). | `openId`, `role` |
| **Campaign** | `campaigns` | A Crusade campaign with 4 narrative phases. Owner is a `User`. | `hordeFaction`, `currentPhase`, `battlesPerPhase`, `phase1Result`…`phase4Result` |
| **Player** | `players` | A "Lord Commander" inside a campaign. Optionally linked to a `User` for multiplayer. | `faction`, `requisitionPoints`, `supplyLimit`, `supplyPoints`, `commandPoints`, `secretObjective` |
| **CrusadeUnit** | `crusadeUnits` | A unit in a player's Order of Battle (the "Crusade Card"). Tracks XP, rank, honours, scars. | `rank` (enum: `battle_ready` → `legendary`), `experiencePoints`, `battleHonours`, `battleScars` |
| **Battle** | `battles` | A single battle within a campaign. Tracks round, phase, turn, and horde state. | `battleRound`, `currentTurn`, `currentPhase`, `status` (`setup` → `in_progress` → `completed`) |
| **BattleParticipant** | `battleParticipants` | Links a Player to a Battle with per-battle stats (SP balance, units deployed/destroyed). | `supplyPoints`, `supplyPointsGained`, `supplyPointsSpent` |
| **BattleEvent** | `battleEvents` | Immutable log of in-battle events (phase changes, unit deaths, objectives, etc.). | `eventType`, `battleRound`, `phase`, `description`, `data` (JSON) |
| **ResupplyCard** | `resupplyCards` | Definition of a purchasable Resupply card (bilingual EN/PT). | `cost` (SP), `tags`, `maxPerPlayer`, `maxPerTurn` |
| **PurchasedCard** | `purchasedCards` | Record of a card bought by a participant in a specific round. | `battleRound`, `used` |
| **CampaignInvitation** | `campaignInvitations` | Multiplayer invite with status (`pending` → `accepted` \| `declined`). | `inviterId`, `inviteeId`, `status` |

---

## 2. Campaign Structure

A campaign progresses through **4 narrative phases** (`currentPhase` 1–4). Each phase has a configurable number of battles (`battlesPerPhase`, default 3) and a strategic-points-for-victory threshold (`strategicPointsForVictory`, default 10). The outcome of each phase is stored in `phase1Result` through `phase4Result` (enum: `pending`, `success`, `failure`).

Narrative branching is defined in `shared/narrativeObjectives.ts` (`NARRATIVE_OBJECTIVES`). Each objective has `nextOnSuccess` and `nextOnFailure` pointers, forming a binary tree of story progression across the 4 phases. The campaign setting is "Armageddon (Gatebreakers)".

**Invariants:**

- A campaign always has exactly 4 phases.
- `currentPhase` is an integer in the range `[1, 4]`.
- The `hordeFaction` field determines which spawn table is used (see Section 5).
- **TODO:** There is no explicit DB constraint enforcing `battlesPerPhase` > 0 or `strategicPointsForVictory` > 0.

---

## 3. Battle Lifecycle

A battle transitions through three statuses: `setup` → `in_progress` → `completed`.

### 3.1 Setup Phase

During setup the application handles (see `client/src/pages/BattleSetup.tsx`):

1. Deployment and mission selection (mission tables A and B in `shared/missions.ts`).
2. Requisition Point spending (shop-like flow, one purchase at a time).
3. Agenda selection (2 per player; Tactical Agendas rolled during Command Phase — `shared/agendas.ts`).
4. Unit selection from the player's Order of Battle.
5. Players are always **defenders**; the AI Horde is always the **attacker**.

### 3.2 Battle Rounds and Turns

Once in progress, a battle is structured as a sequence of **Battle Rounds** (`battleRound`, starting at 1). Each round contains two **turns**: the Horde (opponent) turn first, then the Player turn. Turn order is tracked via `currentTurn` (enum: `horde` | `player`).

Each turn consists of 5 **phases** executed in order (defined in `client/src/components/BattlePhaseTracker.tsx`):

| # | Phase ID | Display Name (PT) |
|---|---|---|
| 1 | `command` | Comando |
| 2 | `movement` | Movimento |
| 3 | `shooting` | Tiro |
| 4 | `charge` | Carga |
| 5 | `fight` | Combate |

**Invariant:** Phases must be traversed in order. The round advances only after both the Horde turn and the Player turn complete all 5 phases.

### 3.3 Start-of-Round Events (Horde Mode Section 3.2)

At the start of each Battle Round (implemented in `client/src/components/StartOfRoundModal.tsx` and `BattleRoundEvents.tsx`), the following events occur in order:

1. **Discard active Misery Cards** from the previous round (skipped in Round 1).
2. **Reveal new Misery Cards** based on round number plus any pending cards from failed missions.
3. **Reveal a new Secondary Mission** (1 per round).
4. **Resolve start-of-round rewards/punishments** from previous missions.
5. **Apply active Misery Card effects** that trigger at start of round.
6. **Check reinforcements** (Strategic Reserves may enter from Round 2+).

### 3.4 End-of-Round / End-of-Turn Resolution

Secondary Missions are resolved at two possible timings (defined in `shared/secondaryMissions.ts` → `getMissionResolutionTiming()`):

- **`end_of_turn`**: Action-based missions (IDs 4, 5, 15, 20) resolve at the end of the player's turn.
- **`end_of_round`**: All other missions resolve at the end of the battle round.

Only missions revealed in a **previous** round are eligible for resolution (missions revealed in the current round are excluded via `revealedRound < currentRound` filtering in `BattleTracker.tsx`).

---

## 4. Misery Cards

Misery Cards are negative effects drawn from a shared deck (`shared/miseryCards.ts`, `MISERY_CARDS` array). Each card has an `id`, bilingual name/effect, and `tags` (e.g., `horde_buff`).

**Round-based reveal rules** (implemented in `StartOfRoundModal.tsx` → `getMiseryCardCount()`):

| Round | Cards Revealed | Spawn Roll Modifier |
|---|---|---|
| 1 | 0 | +0 |
| 2 | 1 | +0 |
| 3–4 | 1 | +1 |
| 5+ | 3 | +2 |

**Additional rules:**

- Failed Secondary Missions may add extra Misery Cards as punishment. The count is parsed from the punishment text via `parseMiseryCardPunishment()` in `shared/secondaryMissions.ts`.
- End-of-turn failures reveal Misery Cards **immediately**. End-of-round failures add them to the **next round's** reveal pool.
- All active Misery Cards are **discarded** at the start of each new round (before new ones are drawn).
- Cards are drawn without replacement from the pool of cards not already active (`drawMiseryCards()` in `shared/miseryCards.ts`).

---

## 5. Horde Spawn System

The Horde spawn system is implemented in `server/hordeSpawn.ts` with spawn table data in `server/data/spawn_tables.json`.

**Spawn roll:** 2D6 + round-based modifier (see table above). The result maps to a **bracket**:

| Roll Result | Bracket |
|---|---|
| 2 | `2` |
| 3–4 | `3-4` |
| 5–6 | `5-6` |
| 7–9 | `7-9` |
| 10+ | `10+` |

Each faction (e.g., Tyranids, Orks) has its own spawn table mapping brackets to available unit names. A random unit is selected from the bracket's list. Units spawn in a randomly rolled **spawn zone** (1-based index, number of zones depends on battle round — `getNumberOfSpawningZones()`).

**Invariant:** The spawn modifier is deterministic given the round number: `getSpawnModifiers(round)` returns 0 for rounds 1–2, 1 for rounds 3–4, and 2 for rounds 5+.

---

## 6. Horde AI Decision System

The Horde AI (`server/hordeAI.ts`) makes decisions for each Horde unit based on a priority system:

1. **Closest visible enemy** — engage in combat.
2. **Closest visible objective** (not in spawning zone, not already controlled by Horde) — move to capture.
3. **Defender board edge** — advance towards the player's deployment zone.

Each decision produces an `AIDecision` with `action` (`move`, `shoot`, `charge`, `advance`, `fallback`) and a `reasoning` string displayed to the player in Portuguese.

**TODO:** The AI system uses simple distance-based heuristics. There is no LLM integration for AI decisions yet (the `invokeLLM` helper exists in `server/_core/llm.ts` but is not called by `hordeAI.ts`).

---

## 7. Supply Points (SP) and Command Points (CP)

**Supply Points** are the in-battle currency used to purchase Resupply Cards. SP is tracked per `BattleParticipant` (`supplyPoints`, `supplyPointsGained`, `supplyPointsSpent`) and also on the `Player` entity.

SP is earned during the Command Phase based on objectives controlled:

- **Multiplayer mode:** 1 SP per objective controlled.
- **Solo mode:** 2 SP per objective controlled.

(Evidence: `server/command-phase-sp.test.ts`)

**Command Points** are tracked on the `Player` entity (`commandPoints`, default 2). In Horde Mode, **no CP is generated per round** — players start with their initial CP and do not gain more.

**Assumption:** The "no CP generation" rule is enforced in the UI (`BattleRoundEvents.tsx` explicitly states "Sem geração de CP") but there is no server-side enforcement. **TODO:** Confirm whether CP spending is tracked anywhere.

---

## 8. Resupply Cards

Resupply Cards are defined in `shared/resupplyCards.ts` and persisted in the `resupplyCards` DB table. Each card has a SP `cost`, optional `maxPerPlayer` and `maxPerTurn` limits, and `tags` (e.g., `Strike`, `Supply`, `Fortify`).

Players purchase cards during the Resupply step of the Command Phase via the `ResupplyShop` component (`client/src/components/ResupplyShop.tsx`). Purchases are recorded in the `purchasedCards` table with the `battleRound` when bought.

**Invariant:** A card purchase requires `supplyPoints >= card.cost` for the participant.

---

## 9. Secondary Missions

Secondary Missions (`shared/secondaryMissions.ts`, `SECONDARY_MISSIONS` array) are objectives revealed one per round. Each mission has:

- Bilingual condition, reward, and punishment text.
- Tags: `sp_reward`, `spawn_modifier`, `misery_punishment`, `action`, `combat`, `objective`, `purchase`.

Missions are drawn without replacement via `drawSecondaryMissions()`. Resolution timing is determined by `getMissionResolutionTiming()` — most resolve at end of round, but action-based missions (IDs 4, 5, 15, 20) resolve at end of turn.

Failed missions may trigger Misery Card punishments (parsed from `punishmentPt` text) and/or spawn roll modifiers.

---

## 10. Post-Battle Processing

After a battle completes, the post-battle system (`server/postBattle.ts`) handles:

1. **Out of Action (OoA) rolls:** D6 per destroyed unit → survived (4+), battle scar (2–3), or destroyed (1).
2. **XP calculation:** Base XP + objective bonus + kill bonus.
3. **Rank progression:** `battle_ready` → `blooded` → `battle_hardened` → `heroic` → `legendary`. Each rank unlocks a pool of Battle Honours.
4. **Battle Honours:** Randomly rolled from rank-specific pools when a unit ranks up.
5. **Battle Scars:** Applied when a unit gets a scar result on OoA roll (6 possible scars).
6. **RP calculation:** Based on battle outcome (victory/defeat) and participation.

---

## 11. Unit Ranks and Progression

Unit ranks form a strict linear progression (defined in `drizzle/schema.ts` enum and `server/postBattle.ts`):

| Rank | Battle Honours Pool |
|---|---|
| `battle_ready` | (starting rank, no honours) |
| `blooded` | 4 honours (combat/shooting/resilience/speed) |
| `battle_hardened` | 4 honours (rerolls/inspiration/charge/objective) |
| `heroic` | 4 honours (leadership debuff/mortal wounds/save ignore/command) |
| `legendary` | 4 honours (FNP/extra CP/+1 damage/reroll all hits) |

**TODO:** The XP thresholds for rank-up are not explicitly defined in `postBattle.ts`. Assumption: they follow official Crusade rules but the exact values should be verified.

---

## 12. Crusade Relics

Relics are defined in `shared/crusadeRelics.ts`. Each relic has a `category` (`weapon`, `armor`, `artifact`, `psychic`, `wargear`), `rarity` (`common`, `rare`, `legendary`), and an RP cost. Relics can have `restrictions` (e.g., "CHARACTER only") and `prerequisite` (e.g., "3+ battles").

**TODO:** The relic acquisition flow (UI for purchasing/equipping relics) is not fully traced in the codebase. Verify if `CrusadeUnit.crusadeRelics` field exists or if relics are stored in `battleHonours`.

---

## 13. Badges / Achievements

A badge system is defined in `shared/badges.ts`. Badges have `category` (`combat`, `survival`, `progression`, `collection`, `special`) and `rarity` (`bronze` → `platinum`). Each badge has a `checkFunction` that evaluates `PlayerStats`.

**TODO:** Verify where badge checks are triggered (post-battle? on page load?). The UI for displaying badges is not traced in this analysis.

---

## 14. Multiplayer

Multiplayer is supported via `CampaignInvitation` (invite/accept/decline flow in `server/routers.ts` → `campaign.sendInvite`, `campaign.respondToInvite`). Players can be linked to `User` accounts via `players.userId`. A `Player.isReady` flag exists for multiplayer synchronisation.

**TODO:** Real-time synchronisation mechanism is not evident. Assumption: players share the same battle state via DB polling (tRPC queries).

---

## 15. Glossary

| Term | Meaning in this codebase |
|---|---|
| **Horde** | The AI-controlled enemy faction. Always the attacker. |
| **Lord Commander** | A player character in a campaign (`players.name`). |
| **Order of Battle** | The collection of `CrusadeUnit` records belonging to a player. |
| **Crusade Card** | The `CrusadeUnit` record — tracks a unit's history, XP, honours, and scars. |
| **Supply Points (SP)** | In-battle currency earned from objectives, spent on Resupply Cards. |
| **Command Points (CP)** | Strategic resource; in Horde Mode, no per-round generation. |
| **Misery Card** | Negative effect card drawn from the Misery Deck each round. |
| **Secondary Mission** | Per-round objective with reward/punishment. |
| **Resupply Card** | Purchasable buff/effect card bought with SP. |
| **Spawn Roll** | 2D6 + modifier to determine which Horde unit spawns. |
| **Battle Round** | One full cycle of Horde turn + Player turn. |
| **Narrative Objective** | Phase-level story goal with branching success/failure paths. |
