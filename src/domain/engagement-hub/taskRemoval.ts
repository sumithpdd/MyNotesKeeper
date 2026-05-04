/**
 * Engagement hub domain — pure rules for which engagement tasks disappear when an
 * aggregate (customer / opportunity) is removed. Persistence belongs in hooks / services.
 */
import type { EngagementTask } from '@/types';
import type { Opportunity } from '@/types';

export function opportunityIdsForCustomer(
  opportunities: Opportunity[],
  customerId: string,
): Set<string> {
  return new Set(
    opportunities.filter((o) => o.customerId === customerId).map((o) => o.id),
  );
}

/** Task IDs tied to this customer directly or via one of its opportunities */
export function engagementTaskIdsForCustomerRemoval(
  tasks: EngagementTask[],
  opportunities: Opportunity[],
  customerId: string,
): string[] {
  const oppIds = opportunityIdsForCustomer(opportunities, customerId);
  return tasks
    .filter(
      (t) =>
        t.customerId === customerId ||
        (t.opportunityId != null && oppIds.has(t.opportunityId)),
    )
    .map((t) => t.id);
}

export function engagementTaskIdsForOpportunityRemoval(
  tasks: EngagementTask[],
  opportunityId: string,
): string[] {
  return tasks.filter((t) => t.opportunityId === opportunityId).map((t) => t.id);
}
