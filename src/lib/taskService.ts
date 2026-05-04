import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { EngagementTask, CreateEngagementTaskData, TaskKanbanStatus } from '@/types/task';
import { categoryIdsFromTaskFields } from '@/lib/taskCategoryIds';
import { parseTaskLinks, taskLinksFirestorePayload } from '@/lib/taskLinks';

const COLLECTION = 'engagementTasks';

const STATUSES: TaskKanbanStatus[] = ['todo', 'in_progress', 'done', 'cancelled'];

function parseChecklistLocal(raw: unknown): import('@/types/task').TaskChecklistItem[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: import('@/types/task').TaskChecklistItem[] = [];
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

function parseSubtasksLocal(raw: unknown): import('@/types/task').TaskSubtask[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: import('@/types/task').TaskSubtask[] = [];
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

function parseIdArrayLocal(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out = raw.filter((x: unknown): x is string => typeof x === 'string' && x !== '');
  return out.length ? out : undefined;
}

function tsDate(v: unknown): Date | null {
  if (!v) return null;
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return null;
}

function fromDoc(id: string, data: Record<string, unknown>): EngagementTask {
  const rawIds = data.productIds;
  const productIds = Array.isArray(rawIds)
    ? rawIds.filter((x): x is string => typeof x === 'string')
    : undefined;
  return {
    id,
    title: String(data.title ?? ''),
    description: data.description ? String(data.description) : undefined,
    categoryIds: categoryIdsFromTaskFields(data),
    opportunityId: data.opportunityId != null && data.opportunityId !== '' ? String(data.opportunityId) : null,
    customerId: data.customerId != null && data.customerId !== '' ? String(data.customerId) : null,
    ...(productIds?.length ? { productIds } : {}),
    ...(data.ownerUid != null && data.ownerUid !== '' ? { ownerUid: String(data.ownerUid) } : {}),
    status: STATUSES.includes(data.status as TaskKanbanStatus)
      ? (data.status as TaskKanbanStatus)
      : 'todo',
    order: typeof data.order === 'number' ? data.order : 0,
    startDate: tsDate(data.startDate),
    endDate: tsDate(data.endDate),
    dueDate: tsDate(data.dueDate),
    checklist: parseChecklistLocal(data.checklist),
    subtasks: parseSubtasksLocal(data.subtasks),
    ...(() => {
      const links = parseTaskLinks(data.links);
      return links?.length ? { links } : {};
    })(),
    ...(() => {
      const cc = parseIdArrayLocal(data.customerContactIds);
      const ic = parseIdArrayLocal(data.internalContactIds);
      return {
        ...(cc?.length ? { customerContactIds: cc } : {}),
        ...(ic?.length ? { internalContactIds: ic } : {}),
      };
    })(),
    lastActionedAt: data.lastActionedAt
      ? (data.lastActionedAt as Timestamp).toDate()
      : new Date(),
    createdBy: String(data.createdBy ?? ''),
    updatedBy: String(data.updatedBy ?? ''),
    createdAt: (data.createdAt as Timestamp | undefined)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp | undefined)?.toDate?.() ?? new Date(),
  };
}

function taskToFirestore(t: EngagementTask): Record<string, unknown> {
  return {
    title: t.title,
    description: t.description ?? '',
    categoryIds: t.categoryIds ?? [],
    categoryId: t.categoryIds?.[0] ?? '',
    opportunityId: t.opportunityId ?? null,
    customerId: t.customerId ?? null,
    productIds: t.productIds?.length ? t.productIds : [],
    status: t.status,
    order: t.order,
    startDate: t.startDate ? Timestamp.fromDate(new Date(t.startDate)) : null,
    endDate: t.endDate ? Timestamp.fromDate(new Date(t.endDate)) : null,
    dueDate: t.dueDate ? Timestamp.fromDate(new Date(t.dueDate)) : null,
    checklist: (t.checklist ?? []).map((c) => ({ id: c.id, label: c.label, done: c.done })),
    subtasks: (t.subtasks ?? []).map((s) => ({ id: s.id, title: s.title, done: s.done })),
    links: taskLinksFirestorePayload(t.links),
    customerContactIds: t.customerContactIds?.length ? t.customerContactIds : [],
    internalContactIds: t.internalContactIds?.length ? t.internalContactIds : [],
    lastActionedAt: Timestamp.fromDate(new Date(t.lastActionedAt)),
    createdBy: t.createdBy,
    updatedBy: t.updatedBy,
    createdAt: Timestamp.fromDate(new Date(t.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(t.updatedAt)),
    ownerUid: t.ownerUid ?? null,
  };
}

export const taskService = {
  async getAll(): Promise<EngagementTask[]> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>));
      list.sort((a, b) => {
        const st = (s: EngagementTask) =>
          s.status === 'todo'
            ? 0
            : s.status === 'in_progress'
              ? 1
              : s.status === 'done'
                ? 2
                : 3;
        if (st(a) !== st(b)) return st(a) - st(b);
        return a.order - b.order;
      });
      return list;
    } catch (e) {
      console.error('taskService.getAll', e);
      return [];
    }
  },

  async create(data: CreateEngagementTaskData): Promise<EngagementTask> {
    const now = new Date();
    const status = data.status;
    const all = await getDocs(collection(db, COLLECTION));
    const tasks = all.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>));
    const inStatus = tasks.filter((t) => t.status === status);
    const order = data.order ?? (inStatus.length ? Math.max(0, ...inStatus.map((t) => t.order)) + 1 : 0);

    const categoryIds = categoryIdsFromTaskFields(data);
    const task: EngagementTask = {
      id: '',
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      categoryIds,
      opportunityId: data.opportunityId ?? null,
      customerId: data.customerId ?? null,
      productIds: data.productIds?.length ? [...data.productIds] : undefined,
      status,
      order,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      dueDate: data.dueDate ?? null,
      checklist: data.checklist?.length ? [...data.checklist] : undefined,
      subtasks: data.subtasks?.length ? [...data.subtasks] : undefined,
      links: data.links?.length ? [...data.links] : undefined,
      customerContactIds: data.customerContactIds?.length ? [...data.customerContactIds] : undefined,
      internalContactIds: data.internalContactIds?.length ? [...data.internalContactIds] : undefined,
      lastActionedAt: now,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      createdAt: now,
      updatedAt: now,
    };

    const docData = taskToFirestore({ ...task, id: 'temp' });
    const ref = await addDoc(collection(db, COLLECTION), docData);
    return { ...task, id: ref.id };
  },

  async update(task: EngagementTask): Promise<void> {
    await updateDoc(doc(db, COLLECTION, task.id), taskToFirestore(task));
  },

  async updateBatch(tasks: EngagementTask[]): Promise<void> {
    if (tasks.length === 0) return;
    const batch = writeBatch(db);
    tasks.forEach((t) => batch.update(doc(db, COLLECTION, t.id), taskToFirestore(t)));
    await batch.commit();
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
