# TASK_100 — Asset Sourcing Report

Date: 2026-07-24
Agent: Claude

## Owner direction (2026-07-24)

Do not block on a Lil Artie protagonist model. Use game-ready animated characters now; the Artie model will be created or provided later and swapped in. Priority: get the first region done.

## Character asset verification (owned)

`/public/assets/github/kaykit-adventurers/` — KayKit Adventurers (CC0, license file present in folder). Each GLB verified to contain **76 embedded skeletal animation clips**, including: Idle, Walking_A/B/C, Running_A/B, Jump_Start/Jump_Idle/Jump_Land, Hit_A/B, Death_A/B, 1H/2H melee attacks, Unarmed attacks, Sit_Floor/Sit_Chair sets, Interact, Cheer, Lie, Blocking, Spellcasting.

- Barbarian.glb — 76 clips — verified
- Knight.glb — 76 clips — verified
- Mage.glb — 76 clips — verified
- Rogue.glb — 76 clips — verified
- Rogue_Hooded.glb — 76 clips — verified

These five cover the player stand-in, villagers, the traveler, and human enemies with full animation. No new character downloads are required for region 1.

## Static models (no animations — verified)

`assassin_gold.glb`, `assassin_steel.glb`, `stylized_warrior.glb`, `stylized_axe.glb`, `stylized_metal_bow_and_arrow.glb`, `mountain_fbx.glb`, `jungle_01.glb`, both Meshy user models, `snowy_mountain_terrain__optimized_mesh.glb` — none contain animation clips. Per the no-statues rule, the three static humanoid models are **excluded from use as characters**. Weapons, mountain, and props remain usable.

## Environment assets (owned, reused)

- Medieval village FBX pack (10 buildings/props) — `/public/assets/downloaded/medieval-village/`
- Stylized nature FBX pack (4 cluster files) — `/public/assets/downloaded/stylized-nature/`
- Kenney Nature Kit + Survival Kit GLBs (CC0, licenses on disk) — `/public/assets/free/kenney/`

## Region 1 casting

- Player (interim Artie): Rogue
- Village elder: Mage
- Village guard: Knight
- Blacksmith: Barbarian
- Merchant: Rogue_Hooded (neutral tint)
- Traveler (rescue): Rogue (recolored variant)
- Bandits x3 (human enemies): Rogue_Hooded (dark recolored variants)

## Conclusion

No external downloads needed for region 1; all requirements met by owned, license-verified assets. Future regions may source additional free packs (Quaternius, KayKit, Kenney) — to be recorded here when acquired.
