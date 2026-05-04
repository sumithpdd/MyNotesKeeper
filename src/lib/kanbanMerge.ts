import type { EngagementTask, TaskKanbanStatus } from '@/types';

const STATUSES: TaskKanbanStatus[] = ['todo', 'in_progress', 'done', 'cancelled'];

/**
 * Apply a Kanban drag: move `activeId` relative to `overId` (column id or another task id).
 */
export function applyKanbanDrag(
  tasks: EngagementTask[],
  activeId: string,
  overId: string,
): EngagementTask[] {
  if (overId === activeId) return tasks;

  const active = tasks.find((t) => t.id === activeId);
  if (!active) return tasks;

  let targetStatus: TaskKanbanStatus = active.status;
  let insertBeforeId: string | null = null;

  if (STATUSES.includes(overId as TaskKanbanStatus)) {
    targetStatus = overId as TaskKanbanStatus;
  } else {
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return tasks;
    targetStatus = overTask.status;
    insertBeforeId = overTask.id;
  }

  const rest = tasks.filter((t) => t.id !== activeId);
  const moved: EngagementTask = { ...active, status: targetStatus };

  function buildColumn(status: TaskKanbanStatus): EngagementTask[] {
    const col = rest.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
    if (status !== targetStatus) {
      return col.map((t, i) => ({ ...t, order: i }));
    }
    const arr = [...col];
    if (insertBeforeId) {
      const idx = arr.findIndex((t) => t.id === insertBeforeId);
      if (idx >= 0) arr.splice(idx, 0, moved);
      else arr.push(moved);
    } else {
      arr.push(moved);
    }
    return arr.map((t, i) => ({ ...t, order: i }));
  }

  return [
    ...buildColumn('todo'),
    ...buildColumn('in_progress'),
    ...buildColumn('done'),
    ...buildColumn('cancelled'),
  ];
}
