# TASK 001 — Verified Fab Library Inventory

Date: 2026-07-24
Method: Read-only inspection of the owner's signed-in Fab **My Library** page and the corresponding Fab listing pages.

## Verification summary

- 24 library entries were visible.
- 23 entries exposed a Fab library download control.
- 7 listings exposed exact, asset-specific license evidence and are recorded below.
- Entries without exact license evidence were omitted as required by TASK_001.
- No assets were downloaded, converted, moved, or integrated.

## Verified assets

### 1. Stylized Village (Village, Stylized Village, Stylized Town, Medieval Village)

- Publisher: Hivemind
- Fab listing: https://www.fab.com/listings/587858fc-892c-4594-a5e0-3d243b00531d
- Asset type: 3D environment — medieval village
- Available format: Unreal Engine
- License: Standard License
- Download status: Download control present in My Library
- Relevance: High for a major settlement, market, docks, houses, farms, and roads. Unreal-only package requires a verified extraction and conversion path before Three.js use. Magical mushrooms and fantasy effects must be excluded.

### 2. Toon/Low Poly Dread Ponytail

- Publisher: Tiko
- Fab listing: https://www.fab.com/listings/03d91e9c-0150-4ba9-914a-f57a3d3c0bfe
- Asset type: 3D hair model
- Available format: FBX
- License: Creative Commons CC0, stated by the publisher in the listing description
- Download status: Download control present in My Library and listing page
- Relevance: Very high for Lil Artie's stylized dreadlock hairstyle. Requires FBX-to-GLB conversion and character-fit validation.

### 3. Lowpoly Environment - Nature - Free - MEDIEVAL FANTASY SERIES

- Publisher: Polytope Studio
- Fab listing: https://www.fab.com/listings/d9327821-8977-439a-b2b7-d0a53e4c8728
- Asset type: 3D nature and plant environment
- Available format: Unreal Engine
- License: Standard License
- Download status: Download control present in My Library
- Relevance: Medium for additional rocks, plants, terrain dressing, and environmental variety. Unreal-only package requires a verified extraction and conversion path. Fantasy-only content must be excluded.

### 4. Free Stylized Assassin

- Publisher: LapaModels
- Fab listing: https://www.fab.com/listings/a50c1425-a103-48fc-a546-602d3afb5fe1
- Asset type: 3D human character
- Available format: GLB
- License: Creative Commons Attribution 4.0
- Download status: Download control present in My Library and listing page
- Relevance: High for a stylized human adversary or NPC after visual, rigging, animation, and age-rating review. The listing identifies the model as AI-generated. Attribution is mandatory.

### 5. Stylized Dungeon Pack

- Publisher: CobraGamesAssets
- Fab listing: https://www.fab.com/listings/c6e91312-202a-4d80-a6f1-1b374bb27dce
- Asset type: 3D dungeon environment
- Available format: Unreal Engine
- License: Standard License
- Download status: Download control present in My Library
- Relevance: Conditional for realistic ruins, tunnels, holding areas, or hideouts. Unreal-only package requires a verified extraction and conversion path. Monsters, magical props, and fantasy encounters must not be used.

### 6. Stylized Volumetric Clouds Shader

- Publisher: SERLO
- Fab listing: https://www.fab.com/listings/3dcea533-24d9-4aa7-bbf6-bdf876c1f3eb
- Asset type: VFX shader
- Available format: Unreal Engine
- License: Standard License
- Download status: Download control present in My Library
- Relevance: Not directly compatible with Three.js. It may be used only as a visual reference if the license permits the intended workflow; its Unreal shader cannot be imported into the current game.

### 7. Stylized Egypt

- Publisher: AleksandrIvanov
- Fab listing: https://www.fab.com/listings/c935ca3e-dbb1-4b7d-a080-65de129c60bd
- Asset type: 3D desert environment
- Available format: Unreal Engine
- License: Standard License
- Download status: Download control present in My Library
- Relevance: Medium for a desert region, ruins, architecture, and environmental landmarks. Unreal-only package requires a verified extraction and conversion path.

## Technical compatibility summary

- Direct Three.js candidates: Free Stylized Assassin in GLB.
- Conversion candidate: Toon/Low Poly Dread Ponytail from FBX to GLB.
- Unreal extraction required: Stylized Village, Lowpoly Environment Nature, Stylized Dungeon Pack, and Stylized Egypt.
- Not directly portable: Stylized Volumetric Clouds Shader.

## Required next step

TASK_002 must select from these seven verified assets without downloading them, avoid duplication with the existing Kenney and owner-supplied assets, and reject any content that conflicts with the human-only enemy and realistic-situation requirements.
