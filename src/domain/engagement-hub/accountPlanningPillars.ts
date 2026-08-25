import type { EngagementTask, TaskCategory } from '@/types/task';
import type { AccountPlanningPlan } from '@/types/customer';

/** Four pillars of SC account planning (post-whitespace / Vee work). */
export type AccountPlanningPillarId =
  | 'whitespace'
  | 'multi_threading'
  | 'migration'
  | 'research';

export interface AccountPlanningPillarDefinition {
  id: AccountPlanningPillarId;
  label: string;
  shortLabel: string;
  color: string;
  /** Task category name in Hub — kept in sync with workspaceLoad seed. */
  taskCategoryName: string;
  summary: string;
  guidance: string[];
  activityOptions?: string[];
}

export const ACCOUNT_PLANNING_PILLARS: AccountPlanningPillarDefinition[] = [
  {
    id: 'whitespace',
    label: 'Whitespace activity',
    shortLabel: 'Whitespace',
    color: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    taskCategoryName: 'Whitespace Activity',
    summary:
      'After Vee completes whitespace analysis, align with your AE on the approach for each account.',
    guidance: [
      'Create a customer-specific industry and use-case approach — be opinionated, a thought leader.',
      'Lunch & Learn — cover multiple accounts across AEs for the same solution (generic snippets).',
      'Webinar — solution, use case / pain point, or vertical focused.',
    ],
    activityOptions: ['Customer-specific approach', 'Lunch & Learn', 'Webinar'],
  },
  {
    id: 'multi_threading',
    label: 'Multi-threading',
    shortLabel: 'Multi-thread',
    color: 'bg-blue-100 text-blue-900 border-blue-200',
    taskCategoryName: 'Multi-threading',
    summary:
      'Build rapport with additional stakeholders — Head of Digital, IT, Marketing, etc.',
    guidance: [
      'Customer drop-ins — 30-minute calls on current processes: what works, what does not, current pain.',
      'Can drive knowledge workshops, mini demos (1–2 use cases), or open conversation.',
    ],
    activityOptions: ['Customer drop-in', 'Knowledge workshop', 'Mini demo', 'Open conversation'],
  },
  {
    id: 'migration',
    label: 'Migration',
    shortLabel: 'Migration',
    color: 'bg-amber-100 text-amber-900 border-amber-200',
    taskCategoryName: 'Migration Planning',
    summary: 'xM and xP customers only — headless and Sitecore AI (SAI) pathways.',
    guidance: [
      'Migration to headless.',
      'Migration to SAI — define pathway; partner-led, direct, or both?',
    ],
    activityOptions: ['Headless pathway', 'SAI pathway', 'Partner motion', 'Direct motion'],
  },
  {
    id: 'research',
    label: 'Deeper customer research',
    shortLabel: 'Research',
    color: 'bg-rose-100 text-rose-900 border-rose-200',
    taskCategoryName: 'Customer Research',
    summary: 'Vertical and industry trends that shape the account narrative.',
    guidance: [
      'New legislation affecting the vertical.',
      'Changes due to AI.',
      'Economic drivers.',
      'Disruptive challengers and/or market pressure.',
    ],
    activityOptions: ['Legislation', 'AI trends', 'Economic drivers', 'Market disruptors'],
  },
];

export const ACCOUNT_PLANNING_TASK_CATEGORY_SEED = ACCOUNT_PLANNING_PILLARS.map((p) => ({
  name: p.taskCategoryName,
  color: p.color.split(' ').slice(0, 2).join(' '),
}));

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

export function pillarById(id: AccountPlanningPillarId): AccountPlanningPillarDefinition {
  return ACCOUNT_PLANNING_PILLARS.find((p) => p.id === id) ?? ACCOUNT_PLANNING_PILLARS[0];
}

export function parseAccountPlanning(raw: unknown): AccountPlanningPlan | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  return raw as AccountPlanningPlan;
}

/** Resolve pillar from explicit task tag or matching category name. */
export function resolveTaskPlanningPillar(
  task: EngagementTask,
  categories: TaskCategory[],
): AccountPlanningPillarId | null {
  const tagged = task.planningPillar;
  if (tagged && ACCOUNT_PLANNING_PILLARS.some((p) => p.id === tagged)) return tagged;

  const catNames = (task.categoryIds ?? [])
    .map((id) => categories.find((c) => c.id === id)?.name ?? '')
    .filter(Boolean);

  for (const pillar of ACCOUNT_PLANNING_PILLARS) {
    const want = norm(pillar.taskCategoryName);
    if (catNames.some((n) => norm(n) === want || norm(n).includes(want))) {
      return pillar.id;
    }
  }
  return null;
}

export function filterTasksByPlanningPillar(
  tasks: EngagementTask[],
  categories: TaskCategory[],
  pillarId: AccountPlanningPillarId | '',
): EngagementTask[] {
  if (!pillarId) return tasks;
  return tasks.filter((t) => resolveTaskPlanningPillar(t, categories) === pillarId);
}

export function resolveCategoryIdForPillar(
  categories: TaskCategory[],
  pillarId: AccountPlanningPillarId,
): string | undefined {
  const def = pillarById(pillarId);
  const want = norm(def.taskCategoryName);
  const hit = categories.find((c) => norm(c.name) === want);
  return hit?.id;
}

export function defaultTaskTitleForPillar(
  customerName: string,
  pillarId: AccountPlanningPillarId,
): string {
  const label = pillarById(pillarId).shortLabel;
  return `${customerName} — ${label} planning`;
}

export function emptyAccountPlanningPlan(): AccountPlanningPlan {
  return {
    aeAlignment:
      'Work with your AE after Vee completes whitespace analysis to plan the approach for this account.',
    whitespace: { approach: '', status: '', nextActions: '' },
    multiThreading: { approach: '', targetStakeholders: '', nextActions: '' },
    migration: {
      approach: '',
      eligible: false,
      headlessPath: '',
      saiPath: '',
      partnerStrategy: '',
      nextActions: '',
    },
    research: { approach: '', vertical: '', topics: '', nextActions: '' },
  };
}
