import type { Opportunity, OpportunityStage } from '@/types';

/** Canonical pipeline order shown in lists, forms, and detail. */
export const OPPORTUNITY_STAGE_ORDER: readonly OpportunityStage[] = [
  'Plan',
  'Prospect',
  'Qualify',
  'Discover',
  'Differentiate',
  'Propose',
  'Close',
  'Delivery and Success',
  'Expand',
] as const;

export type OpportunityStageHelpEntry = {
  /** Short label shown in UI help. */
  summary: string;
  /** How this often maps to Salesforce-style stage names (informal). */
  crmCue?: string;
};

/** Inline help — keep in sync with docs/OPPORTUNITY_STAGES.md */
export const OPPORTUNITY_STAGE_HELP: Record<OpportunityStage, OpportunityStageHelpEntry> = {
  Plan: {
    summary: 'Initial identification: why pursue this deal, stakeholders, rough timing.',
    crmCue: 'May align with “Plan & Prospect” / early qualification in CRM.',
  },
  Prospect: {
    summary: 'Active discovery whether there is appetite, budget hooks, and a champion.',
  },
  Qualify: {
    summary: 'Formal fit: pains, urgency, procurement path — decide to invest pursuit time.',
    crmCue: 'Often “Qualify” path in Salesforce-style stages.',
  },
  Discover: {
    summary: 'Deep needs discovery, workshops, demos; technical and business alignment.',
    crmCue: 'Roughly matches “Discover”.',
  },
  Differentiate: {
    summary: 'Why Sitecore versus alternatives; solution shape and value articulation.',
    crmCue: 'Often aligns with Salesforce “Differentiate”.',
  },
  Propose: {
    summary: 'Commercial proposal, pricing, commercials under review.',
    crmCue: 'Often aligns with “Propose & Commit”.',
  },
  Close: {
    summary: 'Contracting: legal, security, procurement; decision pending signature.',
    crmCue: 'May overlap “Contract to Close”.',
  },
  'Delivery and Success': {
    summary: 'After signature: onboarding, launch, stabilisation — still part of engagement tracking.',
    crmCue: 'Post-close delivery; may sit outside classic “opportunity” in some CRMs.',
  },
  Expand: {
    summary: 'Growth: upsell, new use cases, additional products or regions.',
  },
};

/** When the opportunity last entered the current stage (latest matching history entry). */
export function getCurrentStageEnteredAt(opportunity: Opportunity): Date {
  let latest: Date | null = null;
  for (const e of opportunity.stageHistory || []) {
    if (e.toStage !== opportunity.currentStage || e.changedAt == null) continue;
    const t = new Date(e.changedAt).getTime();
    if (!Number.isFinite(t)) continue;
    if (!latest || t > latest.getTime()) latest = new Date(t);
  }
  if (latest) return latest;
  const c = opportunity.createdAt ? new Date(opportunity.createdAt) : null;
  return c && Number.isFinite(c.getTime()) ? c : new Date();
}

/** Whole calendar days from `start` through `end` (inclusive-ish by floor). */
export function calendarDaysBetween(start: Date, end: Date = new Date()): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
}

export function formatTimeInCurrentStage(opportunity: Opportunity, now: Date = new Date()): string {
  const days = calendarDaysBetween(getCurrentStageEnteredAt(opportunity), now);
  if (days <= 0) return 'Entered this stage today';
  if (days === 1) return '1 day in this stage';
  return `${days} days in this stage`;
}
