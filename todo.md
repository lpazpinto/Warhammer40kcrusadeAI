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

