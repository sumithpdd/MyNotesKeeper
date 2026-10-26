# Conversation analytics

Gong-style **tracker counts** on opportunities (`conversationAnalytics` on the opportunity document).

## What the numbers mean

- **Counts** = how often a topic appeared on recorded calls (**coverage**), not whether the deal is qualified.
- **MEDDPICC / BANT scores** on the Qualification panel = deliberate 0–10 reads; set separately or import from your process.

## Frameworks (help text)

| Framework | Meaning |
|-----------|---------|
| **Command of the Message** | Sitecore messaging: before/after scenarios, positive business outcomes, negative consequences of inaction, required capabilities. |
| **MEDDPICC** | Metrics, Economic buyer, Decision criteria, Decision process, Paper process, Identify pain, Champion, Competition. |
| **BANT** | Budget, Authority, Need, Timeline. |
| **AI trackers** | Model-detected themes (objections, motives, SitecoreAI, next steps, etc.). |
| **Keyword trackers** | Phrase matches for discovery / objections. |
| **Filler words** | Coaching signal for talk track clarity. |

Implementation: `src/domain/engagement-hub/conversationAnalytics.ts`  
UI: **Opportunity detail** → Conversation analytics + Qualification (merged mention counts).
