# Customer Engagement Hub

A Next.js application for managing customer relationships, tracking engagement, and maintaining detailed notes - powered by AI.

## Quick Start

```bash
npm install
cp .env.example .env.local   # Add your Firebase & Gemini keys
npm run dev
```

Open **http://localhost:3000**

## Documentation

**All documentation is in the [`docs/`](docs/) folder.**

| Document | Purpose |
|----------|---------|
| [docs/README.md](docs/README.md) | Documentation hub & navigation |
| [docs/QUICKSTART.md](docs/QUICKSTART.md) | Get running in 5 minutes |
| [docs/SETUP.md](docs/SETUP.md) | Firebase & AI setup |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | How to use the app |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history |

## Security

- **Never commit** `.env.local`, `serviceAccountKey.json`, or any API keys
- All secrets must be in environment variables
- See [docs/SETUP.md](docs/SETUP.md) for secure configuration

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
```

---

**Start here:** [docs/README.md](docs/README.md)
