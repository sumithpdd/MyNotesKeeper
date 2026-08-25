import { Timestamp } from 'firebase-admin/firestore';
import type { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';
import type {
  CreateEngagementTaskData,
  EngagementTask,
  TaskKanbanStatus,
  TaskChecklistItem,
  TaskSubtask,
  TaskCategory,
} from '@/types/task';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import { categoryIdsFromTaskFields, type TaskCategoryPayload } from '@/lib/taskCategoryIds';
import { parseTaskLinks, taskLinksFirestorePayload } from '@/lib/taskLinks';

const COLLECTION = 'engagementTasks';
const STATUSES: TaskKanbanStatus[] = ['todo', 'in_progress', 'done', 'cancelled'];

function parseChecklist(raw: unknown): TaskChecklistItem[] | undefined {
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

function parseSubtasks(raw: unknown): TaskSubtask[] | undefined {
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

function parseIdArray(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out = raw.filter((x: unknown): x is string => typeof x === 'string' && x !== '');
  return out.length ? out : undefined;
}

function toDt(v: unknown): Date {
  if (!v) return new Date();
  if (v instanceof Date) return v;
  if (typeof v === 'object' && v !== null && 'toDate' in v && typeof (v as { toDate: () => Date }).toDate === 'function') {
    return (v as { toDate: () => Date }).toDate();
  }
  return new Date();
}

/** Parse Firestore engagement task document — shared with workspace load. */
export function engagementTaskFromDoc(id: string, data: DocumentData): EngagementTask {
  const rawIds = data.productIds;
  const productIds = Array.isArray(rawIds)
    ? rawIds.filter((x: unknown): x is string => typeof x === 'string')
    : undefined;
  const customerContactIds = parseIdArray(data.customerContactIds);
  const internalContactIds = parseIdArray(data.internalContactIds);
  const categoryIds = categoryIdsFromTaskFields(data);
  const linksParsed = parseTaskLinks(data.links);
  return {
    id,
    title: String(data.title ?? ''),
    description: data.description ? String(data.description) : undefined,
    categoryIds,
    opportunityId:
      data.opportunityId != null && data.opportunityId !== '' ? String(data.opportunityId) : null,
    customerId: data.customerId != null && data.customerId !== '' ? String(data.customerId) : null,
    ...(productIds?.length ? { productIds } : {}),
    ...(customerContactIds?.length ? { customerContactIds } : {}),
    ...(internalContactIds?.length ? { internalContactIds } : {}),
    ...(data.ownerUid != null && data.ownerUid !== '' ? { ownerUid: String(data.ownerUid) } : {}),
    status: STATUSES.includes(data.status as TaskKanbanStatus) ? (data.status as TaskKanbanStatus) : 'todo',
    order: typeof data.order === 'number' ? data.order : 0,
    startDate: data.startDate ? toDt(data.startDate) : null,
    endDate: data.endDate ? toDt(data.endDate) : null,
    dueDate: data.dueDate ? toDt(data.dueDate) : null,
    checklist: parseChecklist(data.checklist),
    subtasks: parseSubtasks(data.subtasks),
    ...(linksParsed?.length ? { links: linksParsed } : {}),
    ...(data.planningPillar != null && data.planningPillar !== ''
      ? { planningPillar: String(data.planningPillar) as EngagementTask['planningPillar'] }
      : {}),
    lastActionedAt: toDt(data.lastActionedAt),
    createdBy: String(data.createdBy ?? ''),
    updatedBy: String(data.updatedBy ?? ''),
    createdAt: toDt(data.createdAt),
    updatedAt: toDt(data.updatedAt),
  };
}

export function engagementTaskOwnedByToken(snap: DocumentSnapshot, uid: string, email: string | null): boolean {
  const d = snap.data();
  if (!d) return false;
  const ownerUid = d.ownerUid as string | undefined;
  if (ownerUid) return ownerUid === uid;
  const createdBy = String(d.createdBy ?? '');
  if (email && createdBy === email) return true;
  return createdBy === uid;
}

async function assertTaskWritable(taskId: string, uid: string, email: string | null): Promise<void> {
  const db = requireAdminFirestore();
  const ref = db.collection(COLLECTION).doc(taskId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Task not found');
  if (!engagementTaskOwnedByToken(snap, uid, email)) throw new Error('Forbidden');
}

function taskToFirestore(t: EngagementTask): Record<string, unknown> {
  const checklist = (t.checklist ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    done: c.done,
  }));
  const subtasks = (t.subtasks ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    done: s.done,
  }));
  return {
    title: t.title,
    description: t.description ?? '',
    categoryIds: t.categoryIds ?? [],
    categoryId: t.categoryIds?.[0] ?? '',
    opportunityId: t.opportunityId ?? null,
    customerId: t.customerId ?? null,
    productIds: t.productIds?.length ? t.productIds : [],
    customerContactIds: t.customerContactIds?.length ? t.customerContactIds : [],
    internalContactIds: t.internalContactIds?.length ? t.internalContactIds : [],
    status: t.status,
    order: t.order,
    startDate: t.startDate ? Timestamp.fromDate(new Date(t.startDate)) : null,
    endDate: t.endDate ? Timestamp.fromDate(new Date(t.endDate)) : null,
    dueDate: t.dueDate ? Timestamp.fromDate(new Date(t.dueDate)) : null,
    checklist,
    subtasks,
    links: taskLinksFirestorePayload(t.links),
    planningPillar: t.planningPillar ?? null,
    lastActionedAt: Timestamp.fromDate(new Date(t.lastActionedAt)),
    createdBy: t.createdBy,
    updatedBy: t.updatedBy,
    createdAt: Timestamp.fromDate(new Date(t.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(t.updatedAt)),
    ownerUid: t.ownerUid ?? null,
  };
}

export async function createEngagementTaskAdmin(
  data: CreateEngagementTaskData & { categoryId?: string },
  ownerUid: string,
): Promise<EngagementTask> {
  const db = requireAdminFirestore();
  const now = new Date();
  const status = data.status;
  const categoryIds = categoryIdsFromTaskFields(data);
  if (categoryIds.length === 0) {
    throw new Error('At least one category is required');
  }
  const all = await db.collection(COLLECTION).get();
  const tasks = all.docs.map((d) => engagementTaskFromDoc(d.id, d.data()));
  const inStatus = tasks.filter((t) => t.status === status);
  const order = data.order ?? (inStatus.length ? Math.max(0, ...inStatus.map((t) => t.order)) + 1 : 0);

  const task: EngagementTask = {
    id: '',
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    categoryIds,
    opportunityId: data.opportunityId ?? null,
    customerId: data.customerId ?? null,
    productIds: data.productIds?.length ? [...data.productIds] : undefined,
    customerContactIds: data.customerContactIds?.length ? [...data.customerContactIds] : undefined,
    internalContactIds: data.internalContactIds?.length ? [...data.internalContactIds] : undefined,
    ownerUid,
    status,
    order,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    dueDate: data.dueDate ?? null,
    checklist: data.checklist?.length ? [...data.checklist] : undefined,
    subtasks: data.subtasks?.length ? [...data.subtasks] : undefined,
    links: data.links?.length ? [...data.links] : undefined,
    planningPillar: data.planningPillar ?? null,
    lastActionedAt: now,
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    createdAt: now,
    updatedAt: now,
  };

  const docData = { ...taskToFirestore({ ...task, id: 'temp' }), ownerUid };
  const ref = await db.collection(COLLECTION).add(docData);
  return { ...task, id: ref.id };
}

export async function updateEngagementTaskAdmin(task: EngagementTask, uid: string, email: string | null) {
  await assertTaskWritable(task.id, uid, email);
  const db = requireAdminFirestore();
  await db.collection(COLLECTION).doc(task.id).update(taskToFirestore(task));
}

export async function updateEngagementTasksBatchAdmin(
  tasks: EngagementTask[],
  uid: string,
  email: string | null,
) {
  if (tasks.length === 0) return;
  const db = requireAdminFirestore();
  const batch = db.batch();
  for (const t of tasks) {
    await assertTaskWritable(t.id, uid, email);
    batch.update(db.collection(COLLECTION).doc(t.id), taskToFirestore(t) as Record<string, unknown>);
  }
  await batch.commit();
}

export async function deleteEngagementTaskAdmin(id: string, uid: string, email: string | null) {
  await assertTaskWritable(id, uid, email);
  const db = requireAdminFirestore();
  await db.collection(COLLECTION).doc(id).delete();
}

const TASK_CAT_COLLECTION = 'taskCategories';

function taskCategoryFromDoc(id: string, data: DocumentData): TaskCategory {
  return {
    id,
    name: String(data.name ?? ''),
    color: data.color ? String(data.color) : undefined,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    createdAt: toDt(data.createdAt),
    updatedAt: toDt(data.updatedAt),
  };
}

/** Next category IDs + singular denormalization after remap; null if unchanged. */
function remapStoredCategoryAssignments(
  data: DocumentData,
  fromId: string,
  toId: string,
): { categoryIds: string[]; categoryId: string } | null {
  const ids = categoryIdsFromTaskFields(data as TaskCategoryPayload);
  if (!ids.includes(fromId)) return null;
  const next = [...new Set(ids.map((x) => (x === fromId ? toId : x)))];
  return { categoryIds: next, categoryId: next[0] ?? '' };
}

function taskUsesCategory(data: DocumentData, categoryId: string): boolean {
  return categoryIdsFromTaskFields(data as TaskCategoryPayload).includes(categoryId);
}

export async function createTaskCategoryAdmin(data: {
  name: string;
  color?: string;
  sortOrder?: number;
}): Promise<TaskCategory> {
  const db = requireAdminFirestore();
  const snap = await db.collection(TASK_CAT_COLLECTION).orderBy('sortOrder', 'desc').limit(1).get();
  const maxOrder = snap.docs[0]?.data()?.sortOrder ?? -1;
  const sortOrder = data.sortOrder ?? maxOrder + 1;
  const now = Timestamp.now();
  const ref = await db.collection(TASK_CAT_COLLECTION).add({
    name: data.name.trim(),
    color: data.color || 'bg-gray-100 text-gray-800',
    sortOrder,
    createdAt: now,
    updatedAt: now,
  });
  const created = await ref.get();
  if (!created.exists) throw new Error('Failed to read created category');
  return taskCategoryFromDoc(ref.id, created.data()!);
}

export async function updateTaskCategoryAdmin(
  id: string,
  patch: { name?: string; color?: string },
): Promise<TaskCategory> {
  const db = requireAdminFirestore();
  const ref = db.collection(TASK_CAT_COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Category not found');
  const updates: Record<string, unknown> = { updatedAt: Timestamp.now() };
  if (patch.name !== undefined) {
    const n = patch.name.trim();
    if (!n) throw new Error('name cannot be empty');
    updates.name = n;
  }
  if (patch.color !== undefined) updates.color = patch.color || 'bg-gray-100 text-gray-800';
  if (Object.keys(updates).length === 1) {
    throw new Error('No updates');
  }
  await ref.update(updates);
  const next = await ref.get();
  return taskCategoryFromDoc(id, next.data()!);
}

const FIRESTORE_BATCH_OPS = 400;

export async function deleteTaskCategoryAdmin(
  id: string,
  opts: { mergeIntoCategoryId?: string },
  actorEmailOrUid: string,
): Promise<void> {
  const db = requireAdminFirestore();
  const catRef = db.collection(TASK_CAT_COLLECTION).doc(id);
  const catSnap = await catRef.get();
  if (!catSnap.exists) throw new Error('Category not found');

  const merged = new Map<string, DocumentData>();
  const [byArraySnap, bySingleSnap] = await Promise.all([
    db.collection(COLLECTION).where('categoryIds', 'array-contains', id).get(),
    db.collection(COLLECTION).where('categoryId', '==', id).get(),
  ]);
  for (const d of byArraySnap.docs) {
    const payload = d.data();
    if (payload) merged.set(d.id, payload);
  }
  for (const d of bySingleSnap.docs) {
    const payload = d.data();
    if (payload) merged.set(d.id, payload);
  }

  const touching = [...merged.entries()].filter(([, data]) => taskUsesCategory(data, id));
  const needsMerge = touching.length > 0;

  if (needsMerge) {
    const into = opts.mergeIntoCategoryId?.trim();
    if (!into) throw new Error('mergeIntoCategoryId required when tasks use this category');
    if (into === id) throw new Error('Cannot merge category into itself');
    const tgt = await db.collection(TASK_CAT_COLLECTION).doc(into).get();
    if (!tgt.exists) throw new Error('Merge target category not found');

    let batch = db.batch();
    let ops = 0;

    async function flush() {
      if (ops === 0) return;
      await batch.commit();
      batch = db.batch();
      ops = 0;
    }

    for (const [taskId, data] of touching) {
      const remapped = remapStoredCategoryAssignments(data, id, into);
      if (!remapped) continue;
      if (ops >= FIRESTORE_BATCH_OPS) await flush();
      batch.update(db.collection(COLLECTION).doc(taskId), {
        ...remapped,
        updatedAt: Timestamp.now(),
        lastActionedAt: Timestamp.now(),
        updatedBy: actorEmailOrUid,
      });
      ops += 1;
    }
    await flush();
  } else if (opts.mergeIntoCategoryId) {
    const into = opts.mergeIntoCategoryId.trim();
    const tgt = await db.collection(TASK_CAT_COLLECTION).doc(into).get();
    if (into !== id && !tgt.exists) throw new Error('Merge target category not found');
  }

  await catRef.delete();
}
