TASK ID: 006

STATUS: PENDING

GOAL:
Perform a read-only integration review covering asset licenses, missing files, broken references, visual consistency, scene placement, duplicate content, human-only enemy compliance, and alignment with the project goal.

ASSIGNED TO:
Claude

INPUTS:
/03_OUTPUTS/TASK_005_world_integration_report.md
/app/game/
/public/assets/
/05_ASSETS/license_records/
/docs/ASSET-CREDITS.md

OUTPUT:
/03_OUTPUTS/TASK_006_integration_qa.md

CONSTRAINTS:
- No assumptions
- No rework
- Follow system + universal rules
- Review only; do not modify source, assets, configuration, or prior outputs
- Report only reproducible findings with exact file paths
- Separate blocking findings from non-blocking findings

AFTER COMPLETION:
- Update /04_LOGS/project_log.md
- Change STATUS to DONE
