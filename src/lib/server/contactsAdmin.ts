import 'server-only';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import { tsFrom, stripUndefined } from '@/lib/server/adminConvert';
import type { CustomerContact, InternalContact } from '@/types';

/**
 * Admin-SDK contact catalogues. Mirrors `src/lib/contactService.ts`, which uses
 * the Firebase **web** SDK and so is denied when called from a route handler.
 */

const CUSTOMER_CONTACTS = 'customerContacts';
const INTERNAL_CONTACTS = 'internalContacts';

async function listAll<T>(collection: string): Promise<T[]> {
  const db = requireAdminFirestore();
  const snap = await db.collection(collection).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

async function createDoc(collection: string, data: Record<string, unknown>): Promise<string> {
  const db = requireAdminFirestore();
  const now = tsFrom(new Date());
  const ref = await db
    .collection(collection)
    .add(stripUndefined({ ...data, createdAt: now, updatedAt: now }));
  return ref.id;
}

async function updateDocById(
  collection: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = requireAdminFirestore();
  // `id` is the document key, never a stored field.
  const { id: _ignored, ...rest } = data;
  await db
    .collection(collection)
    .doc(id)
    .update(stripUndefined({ ...rest, updatedAt: tsFrom(new Date()) }));
}

async function deleteDocById(collection: string, id: string): Promise<void> {
  const db = requireAdminFirestore();
  await db.collection(collection).doc(id).delete();
}

export const getAllCustomerContactsAdmin = () => listAll<CustomerContact>(CUSTOMER_CONTACTS);
export const getAllInternalContactsAdmin = () => listAll<InternalContact>(INTERNAL_CONTACTS);

export const createCustomerContactAdmin = (contact: Omit<CustomerContact, 'id'>) =>
  createDoc(CUSTOMER_CONTACTS, contact);
export const createInternalContactAdmin = (contact: Omit<InternalContact, 'id'>) =>
  createDoc(INTERNAL_CONTACTS, contact);

export const updateCustomerContactAdmin = (id: string, contact: Partial<CustomerContact>) =>
  updateDocById(CUSTOMER_CONTACTS, id, contact);
export const updateInternalContactAdmin = (id: string, contact: Partial<InternalContact>) =>
  updateDocById(INTERNAL_CONTACTS, id, contact);

export const deleteCustomerContactAdmin = (id: string) => deleteDocById(CUSTOMER_CONTACTS, id);
export const deleteInternalContactAdmin = (id: string) => deleteDocById(INTERNAL_CONTACTS, id);
