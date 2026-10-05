import type { Customer, CustomerProfile, EngagementTask, Opportunity } from '@/types';

const STALE_SE_DAYS = 14;

export interface QuicklookStats {
  tasksDueThisWeek: EngagementTask[];
  staleSeCustomers: { customerId: string; customerName: string; daysSince: number }[];
  activePipelineOpps: number;
  inProgressTasks: number;
}

export function computeQuicklookStats(input: {
  customers: Customer[];
  profiles: CustomerProfile[];
  opportunities: Opportunity[];
  tasks: EngagementTask[];
}): QuicklookStats {
  const now = Date.now();
  const weekEnd = now + 7 * 24 * 60 * 60 * 1000;

  const tasksDueThisWeek = input.tasks
    .filter((t) => t.status !== 'done' && t.status !== 'cancelled')
    .filter((t) => {
      const due = t.dueDate ?? t.endDate ?? t.startDate;
      if (!due) return false;
      const ms = due.getTime();
      return ms >= now - 24 * 60 * 60 * 1000 && ms <= weekEnd;
    })
    .sort((a, b) => (a.dueDate ?? a.endDate)!.getTime() - (b.dueDate ?? b.endDate)!.getTime())
    .slice(0, 8);

  const nameById = new Map(input.customers.map((c) => [c.id, c.customerName]));
  const staleSeCustomers: QuicklookStats['staleSeCustomers'] = [];

  for (const p of input.profiles) {
    if (!p.seInvolvement) continue;
    const updated = p.seNotesLastUpdated?.getTime();
    if (!updated) {
      staleSeCustomers.push({
        customerId: p.customerId,
        customerName: nameById.get(p.customerId) || 'Unknown',
        daysSince: 999,
      });
      continue;
    }
    const days = Math.floor((now - updated) / (24 * 60 * 60 * 1000));
    if (days > STALE_SE_DAYS) {
      staleSeCustomers.push({
        customerId: p.customerId,
        customerName: nameById.get(p.customerId) || 'Unknown',
        daysSince: days,
      });
    }
  }
  staleSeCustomers.sort((a, b) => b.daysSince - a.daysSince).splice(6);

  const activeStages = new Set(['Discover', 'Qualify', 'Differentiate', 'Propose']);
  const activePipelineOpps = input.opportunities.filter((o) => activeStages.has(o.currentStage)).length;

  const inProgressTasks = input.tasks.filter((t) => t.status === 'in_progress').length;

  return { tasksDueThisWeek, staleSeCustomers, activePipelineOpps, inProgressTasks };
}
