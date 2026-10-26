/**
 * Meeting prep: Command of the Message (COM) + AAA (Agenda, Ask, Act).
 * Apply whenever a customer meeting is upcoming — especially Meeting Preparation tasks.
 */

import type { EngagementTask, TaskCategory, TaskChecklistItem } from '@/types/task';

export const MEETING_PREPARATION_CATEGORY = 'Meeting Preparation';

export const COMMAND_OF_MESSAGE_PREP = {
  title: 'Command of the Message',
  summary:
    'Contrast before/after, tie to positive business outcomes, surface negative consequences of inaction, and confirm required capabilities.',
  items: [
    'Before scenario: customer pain and current state articulated',
    'After scenario: positive business outcomes linked to their stated priorities',
    'Negative consequences of inaction (cost of staying on current path)',
    'Required capabilities mapped to our solution (e.g. XP, SitecoreAI, Scrunch)',
  ],
} as const;

export const AAA_MEETING_PREP = {
  title: 'AAA — Agenda, Ask, Act',
  summary:
    'Agenda: timeboxed plan and roles. Ask: discovery aligned to qualification gaps. Act: mutual next steps with owners.',
  items: [
    'Agenda: shared, timeboxed, partner vs Sitecore roles clear',
    'Ask: discovery questions prepared (MEDDPICC / BANT gaps)',
    'Act: mutual next steps and owners agreed before close',
  ],
} as const;

export function buildMeetingPrepChecklist(): TaskChecklistItem[] {
  const rows = [...COMMAND_OF_MESSAGE_PREP.items, ...AAA_MEETING_PREP.items];
  return rows.map((label, i) => ({
    id: `meeting-prep-${i}`,
    label,
    done: false,
  }));
}

function parseWhen(task: EngagementTask): number | null {
  const raw = task.startDate ?? task.dueDate ?? task.endDate;
  if (!raw) return null;
  const t = raw instanceof Date ? raw.getTime() : new Date(String(raw)).getTime();
  return Number.isFinite(t) ? t : null;
}

export function isMeetingPrepCategory(
  task: EngagementTask,
  categories: TaskCategory[],
): boolean {
  const names = new Set(
    (task.categoryIds ?? [])
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter(Boolean),
  );
  if (names.has(MEETING_PREPARATION_CATEGORY)) return true;
  return /meeting prep|workshop prep|demo prep/i.test(task.title || '');
}

/** Upcoming linked meeting within the next `withinDays` (default 21). */
export function findUpcomingMeetingTasks(
  tasks: EngagementTask[],
  customerId: string,
  categories: TaskCategory[],
  withinDays = 21,
): EngagementTask[] {
  const now = Date.now();
  const horizon = now + withinDays * 24 * 60 * 60 * 1000;
  return tasks
    .filter((t) => t.customerId === customerId && t.status !== 'done' && t.status !== 'cancelled')
    .filter((t) => isMeetingPrepCategory(t, categories) || /workshop|demo|meeting/i.test(t.title))
    .filter((t) => {
      const when = parseWhen(t);
      return when != null && when >= now - 24 * 60 * 60 * 1000 && when <= horizon;
    })
    .sort((a, b) => (parseWhen(a) ?? 0) - (parseWhen(b) ?? 0));
}

export function meetingPrepChecklistComplete(task: EngagementTask): boolean {
  const list = task.checklist ?? [];
  const prep = buildMeetingPrepChecklist();
  if (!list.length) return false;
  return prep.every((p) => list.some((c) => c.label === p.label && c.done));
}
