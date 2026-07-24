Added an assets manifest and a download script to fetch GitHub-hosted game-ready assets (characters, props, environment references, and audio indexes).

Files added:
- assets-manifest.json: curated list of candidate assets (glb/raw URLs) from GitHub and related sources.
- scripts/download-assets.js: node script to download the manifest entries into public/assets/. Run locally: node scripts/download-assets.js

Notes:
- I filtered for repositories that clearly provide permissive assets (CC0 / permissive licenses) and avoided NC/ambiguous sources where possible. Still verify each asset's license before redistribution in a packaged release.
- After you run the download script locally, I can help add a small in-game demo that loads one character and plays animations, and create an ATTRIBUTIONS.md with required credits.

Next steps I can take now (pick any):
- Import a starter demo into the repo that loads one character and provides controls to play Idle/Walk/Attack animations.
- Run a pass to locate additional combat-specific animation glbs on GitHub and add them to the manifest.
- Resize/optimize textures and optionally convert models to meshopt Draco-compressed glb variants.

If you want me to continue, say which of the next steps above to do and I'll prepare the changes.