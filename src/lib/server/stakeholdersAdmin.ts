import 'server-only';
import { requireAdminFirestore } from '@/lib/server/adminFirestore';
import { tsFrom, stripUndefined } from '@/lib/server/adminConvert';
import { updateCustomerAdmin } from '@/lib/server/customersAdmin';
import { createPartnerAdmin } from '@/lib/server/entitiesAdmin';
import type { CustomerContact, InternalContact, Partner } from '@/types';
import { normalizeCustomerRelationFields } from '@/domain/engagement-hub/customerRelations';

const CUSTOMER_CONTACTS = 'customerContacts';
const INTERNAL_CONTACTS = 'internalContacts';
const PARTNERS = 'partners';

function norm(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function findByEmailOrName<T extends { name?: string; email?: string }>(
  collection: string,
  name: string,
  email?: string,
): Promise<{ id: string; data: T } | null> {
  const db = requireAdminFirestore();
  const col = db.collection(collection);
  const em = email?.trim();
  if (em) {
    const q = await col.where('email', '==', em).limit(1).get();
    if (!q.empty) return { id: q.docs[0].id, data: q.docs[0].data() as T };
  }
  const snap = await col.get();
  const n = norm(name);
  for (const d of snap.docs) {
    if (norm(String(d.data().name || '')) === n) {
      return { id: d.id, data: d.data() as T };
    }
  }
  return null;
}

export async function upsertInternalContactAdmin(
  input: Omit<InternalContact, 'id'>,
): Promise<string> {
  const db = requireAdminFirestore();
  const existing = await findByEmailOrName<InternalContact>(
    INTERNAL_CONTACTS,
    input.name,
    input.email,
  );
  const payload = stripUndefined({
    name: input.name.trim(),
    role: input.role?.trim() || undefined,
    email: input.email?.trim() || undefined,
    updatedAt: tsFrom(new Date()),
  });
  if (existing) {
    await db.collection(INTERNAL_CONTACTS).doc(existing.id).update(payload);
    return existing.id;
  }
  const ref = await db.collection(INTERNAL_CONTACTS).add({
    ...payload,
    createdAt: tsFrom(new Date()),
  });
  return ref.id;
}

export async function upsertCustomerContactAdmin(
  input: Omit<CustomerContact, 'id'>,
): Promise<string> {
  const db = requireAdminFirestore();
  const existing = await findByEmailOrName<CustomerContact>(
    CUSTOMER_CONTACTS,
    input.name,
    input.email,
  );
  const payload = stripUndefined({
    name: input.name.trim(),
    email: input.email?.trim() || undefined,
    role: input.role?.trim() || undefined,
    companyName: input.companyName?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    customerId: input.customerId,
    updatedAt: tsFrom(new Date()),
  });
  if (existing) {
    await db.collection(CUSTOMER_CONTACTS).doc(existing.id).update(payload);
    return existing.id;
  }
  const ref = await db.collection(CUSTOMER_CONTACTS).add({
    ...payload,
    createdAt: tsFrom(new Date()),
  });
  return ref.id;
}

export async function upsertPartnerAdmin(input: Omit<Partner, 'id'>): Promise<string> {
  const db = requireAdminFirestore();
  const n = norm(input.name);
  const snap = await db.collection(PARTNERS).get();
  const hit = snap.docs.find((d) => norm(String(d.data().name || '')) === n);
  const payload = stripUndefined({
    name: input.name.trim(),
    type: input.type?.trim() || 'Implementation Partner',
    website: input.website?.trim() || undefined,
    updatedAt: tsFrom(new Date()),
  });
  if (hit) {
    await hit.ref.update(payload);
    return hit.id;
  }
  return createPartnerAdmin(payload as Omit<Partner, 'id'>);
}

export type LinkStakeholdersInput = {
  customerId: string;
  customerContactIds?: string[];
  internalContactIds?: string[];
  partnerIds?: string[];
  accountExecutiveIds?: string[];
};

export async function mergeStakeholderIdsOnCustomer(
  customerId: string,
  links: Omit<LinkStakeholdersInput, 'customerId'>,
  userId: string,
): Promise<void> {
  const db = requireAdminFirestore();
  const ref = db.collection('customers').doc(customerId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Customer not found');

  const data = snap.data()!;
  const mergeIds = (cur: unknown, add?: string[]) => {
    const base = Array.isArray(cur) ? cur.filter((x): x is string => typeof x === 'string') : [];
    return add?.length ? [...new Set([...base, ...add])] : base;
  };

  const merged = normalizeCustomerRelationFields({
    customerContactIds: mergeIds(data.customerContactIds, links.customerContactIds),
    internalContactIds: mergeIds(data.internalContactIds, links.internalContactIds),
    partnerIds: mergeIds(data.partnerIds, links.partnerIds),
    accountExecutiveIds: mergeIds(data.accountExecutiveIds, links.accountExecutiveIds),
    accountExecutiveId: data.accountExecutiveId,
    primaryCustomerContactId: data.primaryCustomerContactId,
  });

  await updateCustomerAdmin(customerId, merged, userId);
}
