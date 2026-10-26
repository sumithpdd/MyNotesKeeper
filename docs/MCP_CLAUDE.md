# Connect Claude to Customer Engagement Hub (MCP)

Use Claude as your SE assistant against **live hub data** — same security model as [MCP.md](MCP.md) (opaque `hubmcp_…` token, no Firebase/Gemini secrets in Claude).

## 1. Mint a token (once)

1. Sign in at [customerengagementhub.vercel.app](https://customerengagementhub.vercel.app/).
2. Open [**/mcp**](https://customerengagementhub.vercel.app/mcp) (user menu → **LLM / MCP connectors**).
3. Label e.g. `claude-desktop` → **Create token** (leave **read/write** unless you only want read-only).
4. Copy **`hubmcp_…`** and the JSON snippet — shown **once**.

Use a **write** token if Claude should add notes or tasks. Revoke on `/mcp` if the token leaks.

## 2. Add the MCP server in Claude

### Claude Desktop (Windows / Mac)

1. **Settings** → **Developer** → **Edit Config** (opens `claude_desktop_config.json`).
2. Merge:

```json
{
  "mcpServers": {
    "customer-engagement-hub": {
      "url": "https://customerengagementhub.vercel.app/api/mcp",
      "headers": {
        "Authorization": "Bearer hubmcp_PASTE_YOUR_TOKEN"
      }
    }
  }
}
```

3. **Quit and restart Claude Desktop** (required after hub MCP updates — tool list is cached).
4. New chat → confirm tools include **`list_products`**, **`update_customer_account`**, **`update_customer_profile`**, **`account_review_url`**, stakeholder and note tools (server **v1.5+**).

### Claude on the web (claude.ai)

1. **Settings** → **Integrations** / **Connected tools** (wording varies by plan).
2. Add **custom MCP** or **remote MCP**:
   - **URL:** `https://customerengagementhub.vercel.app/api/mcp`
   - **Header:** `Authorization: Bearer hubmcp_…`
3. Enable the connector for your chat or project.

**Important:** Paste **`/api/mcp`**, not `/mcp`. `/mcp` is only the token minting page.

## 3. Tools Claude can use

| Tool | Use when |
|------|----------|
| `search_customers` | Find account by partial name |
| `account_status` | Full snapshot: notes, opps, tasks, CRM links — includes **`hubReviewUrl`** for the user |
| **`account_review_url`** | **Shareable hub link** to open the account (optionally one opportunity) |
| `summarize_engagement_text` | Paste email/meeting text → structured summary (Gemini on server) |
| `add_customer_note` | Save summary or SE note to hub |
| **`set_account_stakeholders`** | **Primary** — customer / partner / Sitecore contacts on the account (not notes) |
| `link_stakeholders_for_account` | Same as `set_account_stakeholders` |
| `list_customer_notes` | List note ids (for delete/update) |
| `delete_customer_note` | Remove a duplicate or obsolete note |
| `update_customer_note` | Edit note text |
| `create_engagement_task` | Workshop, follow-up, calendar item |
| `list_tasks` / `list_notes` | Filter by account |
| `customer_ai_summary` | AI summary from stored profile fields |
| `hub_overview` | Workspace counts |
| **`list_products`** | Product catalog ids/labels for **owned** products on an account |
| **`update_customer_account`** | Patch account fields; **`productIds`** or **`productLabels`** replaces owned products (not opps) |
| **`update_customer_profile`** | Patch profile (business problem, SE/Services, objectives, discovery, risks, use cases) |
| **`upsert_opportunity`** | Create/update opportunities (SitecoreAI, Scrunch, etc.) |
| **`update_engagement_task`** | Task status, due date, title |

## 4. Starter instructions (paste into Claude Project / system prompt)

Copy the block below into a **Claude Project** “Instructions” field (or the first message of a dedicated chat):

```markdown
You are my Sales Engineer copilot for Sitecore Customer Engagement Hub (via MCP).

Rules:
- Always use MCP tools for hub data — never invent CRM URLs, dates, or stakeholders.
- Before changing data, call `account_status` or `search_customers` to confirm the account.
- SE notes format: lead with date and initials, e.g. `27/10/2026 SPD — …`
- After summarizing emails, offer to `add_customer_note` and `create_engagement_task` with my confirmation.
- Do not expose or repeat MCP tokens or API keys.

Current focus account: **Camping & Caravanning Club**
- AE: Ibrahim Samy | Partner: CodeHouse
- Salesforce opp: https://sitecore.lightning.force.com/lightning/r/Opportunity/006Uj00000XxWIbIAN/view
- Themes: front-end, search & book, March season, SitecoreAI + Scrunch tied to customer outcomes
```

## 5. Example prompts (Camping & Caravanning Club)

- “Call `account_status` for Camping & Caravanning Club and list gaps vs what we know about the 27 Oct workshop.”
- “Summarize this email, then add it as a customer note if I confirm: …”
- “Create a Meeting Preparation task for 27 Oct 2026 linked to Camping & Caravanning Club.”
- “What tasks and notes exist for this account?”

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| No tools in Claude | Restart Desktop app; check JSON syntax; token not revoked |
| 401 on MCP | Regenerate token on `/mcp` |
| Empty customer list | Same Google account as hub sign-in; check `HUB_WORKSPACE_CUSTOMER_SCOPE` on Vercel |
| Write tools fail | Mint token with **write** scope |

See also [SECURITY.md](SECURITY.md) and [MCP.md](MCP.md).
