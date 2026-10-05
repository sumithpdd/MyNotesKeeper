# Deploy on Vercel (Production)

Production host for **Customer Engagement Hub** (GitHub: [sumithpdd/MyNotesKeeper](https://github.com/sumithpdd/MyNotesKeeper)).

## Production URL

| Item | Value |
|------|--------|
| **Live app** | [https://customerengagementhub.vercel.app/](https://customerengagementhub.vercel.app/) |
| **Vercel dashboard** | [novo-wallet / my-notes-keeper](https://vercel.com/novo-wallet/my-notes-keeper) |
| **Team** | `novo-wallet` |
| **Project** | `my-notes-keeper` |
| **Git** | `sumithpdd/MyNotesKeeper`, branch **`main`** |
| **Firebase project** | `customerengagementhub` |

After **Production** is **Ready**, open the live app URL — you should see **Google sign-in**, not Vercel `NOT_FOUND`.

---

## First-time setup (new Vercel project)

If the dashboard shows **“No Production Deployment”** and checklist **0/5**:

1. **Connect Git**  
   [Project → Settings → Git](https://vercel.com/novo-wallet/my-notes-keeper/settings/git) → **Connect Git Repository** → **GitHub** → **`sumithpdd/MyNotesKeeper`**.  
   - **Root Directory:** `.` (repo root)  
   - **Production Branch:** `main`

2. **Environment variables**  
   [Settings → Environment Variables](https://vercel.com/novo-wallet/my-notes-keeper/settings/environment-variables) — add every **Required** name below for **Production** (and **Preview** if you use PR previews). Copy values from your local `.env.local` / old Vercel project (never commit values to git).  
   **Important:** `NEXT_PUBLIC_FIREBASE_*` must be set **before** the build runs — Vercel inlines them at build time. Wrong or missing `NEXT_PUBLIC_FIREBASE_API_KEY` causes **`auth/invalid-api-key`** during `next build`.

3. **Deploy**  
   Push to `main` or **Deployments → Redeploy**. Build uses **Node 24.x** (`package.json` `engines` + `.nvmrc`).

4. **Firebase authorized domain**  
   [Firebase Console](https://console.firebase.google.com) → **Authentication** → **Settings** → **Authorized domains** → add:  
   **`customerengagementhub.vercel.app`** (no `https://`)

5. **Smoke test**  
   Sign in → home loads with **Quicklook** / stats → DevTools → `GET /api/workspace` → **200**.

Optional Vercel env: **`HUSKY=0`** (hooks already skipped via `scripts/prepare-husky.js` when `VERCEL` is set).

---

## Environment variables (Production)

### Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web SDK (restrict key by HTTP referrer in Google Cloud) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | e.g. `customerengagementhub.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | e.g. `customerengagementhub` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | e.g. `customerengagementhub.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | From Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | From Firebase web app config |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **One-line** service account JSON (server `/api/*`) |
| `GEMINI_API_KEY` | Server-only; **no** `NEXT_PUBLIC_` prefix |

### Recommended / optional

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Analytics (optional) |
| `GEMINI_MODEL` | Override default AI model |
| `HUB_WORKSPACE_CUSTOMER_SCOPE` | `mine` to scope customers by creator; omit for team roster |

Do **not** use `FIREBASE_SERVICE_ACCOUNT_PATH` on Vercel (local file paths only).

### Publish from `.env.local` via CLI

```bash
npx vercel login
node scripts/publishVercelEnv.local.js --dry-run
node scripts/publishVercelEnv.local.js
npx vercel --prod
```

Targets team **`novo-wallet`**, project **`my-notes-keeper`** (override with `--scope=` / `--project=`).  
The script reads **`FIREBASE_SERVICE_ACCOUNT_PATH`** locally and uploads **`FIREBASE_SERVICE_ACCOUNT_JSON`** to Vercel.

If the CLI errors with **self-signed certificate in certificate chain**, use the same terminal only (corporate SSL inspection):

PowerShell: `$env:NODE_TLS_REJECT_UNAUTHORIZED='0'`

---

## Domains

**Production hostname:** **`customerengagementhub.vercel.app`** — add it under [Settings → Domains](https://vercel.com/novo-wallet/my-notes-keeper/settings/domains) on project **`my-notes-keeper`** (team **`novo-wallet`**) if it is not already assigned.

Vercel also provides **`my-notes-keeper.vercel.app`** from the project slug; both can point at the same deployment.

Update **GitHub → Repository → Website** to [https://customerengagementhub.vercel.app/](https://customerengagementhub.vercel.app/).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **No Production Deployment** | Connect Git (above); push `main` or import deploy |
| **`NOT_FOUND`** on URL | Domain on wrong project or no deploy — use **Visit** from a **Ready** deployment on [my-notes-keeper](https://vercel.com/novo-wallet/my-notes-keeper) |
| **`auth/unauthorized-domain`** | Add `customerengagementhub.vercel.app` in Firebase authorized domains |
| Blank data after login | Fix `FIREBASE_SERVICE_ACCOUNT_JSON`; redeploy |
| **`husky` / not a git repository** | Repo skips husky on Vercel; optional `HUSKY=0` |
| Node version message | Use **`24.x`** in `engines` (already in repo) |

---

## Related docs

- [SETUP.md](SETUP.md) — local `.env.local`  
- [SECURITY.md](SECURITY.md) — secrets and `NEXT_PUBLIC_*`  
- [API_GUIDE.md](API_GUIDE.md) — `/api/workspace`  
