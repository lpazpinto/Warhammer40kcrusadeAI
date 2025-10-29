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
- [ ] Create Crusade Relics database by faction
- [ ] Assign Relics to CHARACTER units only
- [ ] Limit 1 Relic per CHARACTER
- [ ] UI to select and assign Relics
- [ ] Display Relics on Crusade Card

### Wargear & Equipment
- [ ] Track wargear changes and upgrades
- [ ] Update points cost when wargear changes
- [ ] Display current wargear on Crusade Card

### Battle Recording
- [ ] Create Battle Report form (opponent, mission, result)
- [ ] Automatically update unit stats after battle (XP, battles played, etc.)
- [ ] Track which units participated in each battle
- [ ] Battle history log per campaign

### Order of Battle Management
- [ ] Display total Supply Limit vs Supply Used
- [ ] Mark units as "In Reserve" vs "Active"
- [ ] Enforce Supply Limit when adding units
- [ ] Calculate total army Power Level and Points

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

