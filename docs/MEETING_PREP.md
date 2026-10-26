# Meeting prep — Command of the Message + AAA

When a **customer meeting is within ~21 days**, the account view shows a **COM + AAA** banner if a linked task looks like meeting/workshop prep.

## Frameworks

| Framework | Use |
|-----------|-----|
| **Command of the Message** | Before/after scenario, positive business outcomes, negative consequences, required capabilities. |
| **AAA** | **Agenda** (timeboxed, roles), **Ask** (discovery / MEDDPICC gaps), **Act** (mutual next steps and owners). |

## Tasks

- Category **Meeting Preparation** → task form **COM + AAA** adds the standard checklist.
- Domain: `src/domain/engagement-hub/meetingPrepFramework.ts`
- UI: `MeetingPrepPanel` on account detail; checklist button in `TaskFormDrawer`.
