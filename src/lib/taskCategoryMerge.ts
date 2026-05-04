import type { EngagementTask } from '@/types';

/** Replace one category id with another on a task, preserving order and deduplicating. */
export function remapTaskCategoryIds(task: EngagementTask, fromId: string, toId: string): EngagementTask {
  const raw = task.categoryIds ?? [];
  if (!raw.includes(fromId)) return task;
  const next = [...new Set(raw.map((id) => (id === fromId ? toId : id)))];
  return { ...task, categoryIds: next };
}
