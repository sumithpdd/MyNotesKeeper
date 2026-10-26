# Claude prompts — Camping & Caravanning Club

Use with MCP connected ([MCP_CLAUDE.md](../MCP_CLAUDE.md)). Hub account name: **Camping & Caravanning Club**.

## Account context (reference)

| Field | Value |
|-------|--------|
| AE | Ibrahim Samy |
| Partner | CodeHouse |
| CRM | [Opportunity 006Uj00000XxWIbIAN](https://sitecore.lightning.force.com/lightning/r/Opportunity/006Uj00000XxWIbIAN/view) |
| Workshop | Tue **27 Oct 2026** (with CodeHouse + Sitecore) |
| Priorities | Front-end; **search & book**; catch up to category; season **March** |
| Session outcomes | Pre-March improvements; long-term roadmap; unused-feature audit; platform investment view |
| AI narrative | SitecoreAI + **Scrunch** tied to search/book and front-end goals |

## Prompt templates

### Refresh from hub

```
Use account_status for "Camping & Caravanning Club". Summarize opportunities, notes, and tasks.
Call out missing CRM fields, partner linkage, or workshop prep gaps.
Always give the user the hubReviewUrl from the tool response so they can open the account in the browser.
```

### Email → note

```
Summarize the text below with summarize_engagement_text (customerName: Camping & Caravanning Club).
Show me the summary; if I say yes, add_customer_note with seConfidence Yellow and noteDate today.
```

### Post-workshop follow-up

```
For Camping & Caravanning Club, create_engagement_task:
title "C&C — post-workshop actions", category Meeting Preparation,
dueDate one week after 2026-10-27, description from our last note's "next steps".
```

### Stakeholders (proper fields)

```
Use link_stakeholders_for_account for "Camping & Caravanning Club":
- sitecoreInternals: Ibrahim Samy (AE, isAccountExecutive true), Ken Jones (Sitecore sales)
- customerContacts: Rachael Pearson, Rachel Grimes, Nicola Jones, Emma Moran, Laura Swanborough, Fraser Marscheider (company Camping & Caravanning Club)
- partners: Codehouse with contacts Frederic Parisis and Jaime Levell
Then account_status and confirm customerContactIds, internalContactIds, partnerIds.
```

### Completeness check

```
Search customers for "Camping". Compare account_status to the account context in docs/prompts/claude-camping-caravanning-club.md
and list what still needs updating in the hub (AE, partner, opp URL, tasks, SE notes).
```

---

*Update this file as the deal evolves; ask Cursor to sync hub data via MCP or local seed scripts.*
