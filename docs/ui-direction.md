# UI Art Direction

## Theme
Grimdark military command interface with sacred-industrial sci-fi undertones.

## Goal
Move the application away from a generic admin dashboard look and toward a tactical campaign dossier / command center identity.

## Visual priorities
- strong headers
- structured panels
- dossier-like campaign pages
- tactical/operations feel on battle pages
- restrained ornamentation
- readable, production-friendly UI

## Preferred palette
- near-black / charcoal backgrounds
- deep red primary accents
- restrained brass / bronze secondary accents
- muted off-white for selected title accents
- avoid bright, saturated modern SaaS colors unless functionally needed

## Asset usage
- `grimdark-metal-bg.png` is the global/background texture reference
- `dossier-alt-bg.png` is for dossier/campaign-oriented areas if needed
- `command-sigil-watermark.png` should be used subtly at very low opacity
- `panel-grain-overlay.png` should be used only to add light depth to important panels
- `dossier-header-strip.png` should help define major page headers / hero sections
- status seals should be used for major statuses, not everywhere
- divider/frame/icon reference images in `docs/ui-references/` are references for implementation in SVG/CSS, not final runtime assets

## Avoid
- simple recolor-only redesigns
- generic rectangular dashboard cards with new colors only
- overly noisy textures
- strong watermarks behind text
- franchise logo copies
- decorative visuals that reduce scanability or responsiveness
