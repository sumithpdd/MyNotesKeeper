# Security Guidelines

## Never commit

- **`.env.local`** — Contains API keys and secrets
- **`serviceAccountKey.json`** — Firebase Admin private key downloads (never publish)

- **`migration.csv`** (working copy — copy from **`migration.example.csv`**) — **Never** attach real-account migration extracts to Git (`git rm --cached migration.csv` if it slips in).

- **`singleCustomer.json`** (working copy — copy from **`singleCustomer.example.json`**) — Treat as potentially sensitive (`git rm --cached singleCustomer.json` if tracked).

- **`data/realCustomerData.ts`**, **`data/dummyData.ts`**, **`data/Customer*`** — Local/demo datasets (**gitignored**); do not add real-roster dumps to Git.
- **`scripts/*.local.*`** / **`scripts/*.local`** — Local admin/seed scripts that may contain real customer links/emails (intentionally gitignored).

- **`backups/`** — Database backups may contain sensitive data

## Configuration

- All API keys and secrets come from environment variables (see [SETUP.md](SETUP.md)).
- Never log API keys, even partially (including Bearer tokens).
- Never hardcode project IDs, domains, or credentials.

### `NEXT_PUBLIC_*` variables (browser-visible)

Next.js inlines **`NEXT_PUBLIC_*`** variables into the **client JavaScript bundle** at build time. They are public and must never hold real secrets.

- **`NEXT_PUBLIC_FIREBASE_*`** — public by design (Firebase web config). Restrict the API key by HTTP referrer in Google Cloud Console → Credentials, and rely on **Firestore Rules + Auth** (and optionally **App Check**) for actual security.
- **`GEMINI_API_KEY`** — **server-only**, no `NEXT_PUBLIC_` prefix. Used only by server code (`/api/*` routes). The client must call those routes via `hubAuthFetch` rather than calling Gemini directly. If the variable ever appears with a `NEXT_PUBLIC_` prefix again, the key is leaked into every browser visitor's JS bundle and must be rotated.
- **`FIREBASE_SERVICE_ACCOUNT_JSON`** — server-only secret for Firebase Admin SDK. Never expose, never log.

Scripts such as **`check-env.js`** only report configured/missing — they do **not** print secret values.

## Firebase (client)

- Browser access uses Firebase Auth plus Firestore rules (`request.auth`).
- Prefer separate Firebase projects for dev / staging / production.
- Rotate keys if exposed; deploy rules after schema changes (`npm run deploy:rules`).
- Rules today require **authenticated** users for most collections. **Multi-tenant isolation** (orgs, tenants) requires additional fields (`orgId`, `createdBy`-based constraints) — see comments in [`firestore.rules`](../firestore.rules).

## REST API routes (`/api/*`)

Several Next.js route handlers verify callers with **Firebase ID tokens** via **Firebase Admin**. Without service-account configuration, those routes return **503**, not an open API.

### When verification is enabled

Set **`FIREBASE_SERVICE_ACCOUNT_JSON`** *(single-line JSON)* or **`FIREBASE_SERVICE_ACCOUNT_PATH`** *(path to the downloaded key file)* in the environment where Next runs (`src/lib/server/firebaseAdmin.ts`). Hosted (Vercel, etc.): use **`FIREBASE_SERVICE_ACCOUNT_JSON`** as a secret. Local dev: **`FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json`** avoids pasting JSON into `.env.local`.

- **Workspace list:** With no `HUB_WORKSPACE_CUSTOMER_SCOPE` (default), **`GET /api/workspace`** includes **all** `customers` docs so the team shares one roster. **`HUB_WORKSPACE_CUSTOMER_SCOPE=mine`** restricts to `createdBy === uid` or `email` (see **SETUP.md**).

If this variable is **not** set, protected hub routes respond with **503** — *Hub API unavailable* — until you add the secret. **Local development** should also set it (same value as production/staging for that project) if you want the app to load workspace data and run CRUD APIs.

### Current behavior (summary)

- **503** if **`FIREBASE_SERVICE_ACCOUNT_JSON`** is missing — Admin cannot verify tokens or access Firestore server-side.
- **401** if the header is missing or the token is invalid.
- **Mutations** that accept **`userId`** in the JSON body must use the same value as the verified token’s **`uid`** (**403** otherwise). **`POST /api/ai-chat`** is an exception: it only needs **`{ message }`**; mutations from tools use the authenticated **`uid`** from the token ([API_GUIDE.md](API_GUIDE.md)).
- **GET /api/workspace** and other data routes require a valid Bearer token when Admin is configured.

See [API_GUIDE.md](API_GUIDE.md) for which endpoints participate and fetch examples.

### `/api/ai-command`

Uses **`authorizeApiRequest`** plus **`forbidUserIdMismatch`**: send **`Authorization: Bearer <Firebase ID token>`** and set **`userId`** in the body to the token’s **`uid`**. If Admin is not configured, the route returns **503** like other hub APIs.

## Best practices checklist

1. Copy env template → `.env.local` and fill only local values (`SETUP.md`).
2. Add `.env.local` to `.gitignore` (already done).
3. Add **`FIREBASE_SERVICE_ACCOUNT_JSON`** only on secure server environments; restrict who can deploy.
4. Use **least privilege** for the service account (only Firebase Admin scopes you need).
5. For one-off data updates, prefer **local scripts with dry-run mode first**, then apply mode (`--apply`) after review.
6. Keep customer-specific seed/check scripts local-only (`*.local.*`) and never commit them.
