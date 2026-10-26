# Model Context Protocol (MCP) — Customer Engagement Hub

Connect **Claude**, **ChatGPT**, **Cursor**, or **Copilot** to your hub data without exposing Firebase Admin or Gemini keys to the LLM client. Pattern aligned with [AI DevCamp MCP](https://github.com/sumithpdd/AI_DevCamp_BuildwithAI) (`packages/devcamp-mcp`, hosted `/api/mcp`, opaque tokens).

## Who this is for

| Audience | Path |
|----------|------|
| **Hub users (SE/AE)** | Sign in → [**/mcp**](https://customerengagementhub.vercel.app/mcp) → mint `hubmcp_…` → add remote MCP connector |
| **Same user in-browser** | **AI Chat** panel → `POST /api/ai-chat` (no MCP required) |
| **Maintainers** | `packages/hub-mcp/` + `src/lib/mcp/accessTokens.ts` |

## Security model

1. **Bearer auth only** — `Authorization: Bearer hubmcp_…` or a short-lived **Firebase ID token** (dev).
2. **Tokens** — Stored hashed in Firestore `mcpAccessTokens` (rules: **deny all** client access). Plaintext shown **once** at mint.
3. **Scopes** — `read` (search, account status, summarize) and `write` (add note, create task). Mint read-only tokens for exploration.
4. **Tenancy** — Same as [`GET /api/workspace`](API_GUIDE.md): Admin SDK + your `uid`; optional `HUB_WORKSPACE_CUSTOMER_SCOPE=mine`.
5. **Secrets** — Never put `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON`, or service account JSON in MCP client config. Summaries run **server-side** only.
6. **CORS** — `/api/mcp` allows connector `Origin` headers when Bearer auth is present (for hosted Claude/ChatGPT).

See [SECURITY.md](SECURITY.md).

## Setup (production)

1. Deploy hub with **`FIREBASE_SERVICE_ACCOUNT_JSON`** and **`GEMINI_API_KEY`** on Vercel.
2. Deploy Firestore rules (`npm run deploy:rules`) so `mcpAccessTokens` stays server-only.
3. Open **https://customerengagementhub.vercel.app/mcp** (or your domain).
4. Create a token (read/write or read-only).
5. In your LLM app, add a **remote MCP** server:

```json
{
  "mcpServers": {
    "customer-engagement-hub": {
      "url": "https://customerengagementhub.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer hubmcp_REPLACE_ME"
      }
    }
  }
}
```

Optional: set **`NEXT_PUBLIC_MCP_HTTP_URL`** so `/mcp` displays the exact public URL.

## Tools (v1)

| Tool | Scope | Purpose |
|------|--------|---------|
| `hub_overview` | read | Counts for workspace |
| `search_customers` | read | Find accounts by name |
| `account_status` | read | Notes, opps, tasks for one account |
| `list_tasks` | read | Filter tasks |
| `summarize_engagement_text` | read | Summarize pasted email/meeting text (Gemini) |
| `customer_ai_summary` | read | AI summary from stored profile |
| `add_customer_note` | write | Persist a note |
| `create_engagement_task` | write | Kanban/calendar task |

Revoke tokens anytime on `/mcp`.

## API routes

| Method | Path | Auth |
|--------|------|------|
| GET/POST/DELETE | `/api/mcp` | Bearer |
| GET/POST | `/api/mcp/tokens` | Firebase Bearer |
| DELETE | `/api/mcp/tokens/[id]` | Firebase Bearer |

## Related

- [API_GUIDE.md](API_GUIDE.md) — REST + `ai-chat`
- [AI_CHAT_PANEL_GUIDE.md](AI_CHAT_PANEL_GUIDE.md) — in-app assistant
- [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) — production host
