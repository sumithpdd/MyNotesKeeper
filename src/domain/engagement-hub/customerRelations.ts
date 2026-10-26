/**
 * Normalized ID arrays on `customers` — source of truth for hub enrichment.
 * Account executives must appear in internalContactIds so workspace load can resolve them.
 */

import type { CustomerContact, Partner } from '@/types';

export function normalizeOrgKey(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Split linked customerContacts into account-side people vs partner-side people (by companyName). */
export function partitionCustomerContactsForAccount(customer: {
  customerName: string;
  customerContacts?: CustomerContact[];
  partners?: Partner[];
}): { accountContacts: CustomerContact[]; partnerContacts: CustomerContact[] } {
  const contacts = customer.customerContacts ?? [];
  const customerKey = normalizeOrgKey(customer.customerName);
  const partnerKeys = new Set((customer.partners ?? []).map((p) => normalizeOrgKey(p.name)));

  const accountContacts: CustomerContact[] = [];
  const partnerContacts: CustomerContact[] = [];

  for (const c of contacts) {
    const company = c.companyName?.trim();
    if (!company) {
      accountContacts.push(c);
      continue;
    }
    const companyKey = normalizeOrgKey(company);
    const matchesPartner =
      partnerKeys.has(companyKey) ||
      [...partnerKeys].some((pk) => companyKey.includes(pk) || pk.includes(companyKey));
    const matchesAccount =
      companyKey === customerKey ||
      companyKey.includes(customerKey) ||
      customerKey.includes(companyKey);

    if (matchesPartner && !matchesAccount) partnerContacts.push(c);
    else accountContacts.push(c);
  }

  accountContacts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  partnerContacts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  return { accountContacts, partnerContacts };
}

export function uniqueStringIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((x): x is string => typeof x === 'string' && x.length > 0))];
}

export function normalizeCustomerRelationFields(customer: {
  customerContactIds?: unknown;
  internalContactIds?: unknown;
  partnerIds?: unknown;
  accountExecutiveIds?: unknown;
  accountExecutiveId?: unknown;
  primaryCustomerContactId?: unknown;
}): {
  customerContactIds: string[];
  internalContactIds: string[];
  partnerIds: string[];
  accountExecutiveIds: string[];
  accountExecutiveId?: string;
  primaryCustomerContactId?: string;
} {
  const customerContactIds = uniqueStringIds(customer.customerContactIds);
  let internalContactIds = uniqueStringIds(customer.internalContactIds);
  const partnerIds = uniqueStringIds(customer.partnerIds);
  let accountExecutiveIds = uniqueStringIds(customer.accountExecutiveIds);

  const legacyAe =
    typeof customer.accountExecutiveId === 'string' && customer.accountExecutiveId
      ? customer.accountExecutiveId
      : undefined;
  if (legacyAe && !accountExecutiveIds.includes(legacyAe)) {
    accountExecutiveIds = [...accountExecutiveIds, legacyAe];
  }

  internalContactIds = [...new Set([...internalContactIds, ...accountExecutiveIds])];

  const accountExecutiveId = accountExecutiveIds[0] ?? legacyAe;

  const primaryCustomerContactId =
    typeof customer.primaryCustomerContactId === 'string' && customer.primaryCustomerContactId
      ? customer.primaryCustomerContactId
      : undefined;

  return {
    customerContactIds,
    internalContactIds,
    partnerIds,
    accountExecutiveIds,
    ...(accountExecutiveId ? { accountExecutiveId } : {}),
    ...(primaryCustomerContactId ? { primaryCustomerContactId } : {}),
  };
}

/** Drop IDs whose documents are missing; optionally filter customerContacts to owning customerId. */
export function filterExistingRelationIds(opts: {
  customerContactIds: string[];
  internalContactIds: string[];
  partnerIds: string[];
  existingCustomerContactIds: Set<string>;
  existingInternalContactIds: Set<string>;
  existingPartnerIds: Set<string>;
}): {
  customerContactIds: string[];
  internalContactIds: string[];
  partnerIds: string[];
  removed: { customerContacts: string[]; internalContacts: string[]; partners: string[] };
} {
  const keep = (ids: string[], exists: Set<string>) => {
    const kept: string[] = [];
    const removed: string[] = [];
    for (const id of ids) {
      if (exists.has(id)) kept.push(id);
      else removed.push(id);
    }
    return { kept, removed };
  };

  const cc = keep(opts.customerContactIds, opts.existingCustomerContactIds);
  const ic = keep(opts.internalContactIds, opts.existingInternalContactIds);
  const pp = keep(opts.partnerIds, opts.existingPartnerIds);

  return {
    customerContactIds: cc.kept,
    internalContactIds: ic.kept,
    partnerIds: pp.kept,
    removed: {
      customerContacts: cc.removed,
      internalContacts: ic.removed,
      partners: pp.removed,
    },
  };
}
