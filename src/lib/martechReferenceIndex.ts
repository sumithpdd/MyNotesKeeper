import type { Customer } from '@/types';

export interface MartechRefs {
  /** Accounts (customers) that list this martech tool on `martechToolIds` or resolved `martechTools`. */
  accounts: { id: string; name: string }[];
}

/** Build martechToolId → which customers reference it. */
export function buildMartechReferenceIndex(customers: Customer[]): Map<string, MartechRefs> {
  const map = new Map<string, MartechRefs>();

  const ensure = (toolId: string): MartechRefs => {
    let e = map.get(toolId);
    if (!e) {
      e = { accounts: [] };
      map.set(toolId, e);
    }
    return e;
  };

  for (const c of customers) {
    const idSet = new Set<string>();
    for (const id of c.martechToolIds || []) {
      if (id) idSet.add(id);
    }
    for (const m of c.martechTools || []) {
      if (m?.id) idSet.add(m.id);
    }
    for (const tid of idSet) {
      ensure(tid).accounts.push({ id: c.id, name: c.customerName });
    }
  }

  return map;
}
