# Lil Artie — Roads of Amani

A stylized open-world Three.js adventure starring Lil Artie. This repo contains the web game client and supporting vinext starter pieces for local development and optional Cloudflare D1/Drizzle integration.

## Quick Start

Requirements:
- Node.js >= 22.13.0

Install and run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Run tests (build + basic HTML render check):

```bash
npm test
```

## Project Structure

- app/ — React app and client-side game
  - app/game/ — Three.js game code (LilArtieGame.tsx) and engine modules
  - app/game/engine — actor, assets, collision helpers
  - app/game/world — terrain, layout, characters, quests, minimap
- public/ — static assets
- 05_ASSETS/ — optional large asset archives (excluded from repo by .gitignore)

## Controls
- MOVE: WASD
- SPRINT: SHIFT
- JUMP: SPACE
- ATTACK: CLICK / F
- INTERACT: E
- CAMERA: RIGHT-DRAG
- ZOOM: WHEEL

## Notes & Next steps
- Added an MIT license and small safety fix for collision handling (avoid stuck positions when exactly overlapping colliders).
- Consider running `npm audit` and enabling CI to build/test on push.

## Learn More
- vinext: https://github.com/cloudflare/vinext
- Drizzle D1 Guide: https://orm.drizzle.team/docs/get-started/d1-new
