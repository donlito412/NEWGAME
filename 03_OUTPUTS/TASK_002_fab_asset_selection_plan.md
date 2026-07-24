# TASK 002 — Fab Asset Selection Plan

Date: 2026-07-24
Status: Selection complete; no assets downloaded or integrated.

## Selection result

Three verified Fab assets are approved for the next acquisition task. They fill current project gaps without replacing adequate Kenney nature props, owner-supplied terrain, or completed gameplay systems.

## Approved acquisition order

### Priority 1 — Toon/Low Poly Dread Ponytail

- Publisher: Tiko
- Listing: https://www.fab.com/listings/03d91e9c-0150-4ba9-914a-f57a3d3c0bfe
- License: Creative Commons CC0
- Source format: FBX
- Project gap filled: A dedicated stylized dreadlock hair asset for Lil Artie
- Three.js suitability: Compatible after FBX-to-GLB conversion
- Required conversion path:
  1. Preserve the original FBX package in `/05_ASSETS/fab_downloads/tiko_dread_ponytail/`.
  2. Convert a copy to GLB with embedded or colocated textures.
  3. Validate scale, pivot, orientation, material appearance, polygon count, and fit on Lil Artie's head.
  4. Keep the current procedural dreadlocks until the converted asset passes validation.
- Planned role: Lil Artie's hair only
- Duplication decision: Approved as a quality replacement candidate for placeholder geometry, not as additional environmental content

### Priority 2 — Free Stylized Assassin

- Publisher: LapaModels
- Listing: https://www.fab.com/listings/a50c1425-a103-48fc-a546-602d3afb5fe1
- License: Creative Commons Attribution 4.0
- Source format: GLB
- Project gap filled: A finished stylized human adversary model
- Three.js suitability: Directly compatible with `GLTFLoader`; optimization and rig inspection are still required
- Required preparation path:
  1. Preserve the original GLB package in `/05_ASSETS/fab_downloads/lapa_stylized_assassin/`.
  2. Record mandatory attribution in `/05_ASSETS/license_records/`.
  3. Inspect rig, animation clips, texture dimensions, materials, polygon count, scale, and orientation.
  4. Create an optimized runtime copy only in TASK_004.
- Planned role: Adult road-gang scout, hired enforcer, or hostile thief
- Situation fit: Human robbery, ambush, extortion, kidnapping, or smuggling encounter
- Restrictions: Do not use as a monster, supernatural assassin, or child adversary; do not remove required attribution
- AI disclosure: Fab identifies this model as AI-generated

### Priority 3 — Stylized Village

- Full title: Stylized Village (Village, Stylized Village, Stylized Town, Medieval Village)
- Publisher: Hivemind
- Listing: https://www.fab.com/listings/587858fc-892c-4594-a5e0-3d243b00531d
- License: Fab Standard License
- Source format: Unreal Engine
- Project gaps filled: Major settlement, houses, market, docks, farms, roads, and large traversal landmarks
- Three.js suitability: Conditional; the Unreal package is not directly loadable by Three.js
- Required extraction path:
  1. Preserve the original Unreal package in `/05_ASSETS/fab_downloads/hivemind_stylized_village/`.
  2. Record the Fab Standard License acquisition evidence in `/05_ASSETS/license_records/`.
  3. Add the package to a compatible Unreal Engine project.
  4. Export only approved static meshes through Unreal Editor to FBX or OBJ.
  5. Convert exported copies to GLB and rebuild web-compatible materials.
  6. Exclude Unreal Blueprints, Lumen, Nanite-only behavior, VFX, magic effects, butterflies, and mushroom-fantasy content.
  7. Validate every extracted mesh before TASK_005 placement.
- Planned roles:
  - Central civilian village
  - Market and quest hub
  - Farm and roadside work areas
  - Dock and waterfront traversal zone
  - Houses and interiors for realistic civilian situations
- Duplication decision: Approved because the current build has terrain, vegetation, one camp, and a tower but no developed settlement
- Acquisition gate: TASK_003 may acquire the package, but TASK_004 must stop if static source meshes cannot be legally and technically exported from the acquired tier

## Existing assets retained instead of duplicated

- Kenney Nature Kit remains the primary lightweight tree, rock, bridge, grass, and plant library.
- Kenney Survival Kit remains the primary camp, tent, crate, signpost, and survival-prop library.
- `jungle_01.glb` remains available for dense vegetation regions.
- `snowy_mountain_terrain__optimized_mesh.glb` remains available for mountain terrain.
- The existing owner-supplied boomerang and climbing axe remain the approved initial traversal and equipment assets.
- Current procedural terrain, road, water, camp, watchtower, traveler, enemies, HUD, and quest flow remain intact.

## Verified assets not approved for this acquisition cycle

### Lowpoly Environment - Nature - Free - MEDIEVAL FANTASY SERIES

- Decision: Reject for current cycle
- Reason: Duplicates the existing Kenney nature library, jungle model, and terrain coverage; Unreal-only delivery adds conversion cost without filling a current gap

### Stylized Dungeon Pack

- Decision: Defer
- Reason: A dungeon is not required for the next settlement-and-human-encounter milestone; Unreal-only delivery adds conversion cost; fantasy props would require extensive filtering

### Stylized Volumetric Clouds Shader

- Decision: Reject
- Reason: Unreal shader cannot be imported into Three.js; current sky and lighting already function; reimplementation would create unrelated shader work

### Stylized Egypt

- Decision: Defer
- Reason: A desert biome is a future world-expansion decision and would expand the current milestone; Unreal-only delivery adds conversion work before the central region is complete

## Acquisition scope for TASK_003

TASK_003 is authorized to acquire only:

1. Toon/Low Poly Dread Ponytail
2. Free Stylized Assassin
3. Stylized Village

TASK_003 must save untouched source packages and license evidence only. It must not convert files, edit models, modify application source, or place assets in the world.

## License and format verification basis

- Fab Standard License permits use with compatible tools and is not limited to Unreal Engine: https://www.fab.com/eula?lang=en
- Fab documents that Unreal engine-format content is added to an Unreal project rather than exported directly as an exchange format through Fab in Launcher: https://dev.epicgames.com/documentation/en-us/fab/exporting-assets-from-fab-in-launcher
- Unreal documents static-mesh export to interchange formats such as FBX or OBJ, while noting that not every asset type can be exported: https://dev.epicgames.com/documentation/en-us/unreal-engine/working-with-assets-in-unreal-engine
