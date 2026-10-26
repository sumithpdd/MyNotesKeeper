# Customer Engagement Hub MCP

Hosted HTTP MCP for external LLM clients. Runtime lives in this package; token minting UI is `/mcp`.

## Maintainers

- **Server factory:** `src/createServer.ts`
- **Tools:** `src/registerHubTools.ts` (Admin SDK — same boundaries as `/api/ai-chat`)
- **Auth:** `src/auth.ts` + `src/lib/mcp/accessTokens.ts`

Do not expose Admin credentials in attendee/LLM configs.

## Reference

Implementation follows patterns from **AI DevCamp** (`packages/devcamp-mcp`, `/api/mcp`, stateless Streamable HTTP on Vercel).
