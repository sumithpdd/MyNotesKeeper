/**
 * Read-model helpers for dashboard metrics (presentation-agnostic numbers).
 */
import type { Customer, CustomerNote, EngagementTask, Opportunity } from '@/types';

const DAYS_RECENT_NOTE = 30;

export interface EngagementDashboardStatsInput {
  customers: Customer[];
  notes: CustomerNote[];
  opportunities: Opportunity[];
  tasks: EngagementTask[];
}

export interface EngagementDashboardStats {
  openTasks: number;
  opportunityCount: number;
  notesLastDays: number;
}

export function computeEngagementDashboardStats(
  input: EngagementDashboardStatsInput,
): EngagementDashboardStats {
  const openTasks = input.tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled').length;
  const opportunityCount = input.opportunities.length;

  let notesLastDays = 0;
  if (input.customers?.length && input.notes?.length) {
    const cutoff = Date.now() - DAYS_RECENT_NOTE * 24 * 60 * 60 * 1000;
    notesLastDays = input.notes.filter((n) => {
      if (!n?.createdAt) return false;
      return n.createdAt.getTime() >= cutoff;
    }).length;
  }

  return {
    openTasks,
    opportunityCount,
    notesLastDays,
  };
}
