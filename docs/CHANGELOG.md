# Changelog

## [2.6.0] - 2026-09-08 - CRM-aligned schema, AI status tools, dead code removal

### CRM alignment

- ✅ **Opportunity type** now carries the CRM picklist — **`License`**, **`Renewal`**, **`Services`** — alongside the Hub-native motions. Previously only `Renewal` overlapped, so most CRM records could not be represented. Additive union; no stored data affected.
- ✅ **`SEInvolvement`** changed from `boolean` to **`'Yes' | 'No' | 'Not Needed' | ''`**. `'No'` (support wanted but absent) and `'Not Needed'` (deliberately out of scope) are now distinct. Legacy booleans are parsed for backward compatibility by `parseSEInvolvement`.
- ✅ **RAG assessments** (`seConfidence`, `seProductFitAssessment`) gained **`'Not Applicable'`**, distinct from blank/unassessed.
- ✅ **Fiscal periods** — new pure module [`fiscalPeriod.ts`](../src/domain/engagement-hub/fiscalPeriod.ts). Fiscal year starts **1 July**, labelled by the year it ends (Sep 2026 → `Q1-2027`). Always derived from a date, never stored.
- ✅ **Executable CRM stage mapping** — `stageFromCrmLabel()` in `opportunityStages.ts` replaces prose-only `crmCue` guidance (`Propose & Commit` → `Propose`, `Contract to Close` → `Close`).
- 🐛 **Fixed:** `Not Applicable` rendered as a **red** badge in `CustomerManagement`, inventing a risk signal from a deliberate N/A. Badge tone is now centralised in `seRagTone()`.

### AI assistant

- ✅ **Nine new read-only tools** (18 → 27): `account_status`, `list_opportunities`, `list_tasks`, `list_notes`, `pipeline_health`, `account_planning`, `planning_coverage`, `industry_approach`, `accounts_by_solution`. The assistant previously had **no** opportunity or task tools.
- ✅ **Account planning pillars** (whitespace, multi-threading, migration, research) exposed to the assistant, including activity options and the **xM/xP-only** constraint on migration.
- ✅ **Tenant scoping:** status tools read opportunities and tasks via `loadWorkspaceSnapshot`, matching dashboard scoping rather than a raw `getAll`.
- ✅ **Model:** upgraded `gemini-2.0-flash` → **`gemini-2.5-flash`**, resolved centrally by new [`src/lib/aiModel.ts`](../src/lib/aiModel.ts) and overridable with **`GEMINI_MODEL`**. Defaults to GA rather than preview because the tool-calling path writes customer data. `MAX_TOOL_STEPS` 5 → 8 for chained status queries.
- ✅ **Prompt Library:** seven new status/planning/positioning prompts.

### Build & tooling

- 🐛 **Fixed: builds required network access.** `layout.tsx` used `next/font/google`, which fetches Geist from `fonts.gstatic.com` at build time — breaking offline development, CI, and any network-restricted build. Fonts are now **self-hosted** via the `geist` package (`next/font/local`), exposing the same `--font-geist-sans` / `--font-geist-mono` variables, so no styles changed. `npm run build` now succeeds with no network.
- 🐛 **Fixed: `PromptLibrary` never invoked `onSelectPrompt`.** `CustomerProfileForm` passed the callback to populate **SE Notes**, but the component only ever called `onUsePromptInChatbot` — and did not render a button at all when that prop was absent. Opening the Prompt Library from SE Notes therefore offered no way to insert a prompt. Found while clearing an "unused variable" warning.
- ♻️ **Unused variables in `src/` cleared: 40 → 0.** Dead imports, an unused state pair, a no-op stub, unused setters, and a dead `getMigrationOppBadge` helper (which also contained unreachable logic — `lower === 'YES'` after `.toLowerCase()`). ESLint now sets `ignoreRestSiblings` and a `^_` ignore pattern, so the deliberate-omission idiom (`const { id, ...rest }`) is no longer reported as dead code.

### Cleanup

- 🗑️ **Removed 12 unused files (~1,900 lines):** legacy `ChatbotInterface` chain (`/api/ai/chatbot/parse`, `chatbotAI.ts`, `types/chatbotAI.ts`), orphaned `/api/ai-command` route, unused `components/ai-chat/`, pre-API-migration `taskService.ts` / `taskCategoryService.ts` / `taskCategoryMerge.ts`, `seTemplate` left in place, and `utils/aiMessageParser.ts`. The task services were **client-side Firestore writes**, which the project's own standards forbid.
- 🗑️ Dropped unused `@google/generative-ai` dependency (superseded by the Vercel AI SDK).
- 🔧 **ESLint:** 82 errors → **0**. All were `no-require-imports` firing on CommonJS Node scripts; config now scopes that rule off for `scripts/**/*.js` and `check-env.js`. No source files changed.
- 📚 **Docs:** stale references to deleted modules removed across ARCHITECTURE, API_GUIDE, SECURITY, DEVELOPER_GUIDE, JUNIOR_DEVELOPER_GUIDE and FEATURES.

---

## [2.5.3] - 2026-05-06 - Meeting notes (ideas & execution), AE review seed script

- ✅ **Notes:** **Ideas & execution** section on customer notes (`otherFields.ideasExecution`), aligned with domain constants (`MEETING_NOTE_OTHER_FIELDS`).
- 📚 **Docs:** [MEETING_NOTES.md](MEETING_NOTES.md); journey/architecture cross-links.
- 🔧 **Ops:** Gitignored `scripts/seedJohnFalloAccountReview.local.js` to upsert AE/SC account-review customers, contacts, notes, and Sumith follow-up tasks (run with `--apply` after review).

---

## [2.5.2] - 2026-05-06 - Tasks UX hardening, Gantt pagination, docs/security alignment

- ✅ **Tasks UX:** Kanban cards now support **card-surface drag/drop** (not only grip drag), with protected click actions for delete/link/workspace controls.
- ✅ **Calendar:** Added a **Gantt-style timeline lane** with month-relative bars and **pagination** for large task lists.
- ♻️ **Component reuse:** Extracted task search/filter shell into reusable **`TaskFiltersBar`** component (`src/components/tasks/TaskFiltersBar.tsx`), reducing orchestrator bloat.
- 🔐 **Security docs:** Added guidance for local-only data scripts (`scripts/*.local.*`) and dry-run-first operational practice.
- 📚 **Journey docs:** Updated customer journey with an explicit task execution loop diagram (Kanban → notes/opportunity → timeline).

---

## [2.5.1] - 2026-05-03 - Documentation: Hub API auth & workspace

- 📚 **[API_GUIDE.md](API_GUIDE.md)**, **[SECURITY.md](SECURITY.md)**, **[SETUP.md](SETUP.md)**, **[ARCHITECTURE.md](ARCHITECTURE.md)**, **[docs/README.md](README.md)**, **[DOCUMENTATION_SUMMARY.md](DOCUMENTATION_SUMMARY.md)**: Document that hub REST endpoints require **`FIREBASE_SERVICE_ACCOUNT_JSON`** plus **`Authorization: Bearer <Firebase ID token>`** (otherwise **503** / **401**); added **`GET /api/workspace`**; **`POST /api/ai-chat`** accepts **`{ message }`** only and binds tool mutations to the token **`uid`**.
- 📚 **DEVELOPER_GUIDE**, **FEATURES**, **AI_CHAT_PANEL_GUIDE**: Cross-references aligned with API-first workspace load and server-side Hub assistant requests.

---

## [2.5.0] - 2026-05-03 - Tasks UX, journey docs, hub chrome

- ✅ **Tasks:** `cancelled` status, `productIds`, search & filters (incl. product), four-column Kanban, filtered drag merge into full list.
- ✅ **Dashboard:** Open tasks exclude Done and Cancelled; **StatCard** optional hint for the tasks metric.
- ✅ **Hub:** Workspace bar uses `role="tablist"` / `tab` semantics, horizontal scroll on small screens, refined **HomeTabButton** and tab panel wiring.
- ✅ **Tasks UX:** Clear filters, empty states (no tasks / no matches), column empty hints, Board/Month toggle `aria-pressed`.
- 📚 **Docs:** **[CUSTOMER_JOURNEY.md](CUSTOMER_JOURNEY.md)** (flows + mermaid), **ARCHITECTURE** task model, **USER_GUIDE** / **FEATURES** / **SCRIPTS** updated; root **README** links journey doc.

---

- ✅ **`src/domain/engagement-hub/`** — Pure rules: task removal cascades (`taskRemoval`), dashboard stats (`dashboardStats`).
- ✅ **Hooks:** `useFirestoreSnapshotSync` (fixes invalid `useState` side-effect sync), `useEngagementDeletionHandlers`, `useAiPanelEntityActions`.
- ✅ **`src/components/home/`** — `StatCard`, `HomeTabButton` (typed `LucideIcon` props).
- ✅ **Server:** `src/lib/server/firebaseAdmin.ts` + `authorizeApiRequest.ts`; **required** Bearer JWT verification when **`FIREBASE_SERVICE_ACCOUNT_JSON`** is set (**503** if Admin is unavailable).
- ✅ **API routes:** `customers`, `notes`, `contacts`, `entities`, `opportunities`, `opportunities/stage`, **`ai-chat`** (POST), **`/api/workspace`**, etc., use **`authorizeApiRequest`**; **`userId`** must match token **`uid`** where enforced (not **`POST /api/ai-chat`**); notes PUT no longer reads `request.json()` twice on error paths.
- ✅ **`firebase-admin`** moved to **runtime dependencies** for production installs.
- 🔒 **`check-env.js`** no longer prints partial secret values; **`/api/ai-command`** uses **`authorizeApiRequest`** + **`userId`** alignment (no stub user ids).

---

## [2.3.0] - 2026-02-10 - API Layer Refactoring
- ✅ Created REST API routes for all entities
  - `/api/customers` - Customer CRUD operations
  - `/api/notes` - Note CRUD operations
  - `/api/opportunities` - Opportunity CRUD + stage changes
  - `/api/contacts` - Contact management (Firebase integration pending)
  - `/api/entities` - Products & Partners management (Firebase integration pending)
- ✅ Defensive error handling (auto-create fallback on failed updates)
- ✅ Consistent JSON response format
- ✅ Proper HTTP status codes
- 📚 Created [API_GUIDE.md](API_GUIDE.md) for API documentation

## [2.2.0] - 2026-02-10 - Code Refactoring
- 📦 Custom hooks: `useFirebaseData`, `useNoteOperations`, `useCustomerOperations`, `useOpportunityOperations`
- 🎨 AI components: `ChatInterface`, `ChatInput`, `aiMessageParser` utility
- 📉 File size: `page.tsx` reduced 543 → 280 lines (48%)
- 🗄️ Entity management: Contacts saved to separate Firebase collections
- ✅ Defensive error handling throughout

## [2.1.1] - 2026-02 - AI Chat Fixes
- 🧠 Smart customer detection (checks if exists before creating)
- 📝 Verbose AI responses
- 👥 Intelligent contact parsing
- ✅ Fixed confirm/cancel buttons
- 🎨 Fixed invisible text in inputs

## [2.1.0] - 2026-02 - AI Chat Panel Redesign
- 🎨 Slide-out AI panel (replaces tabs)
- ✨ Floating action button
- 📚 Integrated prompt library (28+ prompts)
- ➕ Custom prompt creation
- 💾 LocalStorage persistence

## [2.0.0] - 2026-02 - Documentation & Code Simplification
- 📚 Documentation reduced 42+ files → 8 organized guides (81% reduction)
- 🔧 Split types into modular files
- 🔧 Refactored `CustomerList` component
- 🐛 Fixed Firebase auth, permissions, Turbopack warnings

## [1.2.0] - 2025 - AI Chatbot Release
- 🤖 AI chatbot interface
- 📚 Prompt library
- 🧠 Smart parsing
- ✅ Confirmation workflow

## [1.1.0] - 2025 - Customer Management Enhancements
- 📊 Grid & list views
- 🔍 Advanced filtering
- 👔 Account executive field
- 🎯 Opportunity tracking (9 sales stages)
- 📋 Customer profiles
- 📝 Dynamic notes

## [1.0.0] - 2025 - Initial Release
- ✅ Customer CRUD
- 📝 Notes management
- 🔥 Firebase integration
- 🤖 AI integration (Google Gemini)
- 📱 Responsive design

---

## Key Issue Resolutions

**Firebase Authentication** - Fixed invalid API key error  
**Firestore Permissions** - Updated security rules  
**Sign-in Redirect** - Improved error handling  
**Build Warnings** - Fixed Turbopack & metadata warnings  

**Security** - All API keys in `.env.local`, no hardcoded secrets  
**Performance** - Custom hooks, memoization, code splitting

---

For details see: [API_GUIDE.md](API_GUIDE.md), [USER_GUIDE.md](USER_GUIDE.md), [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
