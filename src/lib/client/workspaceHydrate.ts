import type {
  Customer,
  CustomerContact,
  CustomerNote,
  CustomerProfile,
  EngagementTask,
  InternalContact,
  MartechTool,
  Opportunity,
  Partner,
  Product,
  TaskCategory,
  TaskChecklistItem,
  TaskSubtask,
} from '@/types';
import { categoryIdsFromTaskFields } from '@/lib/taskCategoryIds';
import { parseTaskLinks } from '@/lib/taskLinks';

function coerceDate(raw: unknown, fallback?: Date): Date {
  if (raw instanceof Date) return raw;
  if (typeof raw === 'number' && Number.isFinite(raw)) return new Date(raw);
  if (typeof raw === 'string' && raw.trim()) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? fallback ?? new Date() : d;
  }
  return fallback ?? new Date();
}

/** Safe array from workspace JSON (API may omit or send unexpected shapes). */
function workspaceArray(payload: Record<string, unknown>, key: string): unknown[] {
  const v = payload[key];
  return Array.isArray(v) ? v : [];
}

/** Normalize checklist / subtasks from workspace JSON into typed arrays. */
function hydrateChecklistItems(raw: unknown): TaskChecklistItem[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: TaskChecklistItem[] = [];
  raw.forEach((item, i) => {
    if (!item || typeof item !== 'object') return;
    const o = item as Record<string, unknown>;
    const label = String(o.label ?? o.text ?? '').trim();
    if (!label) return;
    out.push({
      id: typeof o.id === 'string' && o.id ? o.id : `c-${i}`,
      label,
      done: Boolean(o.done ?? o.completed),
    });
  });
  return out.length ? out : undefined;
}

function hydrateSubtasks(raw: unknown): TaskSubtask[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: TaskSubtask[] = [];
  raw.forEach((item, i) => {
    if (!item || typeof item !== 'object') return;
    const o = item as Record<string, unknown>;
    const title = String(o.title ?? o.label ?? '').trim();
    if (!title) return;
    out.push({
      id: typeof o.id === 'string' && o.id ? o.id : `s-${i}`,
      title,
      done: Boolean(o.done ?? o.completed),
    });
  });
  return out.length ? out : undefined;
}

function hydrateTaskIdRefs(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out = raw.filter((x): x is string => typeof x === 'string' && x.trim() !== '');
  return out.length ? out : undefined;
}

/** Revive ISO date strings returned from GET /api/workspace into Date instances. */
export function hydrateWorkspacePayload(json: Record<string, unknown>): {
  customers: Customer[];
  notes: CustomerNote[];
  customerProfiles: CustomerProfile[];
  opportunities: Opportunity[];
  products: Product[];
  partners: Partner[];
  martechTools: MartechTool[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  tasks: EngagementTask[];
  taskCategories: TaskCategory[];
} {
  const customers = workspaceArray(json, 'customers') as Customer[];
  const notesList = workspaceArray(json, 'notes') as (CustomerNote & Record<string, unknown>)[];
  const notes = notesList.map((n: CustomerNote) => ({
    ...n,
    noteDate: coerceDate((n as { noteDate?: unknown }).noteDate),
    createdAt: coerceDate((n as { createdAt?: unknown }).createdAt),
    updatedAt: coerceDate((n as { updatedAt?: unknown }).updatedAt),
  }));

  const customerProfiles = (workspaceArray(json, 'customerProfiles') as CustomerProfile[]).map((p) => ({
    ...p,
    latestDemoDate: coerceDate((p as { latestDemoDate?: unknown }).latestDemoDate),
    seNotesLastUpdated: coerceDate((p as { seNotesLastUpdated?: unknown }).seNotesLastUpdated),
    createdAt: coerceDate((p as { createdAt?: unknown }).createdAt),
    updatedAt: coerceDate((p as { updatedAt?: unknown }).updatedAt),
  }));

  const opportunities = (workspaceArray(json, 'opportunities') as Opportunity[]).map((o) => ({
    ...o,
    createdAt: coerceDate(o.createdAt),
    updatedAt: coerceDate(o.updatedAt),
    expectedCloseDate:
      (o as { expectedCloseDate?: unknown }).expectedCloseDate != null
        ? coerceDate((o as { expectedCloseDate?: unknown }).expectedCloseDate)
        : undefined,
    actualCloseDate:
      (o as { actualCloseDate?: unknown }).actualCloseDate != null
        ? coerceDate((o as { actualCloseDate?: unknown }).actualCloseDate)
        : undefined,
    stageHistory:
      ((o as { stageHistory?: { changedAt?: unknown }[] }).stageHistory || []).map((e) => ({
        ...e,
        changedAt: coerceDate(e.changedAt),
      })) ?? [],
  })) as Opportunity[];

  const products = workspaceArray(json, 'products') as Product[];
  const partners = workspaceArray(json, 'partners') as Partner[];

  const martechTools = (workspaceArray(json, 'martechTools') as MartechTool[]).map((m) => ({
    ...m,
    ...(('createdAt' in m && (m as { createdAt?: unknown }).createdAt) || ('updatedAt' in m && (m as { updatedAt?: unknown }).updatedAt)
      ? {
          createdAt:
            ('createdAt' in m ? coerceDate((m as { createdAt?: unknown }).createdAt) : undefined) ?? undefined,
          updatedAt:
            ('updatedAt' in m ? coerceDate((m as { updatedAt?: unknown }).updatedAt) : undefined) ?? undefined,
        }
      : {}),
  })) as MartechTool[];

  const customerContacts = workspaceArray(json, 'customerContacts') as CustomerContact[];
  const internalContacts = workspaceArray(json, 'internalContacts') as InternalContact[];

  const tasks = (workspaceArray(json, 'tasks') as EngagementTask[]).map((t) => {
    const wire = t as EngagementTask & { categoryId?: string };
    const { categoryId: _discardCatId, ...base } = wire;
    void _discardCatId;
    const checklist = hydrateChecklistItems((base as { checklist?: unknown }).checklist);
    const subtasks = hydrateSubtasks((base as { subtasks?: unknown }).subtasks);
    const links = parseTaskLinks((base as { links?: unknown }).links);
    const customerContactIds = hydrateTaskIdRefs((base as { customerContactIds?: unknown }).customerContactIds);
    const internalContactIds = hydrateTaskIdRefs((base as { internalContactIds?: unknown }).internalContactIds);
    const categoryIds = categoryIdsFromTaskFields(base as { categoryIds?: unknown; categoryId?: unknown });
    return {
      ...base,
      categoryIds,
      startDate:
        (base as { startDate?: unknown }).startDate != null
          ? (coerceDate((base as { startDate?: unknown }).startDate) as Date | null)
          : null,
      endDate:
        (base as { endDate?: unknown }).endDate != null
          ? (coerceDate((base as { endDate?: unknown }).endDate) as Date | null)
          : null,
      dueDate:
        ((base as { dueDate?: unknown }).dueDate != null
          ? coerceDate((base as { dueDate?: unknown }).dueDate)
          : null) as Date | null,
      ...(checklist ? { checklist } : {}),
      ...(subtasks ? { subtasks } : {}),
      ...(customerContactIds?.length ? { customerContactIds } : {}),
      ...(internalContactIds?.length ? { internalContactIds } : {}),
      ...(links?.length ? { links } : {}),
      lastActionedAt: coerceDate(base.lastActionedAt),
      createdAt: coerceDate(base.createdAt),
      updatedAt: coerceDate(base.updatedAt),
    };
  });

  const taskCategories = (workspaceArray(json, 'taskCategories') as TaskCategory[]).map((c) => ({
    ...c,
    createdAt: coerceDate(c.createdAt),
    updatedAt: coerceDate(c.updatedAt),
  }));

  const enrichedCustomers = customers.map((c) => ({
    ...c,
    createdAt: coerceDate((c as { createdAt?: unknown }).createdAt),
    updatedAt: coerceDate((c as { updatedAt?: unknown }).updatedAt),
    products: c.products ?? [],
    customerContacts: c.customerContacts ?? [],
    internalContacts: c.internalContacts ?? [],
    partners: c.partners ?? [],
    martechTools: c.martechTools ?? [],
  }));

  return {
    customers: enrichedCustomers as Customer[],
    notes,
    customerProfiles,
    opportunities,
    products,
    partners,
    martechTools,
    customerContacts,
    internalContacts,
    tasks,
    taskCategories,
  };
}
