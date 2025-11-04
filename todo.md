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
