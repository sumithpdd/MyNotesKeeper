/** Kanban column for account / opportunity tasks */
export type TaskKanbanStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';

/** Account planning pillar tag on engagement tasks. */
export type TaskPlanningPillar =
  | 'whitespace'
  | 'multi_threading'
  | 'migration'
  | 'research';

export interface TaskCategory {
  id: string;
  name: string;
  color?: string; // tailwind-friendly e.g. bg-violet-100 text-violet-800
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

/** Attached URL references (Loops, Salesforce, decks, recordings, etc.). */
export interface TaskLink {
  id: string;
  /** Optional label; falls back to hostname in compact views. */
  label?: string;
  url: string;
}

export interface EngagementTask {
  id: string;
  title: string;
  description?: string;
  /** Task type labels from `taskCategories` — order preserved; UI shows one or many. */
  categoryIds: string[];
  /** Optional link to an opportunity (e.g. demo prep for BUPA opp) */
  opportunityId?: string | null;
  /** Set for account-scoped work; also denormalized when linked to an opportunity */
  customerId?: string | null;
  /** Product catalogue IDs attached to this task */
  productIds?: string[];
  /** Resolved customer-contact catalogue IDs (same collection as CRM customerContacts) */
  customerContactIds?: string[];
  /** Internal catalogue contact IDs */
  internalContactIds?: string[];
  /** Set by the API layer for tenant isolation (canonical owner is Firebase uid). */
  ownerUid?: string | null;
  status: TaskKanbanStatus;
  /** Order within the same status column (for drag-drop) */
  order: number;
  /** Planning window start (inclusive). If null, falls back to `dueDate` for legacy data. */
  startDate?: Date | null;
  /** Planning window end (inclusive). If null, falls back to `dueDate`. */
  endDate?: Date | null;
  /** Legacy single-day due; kept for migration — prefer start/end for new tasks. */
  dueDate?: Date | null;
  checklist?: TaskChecklistItem[];
  subtasks?: TaskSubtask[];
  /** External references shown on cards and calendar details. */
  links?: TaskLink[];
  /** Optional link to account planning pillar (whitespace, multi-threading, etc.). */
  planningPillar?: TaskPlanningPillar | null;
  /** Last time someone advanced or edited this task — drives "last actioned on account" */
  lastActionedAt: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEngagementTaskData {
  title: string;
  description?: string;
  categoryIds: string[];
  opportunityId?: string | null;
  customerId?: string | null;
  productIds?: string[];
  customerContactIds?: string[];
  internalContactIds?: string[];
  status: TaskKanbanStatus;
  order?: number;
  startDate?: Date | null;
  endDate?: Date | null;
  dueDate?: Date | null;
  checklist?: TaskChecklistItem[];
  subtasks?: TaskSubtask[];
  links?: TaskLink[];
  planningPillar?: TaskPlanningPillar | null;
  createdBy: string;
  updatedBy: string;
}