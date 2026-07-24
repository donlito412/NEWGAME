TASK ID: 101

STATUS: PENDING

GOAL:
Rewrite the game core from scratch in /app/game/ as modular TypeScript: renderer setup, terrain, sky/lighting/day cycle, asset loading pipeline with skeletal animation support (AnimationMixer), third-person player controller driving the animated Lil Artie model (idle/walk/run/jump/attack states), camera rig, and a collision system (static colliders for buildings, trees, rocks; world bounds). The old LilArtieGame.tsx is archived, not deleted.

ASSIGNED TO:
Claude

INPUTS:
/03_OUTPUTS/TASK_100_asset_sourcing_report.md
/public/assets/
/app/

OUTPUT:
/app/game/ (new modular source)
/03_OUTPUTS/TASK_101_core_rewrite_report.md

CONSTRAINTS:
- Every character on screen must be animated; no static statues, no placeholders
- Collision must block movement through solid objects
- Keep Next.js/vinext/Vite tooling unchanged; dev and production build must run
- Stylized painterly look; no blocky aesthetic

AFTER COMPLETION:
- Update /04_LOGS/project_log.md
- Change STATUS to DONE
