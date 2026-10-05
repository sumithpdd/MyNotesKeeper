# Deploy on Vercel (Production)

This guide covers the **demo / production** host, environment variables, Firebase auth domains, and common errors.

## Production URL

| Item | Value |
|------|--------|
| **Primary demo** | [https://my-customer-engagement-hub.vercel.app/](https://my-customer-engagement-hub.vercel.app/) |
| **Vercel project name** | `customer-engagement-hub` (Git: `sumithpdd/MyNotesKeeper`, branch `main`) |
| **Firebase project** | `customerengagementhub` (auth domains: `customerengagementhub.firebaseapp.com`, `customerengagementhub.web.app`) |

After each **Production** deployment, open the URL above. You should see the **Google sign-in** page—not Vercel `NOT_FOUND`.

---

## Environment variables (Production)

In **Vercel → Project → Settings → Environment Variables**, every row below must be enabled for **Production** (and usually **Preview** if you test PRs). Values must match your Firebase / Gemini projects—never commit them to git.

### Required

| Variable | Scope | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Production | Firebase web SDK (browser-visible; restrict key by HTTP referrer in Google Cloud) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Production | Typically `customerengagementhub.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Production | Typically `customerengagementhub` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Production | e.g. `customerengagementhub.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Production | From Firebase web app config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Production | From Firebase web app config |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Production | **Entire** service account JSON on **one line** (Firebase Console → Project settings → Service accounts → Generate key). Powers `/api/workspace` and all authenticated `/api/*` routes. |
| `GEMINI_API_KEY` | Production | Server-only Gemini key for `/api/ai-chat`, refine, summaries. **Do not** use `NEXT_PUBLIC_` prefix. |

### Recommended

| Variable | Scope | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Production | Analytics (optional if unused) |
| `GEMINI_MODEL` | Production | Override default model (see `src/lib/aiModel.ts`) |

### Optional

| Variable | Scope | Purpose |
|----------|--------|---------|
| `HUB_WORKSPACE_CUSTOMER_SCOPE` | Production | Set to `mine` to scope customers by creator; omit for shared team roster |

### Do **not** use on Vercel

| Variable | Why |
|----------|-----|
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Points at a local file; use `FIREBASE_SERVICE_ACCOUNT_JSON` instead |

---

## How to verify variables (you run this—values stay in Vercel)

1. **Vercel → Settings → Environment Variables**  
   - Filter **Environment: Production**.  
   - Confirm each **Required** name exists (values are hidden—that is expected).

2. **Redeploy after changes**  
   - **Deployments → … → Redeploy** (Production).  
   - Env changes do not apply to old deployments until redeploy.

3. **Smoke test (signed in)**  
   - Open [https://my-customer-engagement-hub.vercel.app/](https://my-customer-engagement-hub.vercel.app/)  
   - Sign in with Google.  
   - Home should load **Quicklook** stats and customer counts (not stuck on “Loading…” forever).

4. **API check (browser DevTools → Network)**  
   - After sign-in, `GET /api/workspace` should return **200** with JSON.  
   - **401** → Bearer token / auth issue.  
   - **500** with Firebase Admin message → `FIREBASE_SERVICE_ACCOUNT_JSON` missing, malformed, or wrong project.

5. **Optional CLI (local machine)**  
   ```bash
   npx vercel env ls
   npx vercel env pull .env.vercel.local
   ```  
   Compare **names only** to the table above (do not commit `.env.vercel.local`).

---

## Firebase authorized domains

**Authentication → Settings → Authorized domains** must include:

- `localhost` (local dev)
- `my-customer-engagement-hub.vercel.app` (production demo)
- Default Firebase hosts (`*.firebaseapp.com`, `*.web.app`) as shipped by Firebase

If you add a **custom domain** later, add that hostname here too.

---

## Domains on Vercel

1. **Settings → Domains**  
   - `my-customer-engagement-hub.vercel.app` must be attached to **this** project (the one linked to GitHub `MyNotesKeeper`).

2. **Production deployment**  
   - **Deployments** tab should show **Production** + **Ready** (e.g. commit on `main`).

3. **GitHub homepage (optional)**  
   - Repo **Settings → General → Website** can point to the same demo URL.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Vercel **`NOT_FOUND`** / “This page doesn’t exist” (`lhr1::…`) | **Hostname has no deployment** — often the domain is on a **different/empty** Vercel project than the one Git deploys to | Open the **Ready** deployment on `customer-engagement-hub` → **Visit** (use that URL). Then **Settings → Domains**: remove `my-customer-engagement-hub.vercel.app` from any empty project and **add it to the Git-linked project**; redeploy Production |
| **`NOT_FOUND`** on custom name but deploy is **Ready** | Project slug mismatch (e.g. deploy on `customer-engagement-hub`, browser on `my-customer-engagement-hub`) | Same as above — domains must be on the project that owns the deployment |
| Another app on `customer-engagement-hub.vercel.app` | That global name may belong to **another team’s project** | Do **not** assume the short name; always use **Visit** from *your* deployment or your team alias |
| **`auth/unauthorized-domain`** | Host not in Firebase authorized domains | Add exact hostname (no `https://`) |
| **`auth/invalid-api-key`** | Wrong or missing `NEXT_PUBLIC_FIREBASE_*` | Copy from Firebase web app config; redeploy |
| Blank data after login | Missing / invalid `FIREBASE_SERVICE_ACCOUNT_JSON` | Regenerate service account JSON; paste one-line JSON in Vercel; redeploy |
| AI features fail | Missing `GEMINI_API_KEY` | Set server key; redeploy |
| Build fails on Vercel | Env or lockfile / monorepo root | Check build logs; see `next.config.ts` / parent lockfile warnings locally with `npm run build` |
| **`husky` / `not a git repository` during `npm install`** | `prepare` runs Git hooks install on Vercel | Fixed in repo: `prepare` skips when `VERCEL` or `CI` is set. Optional: add env **`HUSKY=0`** on Vercel. |
| **`engines` Node version** | Vercel requires a supported major | Repo pins **`24.x`** via `package.json` `engines` and **`.nvmrc`** (Vercel may deprecate older majors). |
| Log shows **`@1.1.0`** but local is newer | Deploy is an **older commit** | Redeploy latest **`main`** from GitHub (e.g. `2.6.x`). |

### npm install warnings (safe to ignore on Vercel)

Deprecated transitive packages (`inflight`, `glob@7`, etc.) come from dependencies; they do not block the build. **`added N packages`** without **`npm ERR!`** means install succeeded.

---

## Related docs

- [SETUP.md](SETUP.md) — local `.env.local` and Firebase setup  
- [SECURITY.md](SECURITY.md) — secrets and `NEXT_PUBLIC_*` rules  
- [API_GUIDE.md](API_GUIDE.md) — `/api/workspace` and Bearer auth  
- [DEPLOY_FIRESTORE_RULES.md](DEPLOY_FIRESTORE_RULES.md) — Firestore rules  
