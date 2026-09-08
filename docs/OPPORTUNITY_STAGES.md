# Opportunity stages in the Hub

The Hub tracks each deal along a **fixed nine-stage path**. Stages appear in dropdowns, the opportunity slide-out detail (with **time in stage**), and exports of history.

**Related code:** definitions and help text stay in sync with [`src/lib/opportunityStages.ts`](../src/lib/opportunityStages.ts).

**Last updated:** September 2026

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

---

## CRM stage mapping (executable)

The table above is guidance for humans; **importers must use `stageFromCrmLabel()`** in [`src/lib/opportunityStages.ts`](../src/lib/opportunityStages.ts), which is the machine-readable form of the same mapping. Matching is case-insensitive after trimming.

| CRM label | Hub stage |
|-----------|-----------|
| `Discover` | Discover |
| `Qualify` | Qualify |
| `Differentiate` | Differentiate |
| **`Propose & Commit`** | **Propose** |
| **`Contract to Close`** | **Close** |
| `Plan` / `Prospect` / `Delivery and Success` / `Expand` | same name |

Unrecognised labels return `null` — importers should surface that rather than silently defaulting to a stage.

`ACTIVE_PURSUIT_STAGES` exports the five live-pursuit stages (Qualify → Close), excluding pre-pursuit and post-signature.

---

## Opportunity type

`OpportunityType` carries the CRM picklist first, then Hub-native motions:

| Group | Values |
|-------|--------|
| **CRM** | `License`, `Renewal`, `Services` |
| Hub-native | `New Business`, `Upsell`, `Cross-sell`, `Migration` |

The opportunity form groups these under `<optgroup>` labels so CRM values are offered first.

---

## Fiscal periods

Fiscal periods are **derived, never stored** — see [`src/domain/engagement-hub/fiscalPeriod.ts`](../src/domain/engagement-hub/fiscalPeriod.ts).

The fiscal year starts **1 July** and is labelled by the calendar year it *ends* in:

| Quarter | Months | Example |
|---------|--------|---------|
| Q1 | Jul – Sep | Sep 2026 → `Q1-2027` |
| Q2 | Oct – Dec | Nov 2026 → `Q2-2027` |
| Q3 | Jan – Mar | Mar 2027 → `Q3-2027` |
| Q4 | Apr – Jun | Apr 2027 → `Q4-2027` |

`fiscalPeriodFor()`, `fiscalPeriodLabel()`, `fiscalQuarterRange()` and `groupByFiscalPeriod()` reproduce the CRM's *Fiscal Period* grouping from an opportunity's close date.

---

## In the UI

- **Opportunity form:** `?` help icons describe major fields; an expandable **reference** lists all stages and CRM cues (same language as this doc).
- **Opportunity detail:** **Stage help** summarizes stages; changing stage prompts for notes and appends history.
- **Docs:** **[CUSTOMER_JOURNEY.md](CUSTOMER_JOURNEY.md)** puts **Tasks first** operationally and explains how accounts, opportunities, and tasks connect.
