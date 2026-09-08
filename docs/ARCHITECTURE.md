# Architecture Overview

This document describes how the codebase is layered: **presentation** (App Router + components), **application hooks**, **domain rules** (pure TypeScript), **infrastructure services** (`lib/` + Firebase), and **Firebase-Admin-backed REST APIs** for hub data (`/api/workspace` and mutations).

## Project Structure

```
MyNotesKeeper/
├── src/
│   ├── app/
│   │   ├── api/                    # REST route handlers (server — Bearer + Admin required for hub APIs)
│   │   │   ├── workspace/
│   │   │   ├── auth/
│   │   │   │   └── bootstrap/
│   │   │   ├── ai-chat/
│   │   │   ├── ai/                 # customer-summary, refine-text
│   │   │   ├── customers/
│   │   │   ├── contacts/
│   │   │   ├── customer-profiles/
│   │   │   ├── entities/
│   │   │   ├── martech/
│   │   │   ├── notes/
│   │   │   ├── opportunities/    # includes stage/route.ts
│   │   │   ├── tasks/
│   │   │   └── task-categories/
│   │   ├── page.tsx               # Engagement hub shell (tabs, wires hooks → features)
│   │   └── layout.tsx
│   ├── domain/                     # DDD-lite: pure rules & read-models (no React, no I/O)
│   │   └── engagement-hub/
│   │       ├── taskRemoval.ts      # Which task IDs to remove with customer/opportunity delete
│   │       ├── dashboardStats.ts  # Hub metrics (open tasks, opp count, recent notes)
│   │       ├── accountPlanningPillars.ts # Four SC planning pillars + task resolution
│   │       ├── fiscalPeriod.ts     # FY starts 1 July; derives CRM-style Q labels
│   │       ├── seAssessment.ts     # SE involvement / RAG parsing, tone, labels
│   │       ├── meetingNoteFields.ts
│   │       ├── noteNextSteps.ts
│   │       └── index.ts
│   ├── components/
│   │   ├── ui/                     # Primitive UI (badges, detail rows, avatars)
│   │   ├── home/                   # Dashboard shell widgets (StatCard, HomeTabButton)
│   │   ├── tasks/                  # Kanban, calendar, task forms
│   │   ├── customers/
│   │   ├── forms/
│   │   ├── notes/                  # Next-steps editor / list
│   │   ├── planning/               # Account planning pillars
│   │   └── …                       # Feature orchestrators (e.g. CustomerManagement, EntityManagement)
│   ├── hooks/                      # React hooks: Firebase sync, CRUD, feature wiring
│   │   ├── useFirebaseData.ts
│   │   ├── useFirestoreSnapshotSync.ts   # Applies Firestore-loaded snapshots → local CRUD state
│   │   ├── useCustomerOperations.ts
│   │   ├── useNoteOperations.ts
│   │   ├── useOpportunityOperations.ts
│   │   ├── useTaskOperations.ts
│   │   ├── useEngagementDeletionHandlers.ts
│   │   ├── useAiPanelEntityActions.ts
│   │   └── …
│   ├── lib/                        # Services (Firestore via client SDK) & shared utilities
│   │   ├── server/                  # Used only by API routes / Node runtime
│   │   │   ├── firebaseAdmin.ts     # Firebase Admin init (JWT verification)
│   │   │   └── authorizeApiRequest.ts
│   │   ├── firebase.ts
│   │   ├── customerService.ts
│   │   └── …
│   └── types/                      # Shared TypeScript models
├── docs/
└── README.md
```

## Layers

### 1. **Domain** (`src/domain/`)

- **Purpose:** Small, **pure** functions and types that encode business rules (e.g. which engagement tasks disappear when aggregate roots are removed; dashboard statistics).
- **Constraints:** No `fetch`, no Firestore, no React imports.
- **Example:** [`engagement-hub/taskRemoval.ts`](../src/domain/engagement-hub/taskRemoval.ts) — task ID selection for cascaded deletes.

| Module | Rule it owns |
|--------|--------------|
| [`fiscalPeriod.ts`](../src/domain/engagement-hub/fiscalPeriod.ts) | Fiscal year starts **1 July**, labelled by the year it ends (Sep 2026 → `Q1-2027`). Always **derived** from a date — never stored — so it cannot drift from the CRM. |
| [`seAssessment.ts`](../src/domain/engagement-hub/seAssessment.ts) | Parses SE involvement and RAG values from Firestore or a CRM export, including **legacy booleans**. Owns badge tone so `Not Applicable` never renders as a red risk signal. |
| [`accountPlanningPillars.ts`](../src/domain/engagement-hub/accountPlanningPillars.ts) | The four SC planning pillars, their activity options, pillar↔task resolution, and `planFieldsFor` / `normalizePillarId` used by both UI and AI tools. |

### 2. **Application / hooks** (`src/hooks/`)

- **Purpose:** Compose services + domain for the UI: load data, keep local state in sync with Firebase snapshots, run CRUD, orchestrate deletes (e.g. remove tasks then customer).
- **Examples:** `useFirebaseData` (loads **`GET /api/workspace`** with a Firebase ID token), `useFirestoreSnapshotSync`, `useEngagementDeletionHandlers`, `useTaskOperations`.

### 3. **Infrastructure / services** (`src/lib/`)

- **Purpose:** Legacy and shared helpers: CRUD implementations used by **`/api/*` route handlers**, resolvers, and some browser paths. Routes may call these with Firebase Admin contexts; Firestore rules still apply where the client SDK reads/writes directly.
- **Server-only:** `src/lib/server/*` — Firebase Admin JWT verification (**`authorizeApiRequest`**), **`adminFirestore`** (Admin SDK Firestore access), **`workspaceLoad`** (tenant-aware workspace aggregation), **`tasksAdmin`**, plus `firebaseAdmin.ts`.

### 4. **Presentation** (`src/app/`, `src/components/`)

- **`page.tsx`:** Thin shell: tabs, stats, passes props into feature areas (`CustomerManagement`, `TasksManagement`, etc.).
- **`components/home/`:** Reusable dashboard chrome (stat cards, tab buttons).
- **Orchestrators:** Large features coordinate children and hooks; avoid embedding domain rules here—call `domain/` or hooks instead.

### 5. **API layer** (`src/app/api/`)

- **Purpose:** REST JSON endpoints for the SPA (same origin) and future integrations.

- **Auth:** **`FIREBASE_SERVICE_ACCOUNT_JSON`** must be set server-side (**503** otherwise). Callers send **`Authorization: Bearer <Firebase ID token>`**. Mutations that accept **`userId`** must align with the verified **`uid`**, except **`POST /api/ai-chat`**, which uses only **`{ message }`** and binds tool side effects to the token (**[API_GUIDE.md](API_GUIDE.md)**).

### 6. **Types** (`src/types/`)

- Shared interfaces for Customer, Opportunity, **EngagementTask** (Kanban statuses: `todo` | `in_progress` | `done` | **`cancelled`**; optional **`productIds`** from the product catalogue), etc., re-exported from `src/types/index.ts`.

## Engagement tasks (technical)

| Concern | Location |
|--------|-----------|
| Firestore persistence | `src/lib/server/tasksAdmin.ts` behind **`/api/tasks`** (`engagementTasks` collection; `productIds` array field) |
| Kanban reorder / column moves | `src/lib/kanbanMerge.ts` — pure `applyKanbanDrag`; four columns |
| Task planning range / calendar math | `src/lib/taskPlanningRange.ts` — pure date normalization and range helpers |
| Stats | `src/domain/engagement-hub/dashboardStats.ts` — **open tasks** exclude `done` and `cancelled` |
| Cascaded deletes | `src/domain/engagement-hub/taskRemoval.ts` |

Filtering in the Tasks UI narrows visible cards/calendar items; persisted drag-merge reconciles filtered updates back into the full task list (`TasksManagement` + `persistKanbanTasks`).

### Task UI composition (May 2026 update)

- **`TasksManagement`** orchestrates feature state and delegates rendering to focused children.
- **`TaskFiltersBar`** centralizes search/filter UI (status/category/account/product) and is reusable in other task surfaces.
- **`TaskKanbanBoard`** provides drag-and-drop card workflow; card-level drag is enabled while preserving explicit action controls (delete, links, workspace navigation).
- **`TaskCalendarView`** provides two read models of the same task data:
  - month grid (day-focused),
  - timeline lanes (Gantt-style, paginated for large workloads).

This keeps board/calendar concerns componentized while retaining a single source of truth in `EngagementTask`.

## AI assistant (technical)

**`POST /api/ai-chat`** runs Gemini server-side with a tool set defined in [`src/lib/aiToolsService.ts`](../src/lib/aiToolsService.ts). Tool *schemas* live there; their *executors* are supplied per-request by the route, so the model can never reach data the caller's token does not own.

| Concern | Location |
|---------|----------|
| Model selection | `src/lib/aiModel.ts` — one helper, `GEMINI_MODEL` override, GA default |
| Tool schemas + system instruction | `src/lib/aiToolsService.ts` |
| Tool executors (server data access) | `src/app/api/ai-chat/route.ts` |
| Prompt catalogue shown in the UI | `src/lib/comprehensivePrompts.ts` (Prompt Library), `src/lib/chatbotPrompts.ts` |

**Tool families:**

- **Lookup / create** — customers, notes, contacts, products, partners.
- **Status (read-only)** — `account_status`, `list_opportunities`, `list_tasks`, `list_notes`, `pipeline_health`.
- **Account planning** — `account_planning`, `planning_coverage` (the four pillars).
- **Industry positioning** — `industry_approach`, `accounts_by_solution`.

Opportunities and tasks reach the status tools through **`loadWorkspaceSnapshot`**, so AI answers are tenant-scoped exactly like the dashboard rather than reading a raw `getAll`.

Domain rules stay in `src/domain/` — the planning tools call `planFieldsFor` and `filterTasksByPlanningPillar` rather than re-deriving pillar logic inside the route.

---

## Data flow (typical UX path)

The engagement hub loads its **workspace snapshot** over HTTPS with **`GET /api/workspace`** and `Authorization: Bearer <ID token>` (`useFirebaseData` → **`hubAuthFetch` / `hubAuthJson`**). The server aggregates Firestore via **Firebase Admin** (`workspaceLoad`). After load, **`useFirestoreSnapshotSync`** aligns derived React state from that snapshot before local CRUD updates.

Mutations from the UI (customers, notes, tasks, contacts, entities, martech, etc.) go through **typed hooks** that call **`/api/*`** with the same Bearer pattern (not direct Firestore from the dashboard shell).

```
User → Component → Hook → fetch(/api/…, Authorization: Bearer …) → Route handler → authorizeApiRequest → Service / Admin Firestore
```

Older or auxiliary code paths may still use the Firebase Web SDK in the browser where rules enforce **`request.auth`**; tightening **Firestore rules** to deny dashboard collections entirely is planned once all callers use APIs only.

## Key principles

- **Separation of concerns:** Domain rules isolated from UI and I/O where practical.
- **Single responsibility:** One clear role per module (hooks vs services vs routes).
- **Type safety:** Prefer explicit types over `unknown`/`any` in new code (legacy warnings may remain in ESLint).
- **Documentation:** APIs and security behavior described in [API_GUIDE.md](API_GUIDE.md) and [SECURITY.md](SECURITY.md).

## Technologies

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Fonts:** **Self-hosted** Geist via the `geist` package (`next/font/local` under the hood). Deliberately **not** `next/font/google`, which fetches from `fonts.gstatic.com` at build time and breaks offline, CI, and network-restricted builds.
- **Backend (hub data):** Next.js Route Handlers + Firebase Admin (`FIREBASE_SERVICE_ACCOUNT_JSON`) + tenant-aware workspace loaders
- **Database:** Firebase Firestore
- **Auth (users):** Firebase Auth (Google)
- **Server API auth:** Firebase Admin (`firebase-admin`) + **`FIREBASE_SERVICE_ACCOUNT_JSON`** (**required** for hub APIs — see [SECURITY.md](SECURITY.md))
- **AI:** Google Gemini via the Vercel AI SDK (`ai` + `@ai-sdk/google`); model resolved centrally by [`src/lib/aiModel.ts`](../src/lib/aiModel.ts) and overridable with **`GEMINI_MODEL`**

---

**REST details:** [API_GUIDE.md](API_GUIDE.md) · **Firestore rules:** [DEPLOY_FIRESTORE_RULES.md](DEPLOY_FIRESTORE_RULES.md) · **Development:** [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
