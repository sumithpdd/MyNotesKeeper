import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import type { CreateCustomerData, Customer } from '@/types';

const COLLECTION = 'customers';

const DISPLAY_ONLY_KEYS = new Set([
  'id',
  'customerContacts',
  'internalContacts',
  'accountExecutive',
  'accountExecutives',
  'products',
  'partners',
  'martechTools',
]);

function toDate(ts: unknown): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  if (typeof ts === 'object' && ts !== null && 'toDate' in ts && typeof (ts as { toDate: () => Date }).toDate === 'function') {
    try {
      return (ts as { toDate: () => Date }).toDate();
    } catch {
      return new Date();
    }
  }
  return new Date();
}

/** Firestore-safe value: ISO date strings → Timestamp; leave primitives and arrays as-is. */
function coerceForFirestore(val: unknown): unknown {
  if (val === undefined) return undefined;
  if (val instanceof Date) return Timestamp.fromDate(val);
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return Timestamp.fromDate(d);
  }
  return val;
}

function dropUndefined(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, v]) => v !== undefined));
}

/**
 * Customer payload from the Hub (JSON). Strips display-only relations and timestamp fields
 * the server sets explicitly on write.
 */
export function customerWritePayloadFromPartial(
  partial: Partial<CreateCustomerData> & Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(partial)) {
    if (DISPLAY_ONLY_KEYS.has(k)) continue;
    if (k === 'createdAt' || k === 'updatedAt') continue;
    if (v === undefined) continue;
    out[k] = coerceForFirestore(v);
  }
  return out;
}

export async function createCustomerAdmin(data: CreateCustomerData, userId: string): Promise<string> {
  const db = requireAdminFirestore();
  const now = Timestamp.now();
  const payload = customerWritePayloadFromPartial(data as Partial<CreateCustomerData> & Record<string, unknown>);
  payload.createdBy = userId;
  payload.updatedBy = userId;
  payload.createdAt = now;
  payload.updatedAt = now;
  const ref = await db.collection(COLLECTION).add(dropUndefined(payload));
  return ref.id;
}

export async function updateCustomerAdmin(
  customerId: string,
  partial: Partial<CreateCustomerData> & Record<string, unknown>,
  userId: string,
): Promise<void> {
  const db = requireAdminFirestore();
  const ref = db.collection(COLLECTION).doc(customerId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('No document to update');

  const payload = customerWritePayloadFromPartial(partial);
  payload.updatedBy = userId;
  payload.updatedAt = Timestamp.now();

  await ref.update(dropUndefined(payload));
}

export async function deleteCustomerAdmin(customerId: string): Promise<void> {
  const db = requireAdminFirestore();
  await db.collection(COLLECTION).doc(customerId).delete();
}

/** Same shape as legacy `customerService.getAllCustomers()` but via Admin (works in Route Handlers). */
export async function getAllCustomersAdmin(): Promise<Customer[]> {
  const db = requireAdminFirestore();
  const snap = await db.collection(COLLECTION).get();
  const rows = snap.docs.map((d) => {
    const data = d.data() as Omit<Customer, 'id'>;
    return {
      id: d.id,
      ...data,
      productIds: data.productIds ?? [],
      customerContactIds: data.customerContactIds ?? [],
      internalContactIds: data.internalContactIds ?? [],
      partnerIds: data.partnerIds ?? [],
      martechToolIds: data.martechToolIds ?? [],
      sharePointUrl: data.sharePointUrl ?? '',
      salesforceLink: data.salesforceLink ?? '',
      createdAt: toDate((data as { createdAt?: unknown }).createdAt),
      updatedAt: toDate((data as { updatedAt?: unknown }).updatedAt),
    } as Customer;
  });
  rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return rows;
}
