# Structured meeting notes

Customer notes support a flexible JSON bag (`otherFields`) so AE/SC conversations can be captured without schema migrations.

## Recommended keys

Defined in code as `MEETING_NOTE_OTHER_FIELDS` (`src/domain/engagement-hub/meetingNoteFields.ts`):

| Key | Purpose |
|-----|---------|
| `meetingId` | Stable idempotency key for imports (e.g. `john-fallo-ae-review-2026-05-06`) |
| `meetingType` | e.g. `account_review`, `discovery`, `workshop` |
| `ideasExecution` | **Ideas & execution** — backlog for the next planning cycle (shown in **NoteForm**) |
| `accountStatus` | Short account snapshot (e.g. *Active — RFP + hosting*) |
| `nextSteps` | **Checklist** of `{ id, label, done, owner? }` — shown as steps in **NoteForm** / note viewer |
| `transcriptRef` | Optional source id (e.g. Teams recording filename) |

Additional ad-hoc keys (presentation dates, participants JSON, etc.) are allowed.

Example import:

```bash
node scripts/seedJohnFallonCatchup20260522.local.js you@company.com --apply
```

## UI

The note editor (**NoteForm**) includes:

- Main **Notes** narrative
- **Ideas & execution** — maps to `otherFields.ideasExecution` for scan-friendly next-step planning

## Data loading

Operational seeding with real stakeholder emails belongs in **gitignored** scripts (`scripts/*.local.*`). Example:

```bash
node scripts/seedJohnFalloAccountReview.local.js you@company.com --apply
```

Always review dry-run output before `--apply`. See [SECURITY.md](SECURITY.md).

## Related

- [CUSTOMER_JOURNEY.md](CUSTOMER_JOURNEY.md) — AE/SC sync loop
- [ARCHITECTURE.md](ARCHITECTURE.md) — domain vs presentation layers
