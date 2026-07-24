I've expanded the assets manifest with more GitHub-hosted, permissively-licensed candidates (game-ready glb assets and indexes), added optimization tooling, and created a CI check that validates the manifest and enforces a size limit (50 MB per asset).

What I changed:
- assets-manifest.json — expanded with additional vetted candidates (Khronos, ToxSam index, MetaworldOS, Ready Player Me animation index, Mozilla Hubs avatars, Quaternius link, Poly Haven textures)
- scripts/optimize-assets.sh — local optimization helper using gltfpack (creates public/optimized-assets)
- scripts/ci-validate-manifest.js — CI validator that ensures every manifest entry has a url and license_url and tests remote sizes (HEAD) against 50 MB limit
- .github/workflows/asset-manifest-validate.yml — workflow that runs the CI validator on push/PR

Next steps I will take (Step 3 & 4 completion will be in the same PR/process):
- I will run another pass to add specific weapon glb links and SFX links from the manifest sources (ToxSam/metaworldos/repositories that list direct glb files).
- I will prepare optimization guidance and sample commands to create optimized glb files for web delivery.
- I will open a single PR branch with all changes grouped if you prefer review before merging.

If you want me to continue, I will now add more direct weapon and SFX links into the manifest (Step 2 full), and then prepare optimized assets guidance (Step 3) and finalize CI/license attributions (Step 4).