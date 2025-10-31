# Project TODO

## Core Data Model & Backend
- [x] Create database schema for campaigns, players, crusade units, and battles
- [x] Implement army list parser for .txt files from official app
- [x] Create API endpoints for campaign management (create, list, continue)
- [x] Create API endpoints for player management
- [x] Create API endpoints for crusade unit management (CRUD operations)

## Horde Mode AI System
- [ ] Import and structure Horde Mode spawn tables from Excel
- [ ] Implement spawn roll logic (2D6 + modifiers, brackets)
- [ ] Implement Horde AI movement logic (closest enemy > objective > board edge)
- [ ] Implement Horde AI shooting logic (closest legal target)
- [ ] Implement Horde AI charge logic (melee weapon check)
- [ ] Create battle state management system

## Post-Battle Logic
- [ ] Implement Out of Action automatic rolls and results
- [ ] Implement XP gain calculation (including Horde Mode bonuses)
- [ ] Implement Requisition Points (RP) calculation
- [ ] Implement automatic rank progression
- [ ] Implement Battle Honours random selection
- [ ] Implement Battle Traits random selection
- [ ] Implement Battle Scars system

## Frontend UI (Portuguese)
- [ ] Create campaign selection/creation screen
- [ ] Create player setup screen with faction selection
- [ ] Create Order of Battle display (matching official format)
- [ ] Create Crusade Card display and management
- [ ] Create battle setup wizard (17 steps from Armageddon rules)
- [ ] Create battle interface with turn-by-turn AI guidance
- [ ] Create post-battle results and unit update screens
- [ ] Implement Portuguese translations for all UI elements

## Documentation & Testing
- [ ] Write comprehensive README with setup instructions
- [ ] Document database schema and API endpoints
- [ ] Create user guide for campaign management
- [ ] Create user guide for battle execution
- [ ] Test army list import with sample files
- [ ] Test complete battle flow
- [ ] Test post-battle calculations

## GitHub Integration
- [ ] Initialize GitHub repository
- [ ] Push initial code to repository
- [ ] Create detailed README.md with installation steps
- [ ] Add code documentation and comments




## Current Sprint - Horde AI & Battle System
- [x] Parse and import Horde Mode spawn tables from Excel
- [x] Create spawn table data structure in backend
- [x] Implement battle creation and setup wizard
- [x] Implement turn-by-turn battle state management
- [x] Create Horde AI movement decision system
- [x] Create Horde AI shooting decision system
- [x] Create Horde AI charge decision system
- [x] Implement post-battle XP and RP calculations
- [x] Implement Out of Action automatic rolls
- [x] Implement rank progression system
- [ ] Create basic battle interface UI




## Current Sprint - User Interface (Portuguese)
- [x] Create campaign selection/creation screen
- [x] Create player configuration screen with army import
- [x] Create Order of Battle visualization (official format)
- [x] Create Crusade Card detail view
- [ ] Create battle setup wizard (placeholder created)
- [ ] Create battle interface with AI guidance (placeholder created)
- [ ] Create post-battle results screen
- [x] Add Portuguese translations throughout
- [x] Create dashboard layout with navigation




## Bug Fixes
- [x] Fix NaN error in campaign query when accessing /campaigns page


- [x] Fix NaN error in player query when accessing campaign detail page


- [x] Fix NaN still being passed to campaign.get from /campaigns page


- [x] Debug and fix persistent NaN error reaching database despite multiple validation layers


- [x] CRITICAL: NaN still bypassing all validation layers - added client-side transformer validation


- [x] Investigate why campaign.get is being called from /campaigns page without an ID - added first-line validation


- [x] Fix NaN being passed to player.get from CampaignDetail page


- [x] CRITICAL: campaign.get NaN error persists despite all validation layers - added try-catch to prevent propagation


- [ ] Investigate why NaN error still occurs after server restart - may need to clear browser cache


- [x] Fix logging middleware error - JSON.stringify can return undefined


- [x] Fix login redirect - user gets stuck on home page after login


- [ ] CRITICAL: OAuth login not working - user cannot authenticate even after login


- [x] Fix NaN error on campaign creation - campaign is created but frontend receives NaN (works after refresh)
- [x] Fix NaN error on player creation - same issue as campaign creation
- [x] Fix import army dialog - button not visible when text is too long (needs scroll)


- [x] CRITICAL: "invalid ID returned from database" error when creating campaigns - ID validation too strict or database returning unexpected format


- [x] CRITICAL: NaN being passed to crusadeUnits.get query - need to validate unit ID before query


- [x] CRITICAL: Army parser only importing first unit from CHARACTERS section - need to fix parser to handle all units in all categories


- [x] Fix army parser to correctly handle vehicles - weapons should not be counted as separate models


- [ ] Add player management page - view all players, edit, and delete players


- [x] Allow players to edit crusade name (custom name) for each unit after import



## Crusade Card Features (Following Official Rules)

### Battle Tracking & Experience
- [x] Track battles played and battles survived for each unit
- [x] Track enemy units destroyed (kills)
- [x] Automatic XP calculation based on battles and kills
- [x] Automatic rank progression (Battle Ready → Blooded → Battle-Hardened → Heroic → Legendary)
- [x] Display XP progress bar showing progress to next### Battle Honours System
- [x] Add Battle Honours when unit gains rank (1 honour per rank gained)
- [x] Create Battle Honours database/list by faction
- [x] UI to select and add Battle Honours to units
- [x] Display Battle Honours on unit cards with descriptions
- [x] Maximum Battle Honours based on rank (Blooded:### Battle Scars System
- [x] Track Out of Action results (when unit is destroyed/removed)
- [x] Roll for Battle Scars when unit goes Out of Action
- [x] Create Battle Scars database/list
- [x] UI to assign Battle Scars to units
- [x] Display Battle Scars on Crusade Card with negative effects [ ] Option to remove Battle Scars via Requisitions

#### Battle Traits System
- [x] Add faction-specific Battle Traits
- [x] UI to assign Battle Traits to units
- [x] Display Battle Traits on unit cardsd

### Requisitions System
- [ ] Create Requisitions database (Increase Supply Limit, Rearm and Resupply, etc.)
- [ ] Track Requisition Points (RP) per player
- [ ] UI to spend RP on Requisitions
- [ ] Apply Requisition effects (add units, remove scars, etc.)
- [ ] Log Requisition history

### Crusade Relics System
- [x] Create Crusade Relics database by faction
- [x] Assign Relics to CHARACTER units only
- [x] Limit 3 Relics per army (not per CHARACTER)
- [x] UI to select and assign Relics
- [x] Display Relics on Crusade Card

### Wargear & Equipment
- [x] Track wargear changes and upgrades
- [ ] Update points cost when wargear changes (manual for now)
- [x] Display current wargear on Crusade Card

### Battle Recording
- [x] Create Battle Report form (opponent, mission, result)
- [x] Automatically update player stats after battle (battles played, victories, RP)
- [x] Track which units participated in each battle
- [x] Battle history log per campaign and per player

### Order of Battle Management
- [x] Display total Supply Limit vs Supply Used
- [ ] Mark units as "In Reserve" vs "Active" (future feature)
- [ ] Enforce Supply Limit when adding units (warning shown)
- [x] Calculate total army Power Level and Points

### Crusade Card UI Improvements
- [ ] Detailed unit view page showing all Crusade Card fields
- [ ] Visual representation of rank progression
- [ ] Icons for Battle Honours, Scars, Traits, and Relics
- [ ] Print-friendly Crusade Card layout
- [ ] Export Crusade Card as PDF

### AI Integration (Future)
- [ ] AI suggestions for Battle Honours based on unit role
- [ ] AI-generated battle narratives
- [ ] AI opponent for solo play
- [ ] Strategic advice based on army composition



## Enhanced Battle Recording Workflow
- [ ] Create interactive battle recording wizard (step-by-step) - future enhancement
- [ ] Step 1: Select participating units from player's roster - future enhancement
- [x] Step 2: For each unit, ask: survived? kills? completed objective?
- [x] Step 3: Automatically roll and assign Battle Honours when unit gains rank
- [x] Step 4: Automatically roll and assign Battle Scars when unit is destroyed
- [x] Step 5: Show summary of all changes (XP gained, ranks promoted, honours/scars assigned)
- [x] Improve RecordBattleDialog to show automatic Honours/Scars



## CRITICAL: Supply System Bug
- [x] Change Supply Used from Power Level to Points (sum of pointsCost)
- [x] Change Supply Limit default from 50 PL to 1000 points
- [x] Update Order of Battle display to show points instead of PL
- [x] Update database schema (supplyLimit field now stores points)




## Horde Mode Battle System Implementation
- [ ] Battle Setup Phase
  - [ ] Select participating players from campaign
  - [ ] Choose deployment type (Dawn of War, Hammer and Anvil, etc.)
  - [ ] Select mission from mission pack
  - [ ] Configure spawn zones based on game size (2 zones for 1000pts, 4 zones for 2000pts)
  - [ ] Place objective markers
  - [ ] Choose Horde faction and Primary Faction Rule
  - [ ] Shuffle Misery Deck, Secret Objectives Deck, Secondary Mission Deck
  
- [ ] Battle Round Management
  - [ ] Display current round number
  - [ ] Show active Misery cards
  - [ ] Show current Secondary Mission
  - [ ] Spawn Horde units in each zone (roll 2D6, choose from bracket)
  - [ ] Track Supply Points (SP) gained from objectives and kills
  - [ ] Resupply Step - spend SP on purchases
  
- [ ] Horde AI Controller
  - [ ] Movement AI (move toward closest visible enemy → objective → defender edge)
  - [ ] Shooting AI (shoot closest legal target, prioritize Anti-X, Precision, Melta)
  - [ ] Charge AI (charge if unit has melee weapons better than CCW)
  - [ ] Fight AI (attack closest enemy model)
  - [ ] Consolidation AI (move toward closest enemy/objective)
  
- [ ] Battle Tracking
  - [ ] Track which player units participated
  - [ ] Track which units were destroyed
  - [ ] Track kills per unit
  - [ ] Track objectives controlled
  - [ ] Calculate SP rewards
  
- [ ] End of Battle
  - [ ] Resolve Secret Objectives (5 round mode)
  - [ ] Award Requisition Points (1 RP per battle, +1 if won)
  - [ ] Automatically update unit stats (battles played, survived, kills, XP)
  - [ ] Automatically roll and assign Battle Honours for promoted units
  - [ ] Automatically roll and assign Battle Scars for destroyed units
  - [ ] Show battle summary with all changes
  
- [ ] Battle UI Components
  - [ ] Round tracker with phase indicators
  - [ ] Spawn zone visualizer
  - [ ] Horde unit cards with AI instructions
  - [ ] Player unit selector for tracking
  - [ ] SP and CP counters
  - [ ] Misery card display
  - [ ] Secondary Mission display
  - [ ] Quick actions (end phase, end round, spawn units)



## Current Bug Fixes
- [x] Fix duplicate function exports in db.ts (createBattle, getBattleById)
- [x] Fix BattleSetup.tsx to use correct campaign property (currentBattleRound instead of currentRound)
- [x] Remove duplicate Horde faction selection from BattleSetup (already defined in campaign)
- [x] Fix routers.ts duplicate property and missing query method errors




## New Bug Fix
- [x] Fix player supplyLimit default value - should be 1000 points instead of 50



- [x] Fix NaN error in battle.get query when accessing /battle/setup/:campaignId route




## Battle Unit Selection Feature
- [x] Add step in battle wizard for each player to select units from their Order of Battle
- [x] Calculate points limit per player (battle size / number of players)
- [x] Show available units with points costs
- [x] Validate total points don't exceed player's limit
- [x] Display selected units summary before battle starts
- [ ] Store selected unit IDs in battle participants table (will be implemented when battle creation is finalized)




## Bug Fix
- [x] Fix "Rendered more hooks than during the previous render" error in BattleSetup - extracted UnitSelection into separate component



- [ ] Fix battle.get NaN error - find and remove code trying to fetch battle with invalid ID




## Campaign Phase Management System
- [x] Update campaign schema to include:
  - gameMaster (player who manages the campaign)
  - battlesPerPhase (number of battles each phase should have)
  - strategicPointsToWin (points needed to win a phase)
  - currentPhase (1-4)
  - phaseStrategicPoints (points earned in current phase)
  
- [ ] Create campaign phases tracking:
  - Phase 1, 2, 3, 4
  - Track strategic points per phase
  - Determine phase success/failure based on strategic points
  - Reset strategic points when moving to next phase
  
- [x] Update battle schema to include:
  - phaseNumber (which phase this battle belongs to)
  - strategicPointsEarned (points earned by alliance in this battle)
  
- [ ] Campaign detail page improvements:
  - Show current phase (1-4)
  - Show strategic points progress for current phase
  - Show phase success/failure status
  - List all battles organized by phase
  - Show battle results and strategic points earned
  
- [ ] Battle completion flow:
  - Record strategic points earned
  - Update phase strategic points total
  - Check if phase is complete (all battles played OR strategic points goal reached)
  - Automatically advance to next phase when current phase ends
  - Show phase results (success/failure)
  
- [ ] Campaign creation flow:
  - Select game master from players
  - Define battles per phase (campaign speed: 1-4 battles)
  - Define strategic points needed to win each phase
  
- [ ] Campaign end condition:
  - After phase 4, determine overall campaign winner
  - Show final campaign results
  - Mark campaign as completed




## Campaign Creation Form Updates
- [x] Remove "Modo de Jogo" (5 Rodadas) - campaigns always have 4 phases
- [ ] Add Game Master selection (dropdown of players, or create new player as GM)
- [x] Add campaign speed selection (1-4 battles per phase: Very Fast, Fast, Normal, Slow)
- [x] Add strategic points goal input (points needed to win each phase)
- [x] Create predefined phase templates with stories and bonuses:
  - Phase I: Stabilising the Front
  - Phase II: Reclaim the Lost Hives  
  - Phase III: Strengthen the Imperator Line
  - Phase IV: Raze the Monoliths
  - Phase V: Light in the Dark
  - Phase VI: Shatter the Red Angel's Gate
- [x] Store phase narratives and bonuses in database
- [x] Prepare system for custom campaign phases in future (campaignType field allows different campaign types)





## Multiplayer Campaign System
- [x] Update campaign creation: creator is automatically Game Master
- [ ] Create campaign invitations system:
  - [x] Add campaignInvitations table (campaignId, invitedUserId, status: pending/accepted/declined)
  - [ ] Game Master can invite other users by email/username
  - [ ] Invited users receive notification and can accept/decline
  - [ ] Accepted users become Lord Commanders in the campaign
  
- [x] Update players table:
  - [x] Add userId field to link player to user account
  - [x] Add isReady boolean field (default false)
  - [x] Track which user owns which player/army
  
- [ ] Permissions system:
  - [ ] Only Game Master can modify campaign settings
  - [ ] Only Game Master can start battles
  - [ ] Each user can only manage their own player/army
  - [ ] Users cannot view or edit other players' armies
  
- [ ] Ready status system:
  - [ ] Add "Pronto para Batalha" button for each player
  - [ ] Show ready status for all players in campaign
  - [ ] Battle can only start when all players are ready
  - [ ] Reset all players' ready status after each battle
  
- [ ] UI updates:
  - [ ] Campaign detail page shows Game Master name
  - [ ] Show list of invited/participating users
  - [ ] Show ready status indicators for each player
  - [ ] Invite users button (Game Master only)
  - [ ] Ready button (visible only for own player)
  - [ ] Start battle button (Game Master only, enabled when all ready)




## Ready Status and Invite UI
- [ ] Create tRPC endpoints for invitations:
  - [ ] invitation.send (GM only, requires email/username)
  - [ ] invitation.list (get pending invitations for current user)
  - [ ] invitation.accept (accept invitation)
  - [ ] invitation.decline (decline invitation)
  
- [ ] Create tRPC endpoints for ready status:
  - [ ] player.toggleReady (toggle own player's ready status)
  - [ ] player.resetAllReady (reset all players after battle, GM only)
  
- [ ] Update CampaignDetail UI:
  - [ ] Add "Convidar Jogador" button (GM only, next to "Adicionar Jogador")
  - [ ] Show ready status indicator for each player (checkmark icon)
  - [ ] Add "Pronto para Batalha" toggle button for each player (only for own player)
  - [ ] Update "Iniciar Batalha" button to only enable when all players are ready
  - [ ] Show count of ready players (e.g., "2/3 jogadores prontos")


