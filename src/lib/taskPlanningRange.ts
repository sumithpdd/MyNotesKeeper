import { startOfDay, format } from 'date-fns';
import type { EngagementTask } from '@/types/task';

export function normalizeTaskDay(d: Date | string | undefined | null): Date | null {
  if (d === undefined || d === null) return null;
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return null;
  return startOfDay(x);
}

/** Inclusive calendar range for filtering & calendar paint. Honors start/end/due legacy. */
export function getTaskPlanningRange(task: EngagementTask): { start: Date; end: Date } | null {
  const s = normalizeTaskDay(task.startDate ?? task.dueDate ?? null);
  const e = normalizeTaskDay(task.endDate ?? task.dueDate ?? task.startDate ?? null);
  if (!s && !e) return null;
  const start = s ?? e!;
  const end = e ?? s!;
  const st = start.getTime();
  const et = end.getTime();
  return st <= et ? { start, end } : { start: end, end: start };
}

/** Task spans this calendar day (local midnight boundary). */
export function taskTouchesCalendarDay(task: EngagementTask, calDay: Date): boolean {
  const r = getTaskPlanningRange(task);
  if (!r) return false;
  const d = startOfDay(calDay).getTime();
  return startOfDay(r.start).getTime() <= d && startOfDay(r.end).getTime() >= d;
}

export interface RangeSegmentHint {
  isSingle: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
}

export function getRangeSegment(calDay: Date, range: { start: Date; end: Date }): RangeSegmentHint {
  const d = startOfDay(calDay).getTime();
  const st = startOfDay(range.start).getTime();
  const et = startOfDay(range.end).getTime();
  const isSingle = st === et;
  return {
    isSingle,
    isRangeStart: d === st,
    isRangeEnd: d === et,
  };
}

/** Human-readable inclusive planning window for lists and cards. */
export function formatTaskPlanningWindow(task: EngagementTask): string | null {
  const r = getTaskPlanningRange(task);
  if (!r) return null;
  const fmt = (x: Date) => {
    const y = x.getFullYear();
    const cur = new Date().getFullYear();
    return y === cur ? format(x, 'MMM d') : format(x, 'MMM d, yyyy');
  };
  if (r.start.getTime() === r.end.getTime()) return fmt(r.start);
  return `${fmt(r.start)} → ${fmt(r.end)}`;
}
