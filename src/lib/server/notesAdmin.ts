import 'server-only';
import type { DocumentData } from 'firebase-admin/firestore';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import { toDate, tsFrom, stripUndefined } from '@/lib/server/adminConvert';
import type {
  CustomerNote,
  CreateCustomerNoteData,
  UpdateCustomerNoteData,
} from '@/types';

/**
 * Admin-SDK customer notes. Mirrors `src/lib/customerNotes.ts`, which uses the
 * Firebase **web** SDK and therefore cannot be called from a route handler:
 * there is no signed-in user server-side, so `firestore.rules` denies it.
 */

const COLLECTION = 'customerNotes';

function toNote(id: string, data: DocumentData): CustomerNote {
  return {
    ...data,
    id,
    noteDate: toDate(data.noteDate),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as CustomerNote;
}

export async function getAllNotesAdmin(): Promise<CustomerNote[]> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).get();
  const notes = snap.docs.map((d) => toNote(d.id, d.data()));
  // Sorted in memory rather than via orderBy so notes missing `createdAt`
  // are still returned instead of being dropped by the index.
  notes.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  return notes;
}

export async function getNotesByCustomerAdmin(customerId: string): Promise<CustomerNote[]> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).where('customerId', '==', customerId).get();
  const notes = snap.docs.map((d) => toNote(d.id, d.data()));
  notes.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  return notes;
}

export async function createNoteAdmin(
  data: CreateCustomerNoteData,
  userId: string,
): Promise<string> {
  const db = requireAdminFirestore();
  const now = new Date();
  const ref = await db.collection(COLLECTION).add(
    stripUndefined({
      ...data,
      noteDate: tsFrom(data.noteDate),
      createdBy: userId,
      updatedBy: userId,
      createdAt: tsFrom(now),
      updatedAt: tsFrom(now),
    }),
  );
  return ref.id;
}

export async function updateNoteAdmin(
  data: UpdateCustomerNoteData,
  userId: string,
): Promise<void> {
  const db = requireAdminFirestore();
  const { id, ...updateData } = data;
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error(
      `Cannot update note: Document with id "${id}" does not exist. It may have been deleted.`,
    );
  }
  const payload: Record<string, unknown> = {
    ...updateData,
    updatedBy: userId,
    updatedAt: tsFrom(new Date()),
  };
  if (updateData.noteDate) payload.noteDate = tsFrom(updateData.noteDate);
  await ref.update(stripUndefined(payload));
}

export async function deleteNoteAdmin(noteId: string): Promise<void> {
  const db = requireAdminFirestore();
  await db.collection(COLLECTION).doc(noteId).delete();
}

/** True when the note exists — lets callers fall back to create on a stale id. */
export async function noteExistsAdmin(noteId: string): Promise<boolean> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).doc(noteId).get();
  return snap.exists;
}
