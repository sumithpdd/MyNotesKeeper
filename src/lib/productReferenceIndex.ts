import type { Customer, EngagementTask, Opportunity } from '@/types';

export interface ProductRefs {
  accounts: { id: string; name: string }[];
  opportunities: {
    id: string;
    opportunityName: string;
    customerId: string;
    customerName: string;
  }[];
  taskCount: number;
}

/** Build productId → who references it (accounts, opportunities, tasks). */
export function buildProductReferenceIndex(
  customers: Customer[],
  opportunities: Opportunity[],
  tasks: EngagementTask[],
): Map<string, ProductRefs> {
  const map = new Map<string, ProductRefs>();

  const ensure = (pid: string): ProductRefs => {
    let e = map.get(pid);
    if (!e) {
      e = { accounts: [], opportunities: [], taskCount: 0 };
      map.set(pid, e);
    }
    return e;
  };

  const customerById = new Map(customers.map((c) => [c.id, c]));

  for (const c of customers) {
    const idSet = new Set<string>();
    for (const id of c.productIds || []) idSet.add(id);
    for (const p of c.products || []) {
      if (p?.id) idSet.add(p.id);
    }
    for (const pid of idSet) {
      ensure(pid).accounts.push({ id: c.id, name: c.customerName });
    }
  }

  for (const o of opportunities) {
    const custName = customerById.get(o.customerId)?.customerName ?? 'Unknown account';
    const pairSeen = new Set<string>();
    for (const p of o.products || []) {
      if (!p?.id) continue;
      const key = `${o.id}:${p.id}`;
      if (pairSeen.has(key)) continue;
      pairSeen.add(key);
      ensure(p.id).opportunities.push({
        id: o.id,
        opportunityName: o.opportunityName,
        customerId: o.customerId,
        customerName: custName,
      });
    }
  }

  for (const t of tasks) {
    for (const pid of t.productIds || []) {
      ensure(pid).taskCount += 1;
    }
  }

  return map;
}
