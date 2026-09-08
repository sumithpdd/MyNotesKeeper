import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import type {
  CreateCustomerNoteData,
  CustomerContact,
  InternalContact,
  Product,
  Partner,
} from '@/types';

/**
 * Admin-SDK writes for the AI chat tools.
 *
 * The equivalent helpers in `src/lib/*Service.ts` use the Firebase **web** SDK,
 * which authenticates as the signed-in browser user. Called from a route
 * handler there is no such user, so every Firestore rule that requires
 * `request.auth != null` denies the request — the whole of `firestore.rules`.
 *
 * Document shapes intentionally mirror the client services so records written
 * by the assistant are indistinguishable from records written by the UI.
 */

async function createWithTimestamps(
  collectionName: string,
  data: Record<string, unknown>,
): Promise<string> {
  const db = requireAdminFirestore();
  const now = Timestamp.now();
  const ref = await db.collection(collectionName).add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

/** Mirrors `customerNotesService.createNote`. */
export function createCustomerNoteAdmin(
  data: CreateCustomerNoteData,
  userId: string,
): Promise<string> {
  return createWithTimestamps('customerNotes', {
    ...data,
    noteDate: Timestamp.fromDate(data.noteDate),
    createdBy: userId,
    updatedBy: userId,
  });
}

/** Mirrors `internalContactService.createInternalContact`. */
export function createInternalContactAdmin(
  contact: Omit<InternalContact, 'id'>,
): Promise<string> {
  return createWithTimestamps('internalContacts', { ...contact });
}

/** Mirrors `customerContactService.createCustomerContact`. */
export function createCustomerContactAdmin(
  contact: Omit<CustomerContact, 'id'>,
): Promise<string> {
  return createWithTimestamps('customerContacts', { ...contact });
}

/** Mirrors `productService.createProduct`. */
export function createProductAdmin(data: Omit<Product, 'id'>): Promise<string> {
  return createWithTimestamps('products', { ...data });
}

/** Mirrors `partnerService.createPartner`. */
export function createPartnerAdmin(data: Omit<Partner, 'id'>): Promise<string> {
  return createWithTimestamps('partners', { ...data });
}
