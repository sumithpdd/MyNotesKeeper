/**
 * Legacy Firestore **client** helpers for `taskCategories`. Hub UI must use `/api/task-categories`
 * with `hubAuthFetch` / `hubAuthJson`; keep this module for one-off scripts only if needed.
 */
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
import type { TaskCategory } from '@/types';

const COLLECTION = 'taskCategories';

const DEFAULT_CATEGORIES: { name: string; color: string }[] = [
  { name: 'Create a demo', color: 'bg-violet-100 text-violet-800' },
  { name: 'Support AE', color: 'bg-blue-100 text-blue-800' },
  { name: 'Update presentation', color: 'bg-amber-100 text-amber-800' },
  { name: 'Generic call', color: 'bg-slate-100 text-slate-800' },
];

function fromDoc(id: string, data: Record<string, unknown>): TaskCategory {
  return {
    id,
    name: String(data.name ?? ''),
    color: data.color ? String(data.color) : undefined,
    sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  };
}

export const taskCategoryService = {
  async getAll(): Promise<TaskCategory[]> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('sortOrder', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => fromDoc(d.id, d.data() as Record<string, unknown>));
    } catch (e) {
      console.error('taskCategoryService.getAll', e);
      return [];
    }
  },

  async seedIfEmpty(): Promise<void> {
    const existing = await this.getAll();
    if (existing.length > 0) return;
    const batch = writeBatch(db);
    const now = Timestamp.now();
    DEFAULT_CATEGORIES.forEach((c, i) => {
      const ref = doc(collection(db, COLLECTION));
      batch.set(ref, {
        name: c.name,
        color: c.color,
        sortOrder: i,
        createdAt: now,
        updatedAt: now,
      });
    });
    await batch.commit();
  },

  async create(data: { name: string; color?: string }): Promise<TaskCategory> {
    const now = new Date();
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy('sortOrder', 'desc')));
    const maxOrder = snap.docs[0]?.data()?.sortOrder ?? -1;
    const ref = await addDoc(collection(db, COLLECTION), {
      name: data.name.trim(),
      color: data.color || 'bg-gray-100 text-gray-800',
      sortOrder: maxOrder + 1,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    return {
      id: ref.id,
      name: data.name.trim(),
      color: data.color,
      sortOrder: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    };
  },

  async update(id: string, data: Partial<Pick<TaskCategory, 'name' | 'color' | 'sortOrder'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
