# Deploy on Vercel (Production)

Production host for **Customer Engagement Hub** (GitHub: [sumithpdd/MyNotesKeeper](https://github.com/sumithpdd/MyNotesKeeper)).

## Production URL

| Item | Value |
|------|--------|
| **Live app** | [https://my-notes-keeper.vercel.app/](https://my-notes-keeper.vercel.app/) |
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

3. **Deploy**  
   Push to `main` or **Deployments → Redeploy**. Build uses **Node 24.x** (`package.json` `engines` + `.nvmrc`).

4. **Firebase authorized domain**  
   [Firebase Console](https://console.firebase.google.com) → **Authentication** → **Settings** → **Authorized domains** → add:  
   **`my-notes-keeper.vercel.app`** (no `https://`)

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

---

## Domains

Default hostname **`my-notes-keeper.vercel.app`** is assigned to this project when the slug is `my-notes-keeper`.  
Optional: **Settings → Domains** → add **`my-engagement-hub.vercel.app`** (or another alias) on **this same project** after the first successful deploy.

Update **GitHub → Repository → Website** to [https://my-notes-keeper.vercel.app/](https://my-notes-keeper.vercel.app/).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **No Production Deployment** | Connect Git (above); push `main` or import deploy |
| **`NOT_FOUND`** on URL | Domain on wrong project or no deploy — use **Visit** from a **Ready** deployment on [my-notes-keeper](https://vercel.com/novo-wallet/my-notes-keeper) |
| **`auth/unauthorized-domain`** | Add `my-notes-keeper.vercel.app` in Firebase authorized domains |
| Blank data after login | Fix `FIREBASE_SERVICE_ACCOUNT_JSON`; redeploy |
| **`husky` / not a git repository** | Repo skips husky on Vercel; optional `HUSKY=0` |
| Node version message | Use **`24.x`** in `engines` (already in repo) |

---

## Related docs

- [SETUP.md](SETUP.md) — local `.env.local`  
- [SECURITY.md](SECURITY.md) — secrets and `NEXT_PUBLIC_*`  
- [API_GUIDE.md](API_GUIDE.md) — `/api/workspace`  
