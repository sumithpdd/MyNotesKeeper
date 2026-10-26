'use client';

import { AlertTriangle, CheckCircle2, ClipboardCheck, HelpCircle } from 'lucide-react';
import type { EngagementTask, TaskCategory } from '@/types';
import {
  AAA_MEETING_PREP,
  COMMAND_OF_MESSAGE_PREP,
  findUpcomingMeetingTasks,
  meetingPrepChecklistComplete,
} from '@/domain/engagement-hub/meetingPrepFramework';
import { formatTaskPlanningWindow } from '@/lib/taskPlanningRange';

interface Props {
  customerId: string;
  tasks: EngagementTask[];
  taskCategories: TaskCategory[];
  onOpenTask?: (taskId: string) => void;
  className?: string;
}

export function MeetingPrepPanel({
  customerId,
  tasks,
  taskCategories,
  onOpenTask,
  className = '',
}: Props) {
  const upcoming = findUpcomingMeetingTasks(tasks, customerId, taskCategories);
  if (!upcoming.length) return null;

  const next = upcoming[0];
  const complete = meetingPrepChecklistComplete(next);

  return (
    <div
      className={`rounded-lg border border-sky-200 bg-sky-50/90 p-4 ${className}`}
      role="region"
      aria-label="Upcoming meeting preparation"
    >
      <div className="flex items-start gap-3 mb-3">
        <ClipboardCheck className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-sky-950">Upcoming meeting — use COM + AAA</h3>
          <p className="text-xs text-sky-900/90 mt-1">
            <strong>{next.title}</strong>
            {formatTaskPlanningWindow(next) ? ` · ${formatTaskPlanningWindow(next)}` : null}
          </p>
          {onOpenTask ? (
            <button
              type="button"
              onClick={() => onOpenTask(next.id)}
              className="text-xs font-medium text-sky-800 underline mt-1 hover:text-sky-950"
            >
              Open task checklist
            </button>
          ) : null}
        </div>
        {complete ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-full shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Checklist done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-100 px-2 py-1 rounded-full shrink-0">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            Prep incomplete
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-800">
        <FrameworkBlock title={COMMAND_OF_MESSAGE_PREP.title} summary={COMMAND_OF_MESSAGE_PREP.summary} items={[...COMMAND_OF_MESSAGE_PREP.items]} />
        <FrameworkBlock title={AAA_MEETING_PREP.title} summary={AAA_MEETING_PREP.summary} items={[...AAA_MEETING_PREP.items]} />
      </div>
    </div>
  );
}

function FrameworkBlock({
  title,
  summary,
  items,
}: {
  title: string;
  summary: string;
  items: string[];
}) {
  return (
    <div className="bg-white/80 rounded-md border border-sky-100 p-3">
      <p className="font-semibold text-gray-900 flex items-center gap-1">
        {title}
        <span className="group relative inline-flex">
          <HelpCircle className="h-3.5 w-3.5 text-gray-400" aria-hidden />
          <span className="pointer-events-none absolute left-0 bottom-full z-10 mb-1 w-56 rounded bg-gray-900 px-2 py-1.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {summary}
          </span>
        </span>
      </p>
      <ul className="mt-2 space-y-1 list-disc list-inside text-gray-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
