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
- [x] Fix objectives modal not appearing when clicking "Próximo Passo" in Command Phase Step 3 - modal now auto-opens when entering Step 3



## Change "Rodadas" to "Fases" (Crusade Armageddon Terminology)
- [x] Update database schema (campaigns table: battlesPerPhase, currentPhase)
- [x] Update backend code (db.ts, routers.ts)
- [x] Update frontend UI (all components showing "Rodadas")
- [x] Update campaign creation dialog
- [x] Update campaign detail page
- [x] Test all changes
- [x] Commit to GitHub


## Implement Narrative Objectives System (Armageddon Campaign)
- [ ] Extract and translate all Narrative Objectives from images
- [ ] Update database schema:
  - [ ] Add battlesPerPhase field to campaigns table
  - [ ] Add strategicPointsForVictory field to campaigns table
  - [ ] Add currentNarrativeObjective field to campaigns table
  - [ ] Add phaseResult field to track success/failure per phase
  - [ ] Change gameMode to always be 4 phases (remove 5_phases/infinite)
- [ ] Create narrativeObjectives.ts with all 6 objectives data structure
- [ ] Update campaign creation form:
  - [ ] Add "Batalhas por Fase" input
  - [ ] Add "Pontos Estratégicos para Vitória" input
  - [ ] Remove gameMode selector (always 4 phases)
- [ ] Update CampaignDetail page:
  - [ ] Show current Narrative Objective title and description
  - [ ] Show SUCCESS benefits
  - [ ] Show FAILURE consequences
  - [ ] Show phase progress (battles completed / total battles)
- [ ] Implement phase completion logic:
  - [ ] Calculate if phase was success or failure based on strategic points
  - [ ] Determine next Narrative Objective based on result
  - [ ] Update currentPhase and currentNarrativeObjective
- [ ] Test complete campaign flow through all 4 phases
- [ ] Commit to GitHub


## Fix Campaign Creation Invalid ID Error
- [ ] Investigate why database is returning invalid ID after campaign creation
- [ ] Check createCampaign function in db.ts
- [ ] Fix ID return logic in campaign.create mutation
- [ ] Test campaign creation to ensure valid ID is returned
- [ ] Commit fix to GitHub


## Fix NaN Player ID Error in Campaign Detail
- [x] Identify where player.get query is being called with NaN ID
- [x] Add validation to prevent NaN IDs from being passed to queries
- [x] Fix the source of the invalid player ID (Ver Detalhes link)
- [x] Test campaign detail page with players
- [x] Commit fix to GitHub


## Fix NaN Crusade Unit ID Error
- [x] Find where crusadeUnit.get is being called with NaN (endpoint missing validation)
- [x] Add validation to prevent NaN unit IDs
- [x] Error resolved - validation in endpoint prevents NaN from reaching database
- [x] Confirmed no NaN errors in server logs
- [x] All commits pushed to GitHub


## Implement Notification System for Campaign Invites
- [x] Create campaignInvitations table in database schema
- [x] Add userId and isReady fields to players table
- [x] Create database functions in db.ts (createCampaignInvitation, getInvitationsByInviteeId, etc.)
- [x] Add campaign.sendInvite endpoint with validation
- [x] Add campaign.listInvites endpoint
- [x] Add campaign.respondToInvite endpoint with auto-player creation
- [x] Create /notifications page with invite list
- [x] Add accept/decline UI for invites
- [x] Add route to App.tsx
- [x] Fix all TypeScript errors
- [ ] Add notification badge in header showing pending invite count
- [ ] Test complete multiplayer flow: invite → accept → join campaign


## Remove Points Limit from Campaign Creation
- [ ] Remove "Limite de Pontos" field from campaign creation dialog in Campaigns.tsx
- [ ] Verify Supply Limit is always 1000 points per player (already implemented)
- [ ] Confirm Order of Battle shows all units (already working)
- [ ] Confirm Battle Setup allows selecting battle size and units (already working)
- [ ] Test complete flow: create campaign → import army → start battle → select units


## Fix NaN Error in player.get on Campaign Detail Page
- [x] Find where player.get is being called with NaN ID (PlayerDetail.tsx)
- [x] Add validation to prevent NaN from being passed to player.get (added logging and extra validation)
- [x] Frontend already has validation to prevent NaN links
- [x] FOUND ROOT CAUSE: createPlayer was using Number(result.insertId) without validation
- [x] Added robust insertId handling to createPlayer (same as createCampaign)
- [x] Added validation to updatePlayer to prevent NaN IDs
- [x] Added logging to getPlayerById to track all calls
- [x] Error fully resolved - all database functions now validate IDs


## Fix NaN Error in crusadeUnit Queries
- [x] Find createCrusadeUnit and add robust insertId validation
- [x] Add validation to getCrusadeUnitById
- [x] Add validation to updateCrusadeUnit
- [x] Add validation to deleteCrusadeUnit
- [x] All crusadeUnit database functions now validate IDs


## Fix Weapon Parsing from Official App Export
- [x] Check armyParser.ts to see how weapons with bullet points (◦) are being parsed
- [x] Fix parser to correctly extract weapons that start with ◦
- [x] Handle single-model CHARACTER units (create implicit model with unit name)
- [x] Save current model when changing categories or units
- [x] Distinguish between models and weapons using heuristics
- [x] Test with official template format - ALL WORKING!
- [x] Verified: Krieg Command Squad (3 models, 9 weapons), Lord Marshal Dreir (1 model, 3 weapons), Death Korps (2 models, 5 weapons)


## Weapons Not Appearing After Import with User's File
- [x] Test parser with user's actual army file (exercito.txt) - Parser working perfectly!
- [x] Found root cause: models field stored as JSON string but frontend expected array
- [x] Added parseModels() helper function to parse JSON string to array
- [x] Added weapons display section with parseModels() in PlayerDetail
- [x] All weapons now display correctly after import


## Parser Not Extracting All Models
- [x] Fixed parser to extract ALL models from unit
- [x] Improved heuristic with expanded weapon and model keyword lists
- [x] Parser now correctly identifies models vs weapons
- [x] All models are saved when encountering new model (not just weapons)


## Add Unit Alias Field
- [x] Schema already has crusadeName field (line 81)
- [x] crusadeUnit.update endpoint already accepts crusadeName parameter
- [x] Added pencil icon button next to unit name in PlayerDetail
- [x] Connected button to updateUnit mutation with invalidation
- [x] Players can now give custom names to their units (e.g., "The Emperor's Fury")


## Battle Setup Wizard Implementation
- [x] Commit all current changes to GitHub
- [x] Create missions data structure with Table A (1-3) and Table B (4-6)
- [x] Implement mission selection step (manual or random)
- [x] Implement points allocation step
- [x] Implement unit selection per player (respecting point limits) - Basic UI done, full implementation pending
- [x] Implement final confirmation screen with battle summary
- [x] Show selected mission details if random was chosen
- [ ] Test complete battle setup flow
- [ ] Create checkpoint after implementation

### Mission Table A (1-3)
- [ ] Total Domination (pg 114)
- [ ] Empyric Distortion (pg 116)
- [ ] Metamorphosis (pg 118)
- [ ] Lighting the Path (pg 120)
- [ ] Temporal Flux (pg 122)
- [ ] Offering of Blood (pg 124)
- [ ] Fighting Gravity (pg 126)
- [ ] Seal the Rifts (pg 128)

### Mission Table B (4-6)
- [ ] Brazen Bridge (pg 115)
- [ ] Blood and Shadow (pg 117)
- [ ] Breakout (pg 119)
- [ ] Trail of Blood (pg 121)
- [ ] Temporal Raid (pg 123)
- [ ] Veil Between Worlds (pg 125)
- [ ] Into the Mouth of Hell (pg 127)
- [ ] Assault the Warp Gate (pg 129)


## Fix Parser for Single-Model Units (WARLORD/CHARACTER)
- [x] Completely rewrote parser with two-pass approach
- [x] First pass detects if unit has ◦ lines (multi-model) or not (single-model)
- [x] Single-model CHARACTERS: create 1 model with unit name, all • lines are weapons
- [x] Multi-model units: • lines with "Nx" are models, ◦ lines are weapons
- [x] Tested with Lord Marshal Dreir (1 model with 3 weapons) ✅
- [x] Ready to test with Daemonifuge (should have 2 models)
- [x] Multi-model units verified working correctly


## Implement Unit Selection for Battle Setup
- [x] Create Dialog component for unit selection
- [x] Fetch crusade units for each player
- [x] Display units with checkboxes
- [x] Show points cost for each unit
- [x] Track total selected points and validate against limit
- [x] Save selected unit IDs to wizard state
- [x] Display selected units count in step 3
- [ ] Test with multiple players and different point limits


## Implement Requisitions System
- [x] requisitionPoints field already exists in players table schema
- [x] Created requisitions.ts with all 6 requisition types and costs
- [x] Added step 3 "Gastar Requisições" to battle setup wizard (5 steps total now)
- [x] Implemented requisition purchase UI with RP balance display
- [x] Track purchased requisitions per player in wizard state
- [x] Validate RP balance before purchase
- [x] Requisition types implemented:
  - [x] Increase Supply Limit (1RP) - +200 points to supply limit
  - [x] Rearm and Resupply (1RP) - Change unit weapons (before battle)
  - [x] Repair and Recuperate (1-5RP) - Remove Battle Scars (after battle - disabled in setup)
  - [x] Fresh Recruits (1-4RP) - Add models to unit
  - [x] Renowned Heroes (1-3RP) - For units with 30XP
  - [x] Legendary Veterans (3RP) - For CHARACTERs with 30XP
- [ ] Test requisition purchases with multiple players
- [ ] Commit changes to GitHub


## Translate Requisitions to Portuguese and Implement Automatic Effects
- [x] Translate all requisition names and descriptions to Portuguese
- [x] Add supplyLimit field to players schema
- [ ] Implement automatic effects for each requisition:
  - [x] Aumentar Limite de Suprimento - Add 200 to player.supplyLimit (DONE & TESTED)
  - [ ] Rearmar e Reabastecer - Modal created, effect pending
  - [ ] Reparar e Recuperar - Modal created, effect pending
  - [ ] Recrutas Frescos - Modal created, effect pending
  - [ ] Heróis Renomados - Modal created, effect pending
  - [ ] Veteranos Lendários - Modal created, effect pending
- [x] Create tRPC mutation for Increase Supply Limit
- [x] Create generic requisition modal for unit selection
- [ ] Create tRPC mutations for other requisition effects
- [ ] Test each requisition effect with database updates
- [ ] Commit changes to GitHub


## Fix Requisition Purchase Bugs
- [x] Fix "Invalid hook call" error by moving trpc.useUtils() outside callback
- [x] supplyLimit column already exists in database
- [x] Update existing players to have default supplyLimit of 1000
- [x] Fix PlayerDetail UI to display supplyLimit correctly (was showing supplyPoints instead of supplyLimit)
- [x] Verify database query returns supplyLimit field (db.select() returns all fields automatically)
- [ ] Test requisition purchase and verify supplyLimit updates correctly
- [ ] Commit fixes to GitHub


## Add Supply Usage Visual Indicator
- [x] Calculate total supply consumed (sum of all unit pointsCost in Order of Battle)
- [x] Add Progress component to show supply usage bar
- [x] Display "Supply: X / Y" with visual bar
- [x] Color code bar (green < 80%, yellow 80-100%, red > 100%)
- [x] Added warning message when over limit
- [ ] Test with different supply limits and unit counts
- [ ] Commit changes to GitHub


## UI Improvements - Campaign Detail Page
- [ ] Add "Ready" toggle button for each player in campaign
- [ ] Add "Invite User" button to send multiplayer invites
- [ ] Create invite dialog with user search/email input
- [ ] Show ready status indicator for each player
- [ ] Disable "Start Battle" button until all players are ready (multiplayer mode)

## Day 7: Battle System tRPC Endpoints
- [x] Database helper functions for battles already exist in server/db.ts
- [x] battle.create endpoint already implemented
- [x] battle.get endpoint already implemented
- [x] battle.update endpoint already implemented
- [x] battle.list endpoint added (list battles by campaign)
- [x] battle.recordEvent endpoint added (for future battle tracking)
- [x] All endpoints tested and working
- [x] Server restarted successfully with no errors


## Day 8: XP Distribution System
- [x] Create XP calculation helper function (base XP + survival + kills)
- [x] Create rank progression helper function (check XP thresholds)
- [x] Implement battle.distributeXP endpoint
- [x] Update crusade units with new XP and ranks
- [x] Distribute RP to players after battle
- [x] Test complete XP distribution flow
- [x] Save checkpoint and commit to GitHub


## Day 9: Customization Fields
- [x] Add armyBadge field to players table (varchar URL)
- [x] Add battlePhotos field to campaigns table (JSON array of URLs)
- [x] Update database schema in drizzle/schema.ts
- [x] Create SQL migration to add columns safely
- [x] Test schema changes
- [x] Update todo.md and save checkpoint


## Day 10: Image Upload Endpoints
- [x] Create storage router in routers.ts
- [x] Implement storage.uploadImage endpoint (generic S3 upload)
- [x] Implement player.updateArmyBadge endpoint
- [x] Implement campaign.addBattlePhoto endpoint
- [x] Test image upload with S3 integration
- [x] Update todo.md and save checkpoint


## Day 11: BattlePhaseTracker UI Component
- [x] Create BattlePhaseTracker component in client/src/components/
- [x] Implement phase navigation (Command, Movement, Shooting, Charge, Fight)
- [x] Add turn counter and round tracker
- [x] Create visual indicators for current phase
- [x] Add buttons to advance/go back phases
- [x] Create BattleTracker page to test the component
- [x] Add route to App.tsx
- [x] Update todo.md and save checkpoint


## Day 12: Battle State Persistence
- [x] Add currentPhase field to battles table (varchar)
- [x] Add playerTurn field to battles table (enum: player/opponent)
- [x] Update database schema and run migration
- [x] Modify BattlePhaseTracker to accept initial state props
- [x] Add auto-save on phase change using battle.update mutation
- [x] Restore state from database when loading battle
- [x] Test save/restore functionality
- [x] Update todo.md and save checkpoint


## Day 13: Unit Tracker Panel
- [x] Create UnitTrackerPanel component in client/src/components/
- [x] Display active units with green status
- [x] Display destroyed units with red status
- [x] Display out-of-action units with yellow status
- [x] Add casualty counter per player
- [x] Integrate with battle participants query (placeholder for now)
- [x] Add to BattleTracker page layout
- [x] Test with real battle data
- [x] Update todo.md and save checkpoint


## Day 14: Battle Participants Router
- [x] Create battleParticipant router in routers.ts
- [x] Implement battleParticipant.list endpoint
- [x] Implement battleParticipant.get endpoint
- [x] Implement battleParticipant.create endpoint
- [x] Implement battleParticipant.update endpoint
- [x] Connect Unit Tracker to real participant data
- [x] Query crusade units for each participant (placeholder for now)
- [x] Test complete data flow
- [x] Update todo.md and save checkpoint


## Day 15: Query Crusade Units for Unit Tracker
- [x] Create crusadeUnit.getByIds endpoint to fetch multiple units
- [x] Update BattleTracker to query crusade units
- [x] Map real unit data (name, crusadeName, powerRating, rank)
- [x] Replace placeholder data with real unit information
- [x] Test Unit Tracker with real crusade unit data
- [x] Update todo.md and save checkpoint


## Day 16: Quick Actions and Enhanced Unit Display
- [x] Add Quick Action buttons to UnitTrackerPanel (Mark Destroyed, Add Kill)
- [x] Add rank badge display with color coding
- [x] Implement out-of-action status (yellow)
- [x] Integrate Mark Destroyed with battleParticipant.update
- [x] Integrate Add Kill with battleParticipant.update
- [x] Add toast notifications for user feedback
- [x] Test all quick actions
- [x] Update todo.md and save checkpoint


## Days 17-19: Complete Integrated Battle System (8000 credits)

### Day 17: Horde Spawn Integration
- [x] Add "Spawn Horde" button to BattlePhaseTracker (Command Phase only)
- [x] Integrate with horde.spawn endpoint
- [x] Add spawned units to battle participants (toast notification)
- [x] Display spawn roll results (2D6 + modifiers)
- [x] Loading state during spawn

### Day 18: Battle Summary Modal
- [x] Create BattleSummaryModal component
- [x] Display battle statistics (kills, destroyed, objectives)
- [x] "Distribute XP" button with backend integration
- [x] Calculate and display RP awarded
- [x] Navigate back to campaign after completion
- [x] Show victory/defeat status
- [x] List all participants with final stats
- [x] Add "End Battle" button to BattleTracker page

### Day 19: Unit Details Popover
- [x] Create UnitDetailsPopover component
- [x] Trigger on unit card click in Unit Tracker
- [x] Display battle honours, traits, and scars
- [x] Show XP and rank progression
- [x] Show complete unit statistics (battles, kills, etc.)
- [x] Integrated with Unit Tracker cards
- [x] Full unit data passed from BattleTracker

### Integration & Testing
- [x] Complete battle flow implemented (spawn → track → finish → XP)
- [x] All components compiled successfully
- [x] Update todo.md and save checkpoint



## Change Initial Requisition Points to 5
- [x] Update player.create endpoint to set requisitionPoints to 5 by default
- [x] Add useAuth hook to CampaignDetail to get userId
- [x] Test player creation with army import
- [x] Verified server compiles successfully


## Fix Battle Start Redirect
- [x] Find battle setup wizard "Iniciar Batalha" button handler
- [x] Change redirect from campaign page to BattleTracker
- [x] Pass battle ID to BattleTracker route
- [x] Create battle and participants before redirect
- [x] Test complete flow


## Fix NaN Battle ID Error in BattleTracker
- [x] Debug why battle.id is NaN after creation
- [x] Fixed route conflict between /battle/:id and /battle/setup/:campaignId
- [x] Changed BattleTracker route to /battle/tracker/:id
- [x] Updated route in App.tsx and BattleTracker.tsx
- [x] Added validation and error handling in handleStartBattle
- [x] Test complete flow


## Debug Persistent NaN Battle ID Error
- [x] Check if BattleSetup imports any components that query battle.get
- [x] Search for useRoute hooks that might be extracting wrong params
- [x] Check if there's a global context or provider querying battles
- [x] Add better validation to prevent NaN queries
- [x] Fixed by adding isValidBattleId check in BattleTracker


## Add Early Return to BattleTracker
- [x] Check if route matches before rendering
- [x] Add early return when battleId is invalid
- [x] Return null instead of rendering with NaN
- [x] Test fix - server compiled successfully


## Investigate Why NaN Error Persists
- [x] Check if BattleSetup imports BattleTracker or shared components
- [x] Check for tRPC prefetch or cache issues
- [x] Add console.log to trace query origin
- [x] Fixed React hooks violation - moved early return after all hooks
- [x] Added proper validation with enabled flag on queries


## Add Detailed Logging to Trace NaN Query
- [x] Add console.log at start of BattleTracker component
- [x] Log match, params, battleId, isValidBattleId
- [x] Analyzed logs - BattleTracker not mounting on /battle/setup
- [x] Discovered query executed despite enabled:false
- [x] Implemented Zod validation to reject NaN at input level


## Implement Detailed Command Phase with Sub-Steps and Resupply Cards
- [ ] Design database schema for phase steps tracking
- [ ] Add supplyPoints field to battleParticipants table
- [ ] Create resupplyCards table with card definitions
- [ ] Create purchasedCards table to track player purchases
- [ ] Translate all 25 Resupply Cards from English to Portuguese
- [ ] Create resupply cards data file with all card details (name, cost, effect, tags)
- [ ] Implement backend endpoints for SP management:
  - [ ] Add SP to participant (objectives, horde kills, secondary missions)
  - [ ] Get participant SP balance
  - [ ] Purchase resupply card (validate SP, deduct cost, record purchase)
  - [ ] List available resupply cards
  - [ ] List purchased cards for participant
- [ ] Implement phase step navigation system in BattleTracker:
  - [ ] Add currentPhaseStep field to battles table
  - [ ] Create phase step definitions (Command: Start/Battle-shock/Resupply)
  - [ ] Add "Próximo Passo" button to advance through sub-steps
  - [ ] Display current step instructions to players
- [ ] Create Battle-shock test UI:
  - [ ] List units Below Half-strength
  - [ ] Roll 2D6 vs Leadership for each unit
  - [ ] Mark units as Battle-shocked if failed
  - [ ] Track Battle-shocked status until next Command phase
- [ ] Create Resupply Card selection UI:
  - [ ] Display all available cards in grid/list
  - [ ] Show card cost, effect, and tags
  - [ ] Show player's current SP balance
  - [ ] Allow purchasing cards (deduct SP, add to player's purchases)
  - [ ] Show purchased cards history
  - [ ] Validate maximum uses per turn restrictions
- [ ] Implement SP gain logic:
  - [ ] 1 SP per objective marker controlled (during Resupply step)
  - [ ] 1 SP when destroying Horde unit (immediate)
  - [ ] SP from successful Secondary Missions
  - [ ] Double SP gains in solo play
- [ ] Test complete Command Phase flow with all sub-steps
- [ ] Commit to GitHub



## Implement Detailed Command Phase with Resupply Cards
- [x] Add database schema for phase steps and SP tracking
- [x] Create resupply cards table and purchased cards table
- [x] Translate all 25 resupply cards to Portuguese
- [x] Create backend endpoints for SP management
- [x] Seed database with resupply cards
- [ ] Implement phase step navigation in BattleTracker
- [ ] Create Command Phase sub-steps UI (Start, Battle-shock, Resupply)
- [ ] Build resupply card selection modal
- [ ] Implement SP calculation and distribution
- [ ] Add objective control tracking UI
- [ ] Test complete Command Phase flow


## Command Phase Improvements
- [ ] Block "Próxima Fase" button when in Command Phase sub-steps
- [ ] Create objectives input modal for Step 3 (Reabastecimento)
- [ ] Implement automatic SP distribution for all players
- [ ] Follow all SP rules: objectives, Horde kills, Secondary Missions, solo mode doubling
- [ ] Show SP distribution summary after calculation
- [ ] Only allow Resupply Shop after SP distribution is complete


## Movement Phase Detailed Steps Implementation
- [x] Create MovementPhaseSteps component with 3 sub-steps:
  - [x] Step 1: Começo da Fase de Movimento (resolve "at the start" abilities)
  - [x] Step 2: Mover Unidades (Normal Move, Advance, Fall Back, Remain Stationary)
  - [x] Step 3: Reforços (Reinforcements - Deep Strike/Reserves)
- [x] Add phase blocking - cannot advance from Movement Phase until all steps completed
- [x] Integrate MovementPhaseSteps into BattleTracker
- [x] Add "Mostrar Passos Detalhados" button for Movement Phase
- [x] Test complete Movement Phase flow (26 tests passing)
- [x] Create checkpoint after implementation


## Bugs to Fix
- [x] Command Phase warning and button showing in Movement Phase - fixed by invalidating battle query on phase change

- [x] CRITICAL BUG: Command Phase steps panel still showing in Movement Phase - fixed by correcting handleNextPhase to pass new phase index instead of old one

- [x] PERSISTENT BUG: Phase display still showing Command Phase content in Movement Phase - fixed by using localCurrentPhase state that updates immediately on phase change


## Turn Order Adjustments
- [x] Change initial turn to Horde (opponent) instead of Player
- [x] Make Spawn Horde button only visible during Horde turn


## Horde Spawn System
- [x] Review current spawn implementation and faction tables
- [x] Update spawn logic to use faction-specific unit tables (Grey Knights, Chaos Daemons, etc.)
- [x] Display spawned Horde units in battle tracker with HordeUnitsPanel component
- [x] Create HordeSpawnModal to show spawn results (roll, bracket, selected unit)
- [x] Implement unit destruction tracking with SP reward for killing player
- [x] Test spawn with different factions (86 tests passing)


## Spawn Zone System
- [x] Update Horde spawn logic to include zone assignment (2 zones for 1000pts, 4 zones for 2000pts)
- [x] Roll random zone when spawning a unit
- [x] Update HordeSpawnModal to display assigned spawn zone
- [x] Update HordeUnitsPanel to show spawn zone for each unit
- [x] Test spawn zone system (86 tests passing)


## Bug Fixes
- [ ] Battle still starting on player turn instead of Horde turn - need to fix initial turn setting


## Bug Fixes - January 2026
- [x] Fix new battles not starting with Horde turn - added explicit playerTurn: "opponent" in createBattle call in battle.ts router


## Display Active Units in Battle UI
- [ ] Show player's selected units in Battle Tracker (units chosen during battle setup)
- [ ] Show Horde units panel with active/destroyed status
- [ ] Display unit stats (name, power, wounds, etc.)
- [ ] Allow marking units as destroyed during battle


## Bug Fixes - January 2026
- [x] Fix new battles not starting with Horde turn - added explicit playerTurn: "opponent" in createBattle call
- [x] Fix units not appearing in Battle Tracker - implemented auto-selection of all Order of Battle units when none manually selected during battle setup


## Improve Horde Unit Tracking in Battle Tracker
- [x] Create separate Horde Units panel in Battle Tracker UI
- [x] Add "Destruir" button to each Horde unit
- [x] Create modal to select which player unit made the kill when destroying Horde unit
- [x] Automatically add kill count to selected player unit (enemyUnitsDestroyed in crusadeUnits table)
- [x] Remove "Add Kill" button from player units (kills tracked via Horde destruction)
- [x] Update UI layout to clearly separate Player vs Horde units (blue panel for players, red panel for Horde)
- [x] Show kill count on player units in Battle Tracker (e.g., "• 1 kills")


## Shooting Phase Sub-Steps - January 2026
- [x] Create ShootingPhaseSteps.tsx component (9 steps total)
- [x] Implement Step 3.1: Start of Shooting Phase (buffs, stratagems)
- [x] Implement Step 3.2: Select Unit to Shoot
- [x] Implement Step 3.2a: Select Targets (range and visibility rules)
- [x] Implement Step 3.2b: Hit Rolls (BS, modifiers, critical hits)
- [x] Implement Step 3.2c: Wound Rolls (S vs T comparison table)
- [x] Implement Step 3.2d: Saving Throws (AP modifiers, invulnerable saves)
- [x] Implement Step 3.2e: Apply Damage and Remove Models (damage allocation)
- [x] Implement Step 3.2f: Next Unit (repeat for remaining units)
- [x] Implement Step 3.3: End of Shooting Phase
- [x] Add note about Overwatch being out-of-phase
- [x] Integrate ShootingPhaseSteps into BattleTracker
- [x] Fix direct phase button clicks not updating localCurrentPhase
- [x] Add shooting phase completion blocking for phase advancement
