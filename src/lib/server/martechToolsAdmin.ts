import { Timestamp } from 'firebase-admin/firestore';
import type { DocumentData } from 'firebase-admin/firestore';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import type { MartechTool } from '@/types';

const COLLECTION = 'martechTools';

function toTool(id: string, data: DocumentData): MartechTool {
  return {
    id,
    name: String(data.name ?? ''),
    purpose: typeof data.purpose === 'string' ? data.purpose : '',
  };
}

export async function createMartechToolAdmin(input: Omit<MartechTool, 'id'>): Promise<MartechTool> {
  const db = requireAdminFirestore();
  const now = Timestamp.now();
  const name = input.name.trim();
  if (!name) throw new Error('name required');
  const purpose = typeof input.purpose === 'string' ? input.purpose.trim() : '';
  const ref = await db.collection(COLLECTION).add({
    name,
    purpose,
    createdAt: now,
    updatedAt: now,
  });
  return { id: ref.id, name, purpose };
}

function dropUndefined<T extends Record<string, unknown>>(o: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
}

export async function updateMartechToolAdmin(
  id: string,
  updates: Partial<Omit<MartechTool, 'id'>>,
): Promise<void> {
  const db = requireAdminFirestore();
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Martech tool not found');

  const patch: Record<string, unknown> = {};
  if (updates.name !== undefined) {
    const n = String(updates.name).trim();
    if (!n) throw new Error('name cannot be empty');
    patch.name = n;
  }
  if (updates.purpose !== undefined) patch.purpose = String(updates.purpose ?? '').trim();

  const hasFieldPatch = patch.name !== undefined || patch.purpose !== undefined;
  if (!hasFieldPatch) return;

  patch.updatedAt = Timestamp.now();
  await ref.update(dropUndefined(patch));
}

export async function deleteMartechToolAdmin(id: string): Promise<void> {
  const db = requireAdminFirestore();
  await db.collection(COLLECTION).doc(id).delete();
}

export async function listMartechToolsAdmin(): Promise<MartechTool[]> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).orderBy('name').get();
  return snap.docs.map((d) => toTool(d.id, d.data()));
}
