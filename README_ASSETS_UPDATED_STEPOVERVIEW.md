# Asset integration: step 1 complete

I imported a demo scene and client-side CharacterDemo component that loads GLB characters from public/assets/characters/. The demo expects the following files to be placed there by running the download script.

Files added in this step:
- app/demo/page.tsx — demo page (Next.js app dir)
- app/game/demo/CharacterDemo.tsx — three.js demo component that lists animations and provides quick play controls
- ATTRIBUTIONS.md — credits & license links for the starter pack

What I did not commit (to avoid adding large binaries):
- I did not add GLB binaries to the repo. Use `node scripts/download-assets.js` to download the files listed in assets-manifest.json into public/assets/characters/ and other categories.

Next steps (I will run these in order after you confirm):
- Step 2: Expand the manifest with more combat-ready characters and weapon SFX from GitHub and other permissive sources.
- Step 3: Provide optimization scripts and instructions (gltfpack/meshopt/KTX2) and, if you want, create optimized copies of large assets.
- Step 4: Add CI checks to prevent large assets in commits and validate license metadata.

If you want me to continue, I will proceed automatically: expand the manifest (Step 2) and then Step 3 and Step 4.
