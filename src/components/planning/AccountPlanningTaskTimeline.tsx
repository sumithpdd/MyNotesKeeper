'use client';

import { format, startOfWeek, endOfWeek, isSameWeek } from 'date-fns';
import type { EngagementTask, TaskCategory } from '@/types';
import {
  ACCOUNT_PLANNING_PILLARS,
  pillarById,
  resolveTaskPlanningPillar,
  type AccountPlanningPillarId,
} from '@/domain/engagement-hub/accountPlanningPillars';
import { formatTaskPlanningWindow, getTaskPlanningRange } from '@/lib/taskPlanningRange';

interface AccountPlanningTaskTimelineProps {
  tasks: EngagementTask[];
  taskCategories: TaskCategory[];
  pillarFilter?: AccountPlanningPillarId | '';
  onTaskClick?: (task: EngagementTask) => void;
  emptyMessage?: string;
  compact?: boolean;
}

function sortByPlanningDate(a: EngagementTask, b: EngagementTask): number {
  const ra = getTaskPlanningRange(a);
  const rb = getTaskPlanningRange(b);
  const ta = ra?.start?.getTime() ?? a.lastActionedAt?.getTime?.() ?? 0;
  const tb = rb?.start?.getTime() ?? b.lastActionedAt?.getTime?.() ?? 0;
  return ta - tb;
}

export function AccountPlanningTaskTimeline({
  tasks,
  taskCategories,
  pillarFilter = '',
  onTaskClick,
  emptyMessage = 'No planning tasks yet — add one from a pillar card.',
  compact = false,
}: AccountPlanningTaskTimelineProps) {
  const sorted = [...tasks].sort(sortByPlanningDate);

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-500">{emptyMessage}</p>;
  }

  const groups: { key: string; label: string; items: EngagementTask[] }[] = [];
  for (const task of sorted) {
    const range = getTaskPlanningRange(task);
    const anchor = range?.start ?? task.lastActionedAt ?? new Date();
    const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
    const key = format(weekStart, 'yyyy-MM-dd');
    let group = groups.find((g) => g.key === key);
    if (!group) {
      const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });
      const label = isSameWeek(new Date(), weekStart, { weekStartsOn: 1 })
        ? 'This week'
        : `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM yyyy')}`;
      group = { key, label, items: [] };
      groups.push(group);
    }
    group.items.push(task);
  }

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {groups.map((group) => (
        <div key={group.key}>
          <p className="text-[11px] font-bold uppercase tracking-wide text-violet-800/80 mb-2">
            {group.label}
          </p>
          <ol className="relative border-l-2 border-violet-200/80 ml-2 space-y-3">
            {group.items.map((task) => {
              const pillarId = resolveTaskPlanningPillar(task, taskCategories);
              const pillar = pillarId ? pillarById(pillarId) : null;
              const windowLabel = formatTaskPlanningWindow(task);
              const showPillarBadge = !pillarFilter && pillar;

              return (
                <li key={task.id} className="ml-4 relative">
                  <span
                    className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-violet-500 ring-2 ring-white"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={() => onTaskClick?.(task)}
                    className={`w-full text-left rounded-lg border border-gray-100 bg-white/90 px-3 py-2 hover:border-violet-200 hover:bg-violet-50/40 transition-colors ${onTaskClick ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                      {showPillarBadge ? (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${pillar.color}`}
                        >
                          {pillar.shortLabel}
                        </span>
                      ) : null}
                    </div>
                    {windowLabel ? (
                      <p className="text-xs text-violet-800 font-semibold mt-0.5">{windowLabel}</p>
                    ) : null}
                    <p className="text-[11px] text-gray-500 capitalize mt-0.5">
                      {String(task.status).replace(/_/g, ' ')}
                    </p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}

export function PlanningPillarLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACCOUNT_PLANNING_PILLARS.map((p) => (
        <span key={p.id} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.color}`}>
          {p.shortLabel}
        </span>
      ))}
    </div>
  );
}
