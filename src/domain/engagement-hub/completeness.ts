import type { Customer, CustomerProfile, CustomerNote } from '@/types/customer';
import type { Opportunity } from '@/types/opportunity';
import type { EngagementTask } from '@/types/task';
import { qualificationCoverage, parseDealQualification } from './dealQualification';
import { ACCOUNT_PLANNING_PILLARS, planFieldsFor } from './accountPlanningPillars';

/**
 * Record completeness across the engagement model.
 *
 * The point is not a vanity score — it is a worklist. Every missing field
 * carries the reason it matters, so "78%" turns into "no primary contact, and
 * the CRM link is still a placeholder".
 *
 * **Placeholders count as missing.** A field holding `XXXXXX`, `TODO` or
 * `your_value` looks populated to a null check but tells you nothing, and that
 * is precisely how a scrubbed CRM link survived unnoticed on a live account.
 */

export type CompletenessLevel = 'required' | 'recommended';
export type EntityKind = 'customer' | 'opportunity' | 'profile' | 'note' | 'task';

/** Values that are technically present but carry no information. */
const PLACEHOLDER_PATTERN =
  /^(n\/?a|tbc|tbd|todo|none|null|undefined|unknown|-{1,}|\.+)$|x{4,}|placeholder|your[_-]|example\.com|change[_ -]?me/i;

export function isPlaceholder(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return true;
  return PLACEHOLDER_PATTERN.test(v);
}

/** True when a value is genuinely populated (not empty, not a placeholder). */
export function hasRealValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0 && !isPlaceholder(value);
  if (Array.isArray(value)) return value.length > 0;
  if (value instanceof Date) return Number.isFinite(value.getTime());
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  return false;
}

export interface FieldSpec<T> {
  id: string;
  label: string;
  level: CompletenessLevel;
  /** Why this field earns its place — surfaced as the reason to fill it in. */
  why: string;
  filled: (entity: T, ctx: CompletenessContext) => boolean;
}

/** Related rows a field may need in order to judge itself. */
export interface CompletenessContext {
  profiles?: CustomerProfile[];
  notes?: CustomerNote[];
  opportunities?: Opportunity[];
  tasks?: EngagementTask[];
}

export interface MissingField {
  id: string;
  label: string;
  level: CompletenessLevel;
  why: string;
}

export interface EntityCompleteness {
  kind: EntityKind;
  id: string;
  name: string;
  /** 0-100. Required fields count double, so a missing essential hurts more. */
  score: number;
  requiredMissing: MissingField[];
  recommendedMissing: MissingField[];
  filled: number;
  total: number;
}

const REQUIRED_WEIGHT = 2;
const RECOMMENDED_WEIGHT = 1;

export function scoreEntity<T>(
  kind: EntityKind,
  id: string,
  name: string,
  entity: T,
  specs: readonly FieldSpec<T>[],
  ctx: CompletenessContext = {},
): EntityCompleteness {
  const requiredMissing: MissingField[] = [];
  const recommendedMissing: MissingField[] = [];
  let earned = 0;
  let possible = 0;
  let filled = 0;

  for (const spec of specs) {
    const weight = spec.level === 'required' ? REQUIRED_WEIGHT : RECOMMENDED_WEIGHT;
    possible += weight;
    let ok = false;
    try {
      ok = spec.filled(entity, ctx);
    } catch {
      ok = false; // a spec that throws on odd data counts as unmet, never crashes the report
    }
    if (ok) {
      earned += weight;
      filled += 1;
    } else {
      const miss = { id: spec.id, label: spec.label, level: spec.level, why: spec.why };
      if (spec.level === 'required') requiredMissing.push(miss);
      else recommendedMissing.push(miss);
    }
  }

  return {
    kind,
    id,
    name,
    score: possible === 0 ? 100 : Math.round((earned / possible) * 100),
    requiredMissing,
    recommendedMissing,
    filled,
    total: specs.length,
  };
}

// ---------------------------------------------------------------------------
// Field specs, one set per entity
// ---------------------------------------------------------------------------

export const CUSTOMER_FIELDS: readonly FieldSpec<Customer>[] = [
  { id: 'customerName', label: 'Account name', level: 'required', why: 'Everything else hangs off it.', filled: (c) => hasRealValue(c.customerName) },
  { id: 'products', label: 'Products', level: 'required', why: 'Without products you cannot group accounts for a Lunch & Learn or webinar.', filled: (c) => hasRealValue(c.productIds) },
  { id: 'accountExecutive', label: 'Account executive', level: 'required', why: 'No AE means no one to align the account plan with.', filled: (c) => hasRealValue(c.accountExecutiveIds) || hasRealValue(c.accountExecutiveId) },
  { id: 'customerContacts', label: 'Customer contacts', level: 'required', why: 'Multi-threading is impossible without named stakeholders.', filled: (c) => hasRealValue(c.customerContactIds) },
  { id: 'primaryContact', label: 'Primary contact', level: 'required', why: 'Identifies who to go to first; mirrors the CRM Primary Contact role.', filled: (c) => hasRealValue(c.primaryCustomerContactId) },
  { id: 'website', label: 'Website', level: 'recommended', why: 'Needed for vertical research and AI-visibility checks.', filled: (c) => hasRealValue(c.website) || hasRealValue(c.websiteUrls) },
  { id: 'internalContacts', label: 'Internal team', level: 'recommended', why: 'Records who else at Sitecore is on the account.', filled: (c) => hasRealValue(c.internalContactIds) },
  { id: 'salesforceLink', label: 'Salesforce link', level: 'recommended', why: 'Ties the Hub record to the CRM. Placeholders do not count.', filled: (c) => hasRealValue(c.salesforceLink) },
  { id: 'sharePointUrl', label: 'SharePoint link', level: 'recommended', why: 'Where the account artefacts live.', filled: (c) => hasRealValue(c.sharePointUrl) },
  { id: 'partners', label: 'Partners', level: 'recommended', why: 'Delivery capacity shapes what you can credibly propose.', filled: (c) => hasRealValue(c.partnerIds) },
  { id: 'martechTools', label: 'Martech stack', level: 'recommended', why: 'Their existing tools are the integration and competitive picture.', filled: (c) => hasRealValue(c.martechToolIds) },
  {
    id: 'accountPlanning',
    label: 'Account plan (4 pillars)',
    level: 'recommended',
    why: 'Whitespace, multi-threading, migration and research drive the next actions.',
    filled: (c) =>
      ACCOUNT_PLANNING_PILLARS.some((p) => {
        const f = planFieldsFor(c.accountPlanning, p.id);
        return hasRealValue(f.approach) || hasRealValue(f.nextActions);
      }),
  },
  { id: 'hasProfile', label: 'Customer profile', level: 'recommended', why: 'Holds the business problem, why-us and why-now.', filled: (c, ctx) => (ctx.profiles ?? []).some((p) => p.customerId === c.id) },
  { id: 'hasNotes', label: 'At least one note', level: 'recommended', why: 'An account with no notes has no recorded conversation.', filled: (c, ctx) => (ctx.notes ?? []).some((n) => n.customerId === c.id) },
  { id: 'hasOpportunity', label: 'At least one opportunity', level: 'recommended', why: 'Links the account to pipeline.', filled: (c, ctx) => (ctx.opportunities ?? []).some((o) => o.customerId === c.id) },
] as const;

export const OPPORTUNITY_FIELDS: readonly FieldSpec<Opportunity>[] = [
  { id: 'opportunityName', label: 'Name', level: 'required', why: 'Should match or complement the CRM name for searchability.', filled: (o) => hasRealValue(o.opportunityName) },
  { id: 'currentStage', label: 'Stage', level: 'required', why: 'Drives pipeline reporting and time-in-stage.', filled: (o) => hasRealValue(o.currentStage) },
  { id: 'estimatedValue', label: 'Value', level: 'required', why: 'A deal with no value cannot be weighted or forecast.', filled: (o) => typeof o.estimatedValue === 'number' && o.estimatedValue > 0 },
  { id: 'expectedCloseDate', label: 'Close date', level: 'required', why: 'Without it there is no fiscal period and no forecast.', filled: (o) => hasRealValue(o.expectedCloseDate) },
  { id: 'owner', label: 'Owner', level: 'required', why: 'Who runs the deal.', filled: (o) => hasRealValue(o.owner?.name) },
  { id: 'type', label: 'Type', level: 'required', why: 'License / Renewal / Services drives how it is handled.', filled: (o) => hasRealValue(o.type) },
  { id: 'crmOpportunityUrl', label: 'CRM link', level: 'recommended', why: 'Jump to Salesforce. A scrubbed placeholder counts as missing.', filled: (o) => hasRealValue(o.crmOpportunityUrl) },
  { id: 'products', label: 'Products', level: 'recommended', why: 'What is actually being sold.', filled: (o) => hasRealValue(o.products) },
  { id: 'probability', label: 'Probability', level: 'recommended', why: 'Needed for weighted value.', filled: (o) => typeof o.probability === 'number' },
  { id: 'nextSteps', label: 'Next steps', level: 'recommended', why: 'A deal with no next step is a deal that is drifting.', filled: (o) => hasRealValue(o.nextSteps) },
  { id: 'competitorInfo', label: 'Competition', level: 'recommended', why: 'Including do-nothing and build-it-ourselves.', filled: (o) => hasRealValue(o.competitorInfo) },
  {
    id: 'meddpicc',
    label: 'MEDDPICC coverage',
    level: 'recommended',
    why: 'At least half the elements should be recorded before Propose.',
    filled: (o) => {
      const cov = qualificationCoverage(parseDealQualification(o.dealQualification));
      return cov.meddpicc.recorded >= Math.ceil(cov.meddpicc.total / 2);
    },
  },
  {
    id: 'bant',
    label: 'BANT coverage',
    level: 'recommended',
    why: 'Budget, authority, need and timeline — the basics.',
    filled: (o) => {
      const cov = qualificationCoverage(parseDealQualification(o.dealQualification));
      return cov.bant.recorded >= Math.ceil(cov.bant.total / 2);
    },
  },
  { id: 'hasTasks', label: 'Linked tasks', level: 'recommended', why: 'Tasks are how the deal actually moves forward.', filled: (o, ctx) => (ctx.tasks ?? []).some((t) => t.opportunityId === o.id) },
] as const;

export const PROFILE_FIELDS: readonly FieldSpec<CustomerProfile>[] = [
  { id: 'businessProblem', label: 'Business problem', level: 'required', why: 'The before-scenario the whole narrative rests on.', filled: (p) => hasRealValue(p.businessProblem) },
  { id: 'whyUs', label: 'Why us', level: 'required', why: 'Differentiation in the customer’s words.', filled: (p) => hasRealValue(p.whyUs) },
  { id: 'whyNow', label: 'Why now', level: 'required', why: 'The compelling event. Without it the deal slips.', filled: (p) => hasRealValue(p.whyNow) },
  { id: 'objectives', label: 'Objectives', level: 'recommended', why: 'The outcomes they are buying.', filled: (p) => hasRealValue(p.customerObjective1) },
  { id: 'useCases', label: 'Use cases', level: 'recommended', why: 'Required capabilities to get from before to after.', filled: (p) => hasRealValue(p.customerUseCase1) },
  { id: 'seInvolvement', label: 'SE involvement', level: 'recommended', why: '"No" is a coverage risk; "Not Needed" is a decision.', filled: (p) => hasRealValue(p.seInvolvement) },
  { id: 'seProductFit', label: 'SE product fit', level: 'recommended', why: 'RAG on whether we actually fit.', filled: (p) => hasRealValue(p.seProductFitAssessment) },
  { id: 'seNotes', label: 'SE notes', level: 'recommended', why: 'The technical narrative.', filled: (p) => hasRealValue(p.seNotes) },
] as const;

export const NOTE_FIELDS: readonly FieldSpec<CustomerNote>[] = [
  { id: 'notes', label: 'Note body', level: 'required', why: 'The record of what was said.', filled: (n) => hasRealValue(n.notes) },
  { id: 'noteDate', label: 'Date', level: 'required', why: 'Ordering and recency depend on it.', filled: (n) => hasRealValue(n.noteDate) },
  { id: 'seConfidence', label: 'SE confidence', level: 'recommended', why: 'Drives the at-risk view across accounts.', filled: (n) => hasRealValue(n.seConfidence) },
  { id: 'nextSteps', label: 'Next steps', level: 'recommended', why: 'A meeting with no next step rarely produces one later.', filled: (n) => hasRealValue((n.otherFields ?? {}).nextSteps) },
  { id: 'meetingType', label: 'Meeting type', level: 'recommended', why: 'Makes notes findable by kind of conversation.', filled: (n) => hasRealValue((n.otherFields ?? {}).meetingType) },
] as const;

export const TASK_FIELDS: readonly FieldSpec<EngagementTask>[] = [
  { id: 'title', label: 'Title', level: 'required', why: 'How the card reads on the board.', filled: (t) => hasRealValue(t.title) },
  { id: 'status', label: 'Status', level: 'required', why: 'Which column it belongs in.', filled: (t) => hasRealValue(t.status) },
  { id: 'dates', label: 'Planning dates', level: 'required', why: 'Without dates it never appears on the calendar or timeline.', filled: (t) => hasRealValue(t.startDate) || hasRealValue(t.endDate) || hasRealValue(t.dueDate) },
  { id: 'ownerUid', label: 'Owner', level: 'required', why: 'A task with no owner is filtered out of the workspace and becomes invisible.', filled: (t) => hasRealValue(t.ownerUid) },
  { id: 'categories', label: 'Category', level: 'recommended', why: 'Drives filtering and pillar resolution.', filled: (t) => hasRealValue(t.categoryIds) },
  { id: 'link', label: 'Account or opportunity link', level: 'recommended', why: 'Unlinked tasks never surface on the account.', filled: (t) => hasRealValue(t.customerId) || hasRealValue(t.opportunityId) },
  { id: 'description', label: 'Description', level: 'recommended', why: 'Context for whoever picks it up.', filled: (t) => hasRealValue(t.description) },
] as const;

// ---------------------------------------------------------------------------
// Rollups
// ---------------------------------------------------------------------------

export interface CompletenessSummary {
  kind: EntityKind;
  count: number;
  averageScore: number;
  /** Records missing at least one required field. */
  incomplete: number;
  /** Most common gaps, worst first. */
  topGaps: { id: string; label: string; level: CompletenessLevel; why: string; count: number }[];
}

export function summarize(kind: EntityKind, scored: EntityCompleteness[]): CompletenessSummary {
  const gapCounts = new Map<string, { field: MissingField; count: number }>();
  for (const s of scored) {
    for (const m of [...s.requiredMissing, ...s.recommendedMissing]) {
      const hit = gapCounts.get(m.id);
      if (hit) hit.count += 1;
      else gapCounts.set(m.id, { field: m, count: 1 });
    }
  }
  return {
    kind,
    count: scored.length,
    averageScore: scored.length === 0 ? 100 : Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length),
    incomplete: scored.filter((s) => s.requiredMissing.length > 0).length,
    topGaps: [...gapCounts.values()]
      .sort((a, b) => (a.field.level === b.field.level ? b.count - a.count : a.field.level === 'required' ? -1 : 1))
      .map((g) => ({ ...g.field, count: g.count })),
  };
}

export interface WorkspaceCompletenessInput {
  customers: Customer[];
  opportunities: Opportunity[];
  customerProfiles: CustomerProfile[];
  notes: CustomerNote[];
  tasks: EngagementTask[];
}

export interface WorkspaceCompleteness {
  summaries: CompletenessSummary[];
  byEntity: Record<EntityKind, EntityCompleteness[]>;
  overallScore: number;
}

/** Score every record in a workspace snapshot. Pure: no I/O, no React. */
export function workspaceCompleteness(input: WorkspaceCompletenessInput): WorkspaceCompleteness {
  const ctx: CompletenessContext = {
    profiles: input.customerProfiles,
    notes: input.notes,
    opportunities: input.opportunities,
    tasks: input.tasks,
  };

  const customers = input.customers.map((c) =>
    scoreEntity('customer', c.id, c.customerName || '(unnamed)', c, CUSTOMER_FIELDS, ctx),
  );
  const opportunities = input.opportunities.map((o) =>
    scoreEntity('opportunity', o.id, o.opportunityName || '(unnamed)', o, OPPORTUNITY_FIELDS, ctx),
  );
  const profiles = input.customerProfiles.map((p) =>
    scoreEntity('profile', p.id, `Profile ${p.customerId}`, p, PROFILE_FIELDS, ctx),
  );
  const notes = input.notes.map((n) =>
    scoreEntity('note', n.id, (n.notes || '').slice(0, 40) || '(empty)', n, NOTE_FIELDS, ctx),
  );
  const tasks = input.tasks.map((t) => scoreEntity('task', t.id, t.title || '(untitled)', t, TASK_FIELDS, ctx));

  const byEntity = { customer: customers, opportunity: opportunities, profile: profiles, note: notes, task: tasks };
  const all = [...customers, ...opportunities, ...profiles, ...notes, ...tasks];

  return {
    byEntity,
    summaries: [
      summarize('customer', customers),
      summarize('opportunity', opportunities),
      summarize('profile', profiles),
      summarize('note', notes),
      summarize('task', tasks),
    ],
    overallScore: all.length === 0 ? 100 : Math.round(all.reduce((a, s) => a + s.score, 0) / all.length),
  };
}
