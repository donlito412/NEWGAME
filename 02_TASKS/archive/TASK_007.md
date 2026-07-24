TASK ID: 007

STATUS: PENDING

GOAL:
Resolve only the blocking findings from TASK_006, update asset credits, and validate the production build and automated tests without adding new features.

ASSIGNED TO:
Cursor

INPUTS:
/03_OUTPUTS/TASK_006_integration_qa.md
/app/game/
/public/assets/
/05_ASSETS/license_records/
/docs/ASSET-CREDITS.md
/package.json

OUTPUT:
/03_OUTPUTS/TASK_007_release_readiness_report.md

CONSTRAINTS:
- No assumptions
- No rework
- Follow system + universal rules
- Fix only blocking findings documented in TASK_006
- Do not add features or change approved game direction
- Update /docs/ASSET-CREDITS.md with every integrated Fab asset and verified license
- Production build and automated tests must pass before completion

AFTER COMPLETION:
- Update /04_LOGS/project_log.md
- Change STATUS to DONE
