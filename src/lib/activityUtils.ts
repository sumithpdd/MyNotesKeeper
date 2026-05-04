import { Customer, CustomerNote, CustomerProfile, Opportunity } from '@/types';

export type ActivityType =
  | 'account_created'
  | 'account_updated'
  | 'note_added'
  | 'note_updated'
  | 'profile_updated'
  | 'opportunity_created'
  | 'opportunity_updated';

export interface AccountActivity {
  id: string;
  type: ActivityType;
  date: Date;
  customerId: string;
  customerName: string;
  title: string;
  description?: string;
}

function toDate(d: Date | { toDate?: () => Date } | undefined): Date | null {
  if (!d) return null;
  if (d instanceof Date) return d;
  const x = d as { toDate?: () => Date };
  if (typeof x.toDate === 'function') return x.toDate();
  return null;
}

export function buildActivities(
  customers: Customer[],
  notes: CustomerNote[],
  profiles: CustomerProfile[],
  opportunities: Opportunity[]
): AccountActivity[] {
  const activities: AccountActivity[] = [];
  const customerMap = new Map(customers.map((c) => [c.id, c]));

  customers.forEach((c) => {
    const d = toDate(c.createdAt);
    if (d) {
      activities.push({
        id: `customer-created-${c.id}`,
        type: 'account_created',
        date: d,
        customerId: c.id,
        customerName: c.customerName,
        title: 'Account created',
      });
    }
  });

  customers.forEach((c) => {
    const created = toDate(c.createdAt);
    const updated = toDate(c.updatedAt);
    if (updated && (!created || updated.getTime() !== created.getTime())) {
      activities.push({
        id: `customer-updated-${c.id}-${updated.getTime()}`,
        type: 'account_updated',
        date: updated,
        customerId: c.id,
        customerName: c.customerName,
        title: 'Account updated',
      });
    }
  });

  notes.forEach((n) => {
    const d = toDate(n.noteDate) || toDate(n.createdAt);
    if (d) {
      const customer = customerMap.get(n.customerId);
      activities.push({
        id: `note-${n.id}`,
        type: 'note_added',
        date: d,
        customerId: n.customerId,
        customerName: customer?.customerName || 'Unknown',
        title: 'Note added',
        description: n.notes?.slice(0, 80) + (n.notes && n.notes.length > 80 ? '...' : ''),
      });
    }
  });

  notes.forEach((n) => {
    const noteDate = toDate(n.noteDate);
    const updated = toDate(n.updatedAt);
    if (updated && (!noteDate || updated.getTime() !== noteDate.getTime())) {
      const customer = customerMap.get(n.customerId);
      activities.push({
        id: `note-updated-${n.id}-${updated.getTime()}`,
        type: 'note_updated',
        date: updated,
        customerId: n.customerId,
        customerName: customer?.customerName || 'Unknown',
        title: 'Note updated',
      });
    }
  });

  profiles.forEach((p) => {
    const d = toDate(p.updatedAt);
    if (d) {
      const customer = customerMap.get(p.customerId);
      activities.push({
        id: `profile-${p.id}-${d.getTime()}`,
        type: 'profile_updated',
        date: d,
        customerId: p.customerId,
        customerName: customer?.customerName || 'Unknown',
        title: 'Profile updated',
      });
    }
  });

  opportunities.forEach((o) => {
    const created = toDate(o.createdAt);
    if (created) {
      const customer = customerMap.get(o.customerId);
      activities.push({
        id: `opp-created-${o.id}`,
        type: 'opportunity_created',
        date: created,
        customerId: o.customerId,
        customerName: customer?.customerName || 'Unknown',
        title: `Opportunity: ${o.opportunityName}`,
      });
    }
    const updated = toDate(o.updatedAt);
    if (updated && (!created || updated.getTime() !== created.getTime())) {
      const customer = customerMap.get(o.customerId);
      activities.push({
        id: `opp-updated-${o.id}-${updated.getTime()}`,
        type: 'opportunity_updated',
        date: updated,
        customerId: o.customerId,
        customerName: customer?.customerName || 'Unknown',
        title: `Opportunity updated: ${o.opportunityName}`,
      });
    }
  });

  return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
}
