# Opportunity stages in the Hub

The Hub tracks each deal along a **fixed nine-stage path**. Stages appear in dropdowns, the opportunity slide-out detail (with **time in stage**), and exports of history.

**Related code:** definitions and help text stay in sync with [`src/lib/opportunityStages.ts`](../src/lib/opportunityStages.ts).

**Last updated:** May 2026

---

## Time in stage

- **Displayed** on the opportunity list and detail header (e.g. “5 days in this stage”).
- **Definition:** Calendar days from the **latest** stage-history entry whose `toStage` equals the **current** stage, through today. If history is incomplete, creation date is used as a fallback.
- **History rows:** Each time you advance the stage, the Hub records how many days were spent in the **previous** stage (`duration`). That complements the current-stage timer.

Stages are unchanged when **editing fields other than stage** — only explicit stage changes extend `stageHistory`.

---

## The nine Hub stages

| Stage | Purpose (summary) | CRM wording (often) |
|--------|-------------------|---------------------|
| **Plan** | Why pursue, stakeholders, loose timing | Sometimes “Plan & Prospect” early path |
| **Prospect** | Appetite, champion, informal qualification | Prospecting motion |
| **Qualify** | Formal fit vs invest pursuit time | “Qualify” |
| **Discover** | Deep needs, demos, alignment | “Discover” |
| **Differentiate** | Why us vs alternatives | “Differentiate” |
| **Propose** | Commercial proposal under review | “Propose & Commit” |
| **Close** | Legal, security, contracting | Often overlaps “Contract to Close” |
| **Delivery and Success** | Post-signature onboarding / launch | Outside many CRM “opp” pipelines |
| **Expand** | Upsell / growth motions | Renewal or expansion motions |

CRM labels vary by tenant — use the mappings above **only as a guide**.

---

## In the UI

- **Opportunity form:** `?` help icons describe major fields; an expandable **reference** lists all stages and CRM cues (same language as this doc).
- **Opportunity detail:** **Stage help** summarizes stages; changing stage prompts for notes and appends history.
- **Docs:** **[CUSTOMER_JOURNEY.md](CUSTOMER_JOURNEY.md)** puts **Tasks first** operationally and explains how accounts, opportunities, and tasks connect.
