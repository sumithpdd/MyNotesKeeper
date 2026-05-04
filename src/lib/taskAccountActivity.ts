import type { EngagementTask } from '@/types';

/** Latest task touch for an account (by customerId, including tasks linked via opportunity). */
export function getTasksForCustomer(
  customerId: string,
  tasks: EngagementTask[],
  opportunityIdsForCustomer: Set<string>,
): EngagementTask[] {
  return tasks.filter(
    (t) =>
      t.customerId === customerId ||
      (t.opportunityId && opportunityIdsForCustomer.has(t.opportunityId)),
  );
}

export function getLastAccountTaskAction(
  customerId: string,
  tasks: EngagementTask[],
  opportunityIdsForCustomer: Set<string>,
): Date | null {
  const relevant = getTasksForCustomer(customerId, tasks, opportunityIdsForCustomer);
  if (relevant.length === 0) return null;
  let max = relevant[0].lastActionedAt.getTime();
  for (let i = 1; i < relevant.length; i++) {
    const t = relevant[i].lastActionedAt.getTime();
    if (t > max) max = t;
  }
  return new Date(max);
}
