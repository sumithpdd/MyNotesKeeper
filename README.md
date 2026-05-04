# Customer Engagement Hub

A Next.js application for managing customer relationships, tracking engagement, and maintaining detailed notes - powered by AI.

## Quick Start

```bash
npm install
cp .env.example .env.local   # Firebase web config, Gemini, and FIREBASE_SERVICE_ACCOUNT_JSON — see docs/SETUP.md
npm run dev
```

Open **http://localhost:3000** — the hub opens on **Tasks & Kanban** by default.

## Documentation

**All documentation is in the [`docs/`](docs/) folder.**

| Document | Purpose |
|----------|---------|
| [docs/README.md](docs/README.md) | Documentation hub & navigation |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Get running in 5 minutes |
| [docs/SETUP.md](docs/SETUP.md) | Firebase & AI setup |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | How to use the app |
| [docs/CUSTOMER_JOURNEY.md](docs/CUSTOMER_JOURNEY.md) | Engagement workflows (tasks-first, tabs, outcomes) |
| [docs/OPPORTUNITY_STAGES.md](docs/OPPORTUNITY_STAGES.md) | Nine opportunity stages & time-in-stage |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history |
| [docs/DEPLOY_FIRESTORE_RULES.md](docs/DEPLOY_FIRESTORE_RULES.md) | Fix Firestore permissions |
| [docs/API_GUIDE.md](docs/API_GUIDE.md) | REST APIs, **`GET /api/workspace`**, Firebase Admin Bearer auth |
| [docs/SECURITY.md](docs/SECURITY.md) | Security practices (clients, APIs, Firebase) |

## Security

- **Never commit** `.env.local`, `serviceAccountKey.json`, or any API keys
- All secrets must be in environment variables
- Hub **`/api/*`** routes expect **`FIREBASE_SERVICE_ACCOUNT_JSON`** on the server and **`Authorization: Bearer <Firebase ID token>`** on requests (see [docs/API_GUIDE.md](docs/API_GUIDE.md) / [docs/SECURITY.md](docs/SECURITY.md))
- See [docs/SETUP.md](docs/SETUP.md) for secure configuration

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```

---

**Start here:** [docs/README.md](docs/README.md)
