'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  startOfDay,
  max,
  min,
  differenceInCalendarDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Link2, PanelRightOpen } from 'lucide-react';
import type { EngagementTask, Opportunity, Customer, TaskCategory } from '@/types';
import { safeFormatDate } from '@/lib/utils';
import {
  getTaskPlanningRange,
  taskTouchesCalendarDay,
  getRangeSegment,
  formatTaskPlanningWindow,
} from '@/lib/taskPlanningRange';
import { taskLinkHref } from '@/lib/taskLinks';

interface TaskCalendarViewProps {
  tasks: EngagementTask[];
  categories: TaskCategory[];
  opportunities: Opportunity[];
  customers: Customer[];
  /** Open Customer Management workspace for the task's account. */
  onOpenCustomerWorkspace?: (customerId: string, opportunityId?: string | null) => void;
  onSelectTask: (task: EngagementTask) => void;
}

const WEEK_OPTS = { weekStartsOn: 1 as const };
const GANTT_PAGE_SIZE = 8;

const STATUS_BAR_CLASS: Record<EngagementTask['status'], string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-[#9381FF]',
  done: 'bg-emerald-500',
  cancelled: 'bg-rose-300',
};

function TaskPlanningStrip({
  task,
  day,
  onActivate,
}: {
  task: EngagementTask;
  day: Date;
  onActivate: () => void;
}) {
  const range = getTaskPlanningRange(task);
  if (!range) return null;
  if (!taskTouchesCalendarDay(task, day)) return null;
  const seg = getRangeSegment(day, range);

  if (seg.isSingle) {
    return (
      <div
        role="presentation"
        onClick={(e) => {
          e.stopPropagation();
          onActivate();
        }}
        className="mb-1 w-full flex justify-center cursor-pointer"
        title={task.title}
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#593E98] shadow-sm ring-2 ring-white" />
      </div>
    );
  }

  const { isRangeStart, isRangeEnd } = seg;

  return (
    <div
      role="presentation"
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      title={task.title}
      className="mb-1 flex w-full min-w-0 items-center px-0.5 cursor-pointer"
    >
      {isRangeStart ? (
        <span className="flex w-full min-h-[22px] min-w-0 items-center gap-0">
          <span className="z-[2] inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#593E98] shadow-sm ring-2 ring-white" />
          <span className="-ml-1.5 h-2 min-w-[4px] flex-1 rounded-r-sm bg-violet-200" />
        </span>
      ) : null}
      {isRangeEnd && !isRangeStart ? (
        <span className="flex w-full min-h-[22px] min-w-0 items-center gap-0">
          <span className="-mr-1.5 h-2 min-w-[4px] flex-1 rounded-l-sm bg-violet-200" />
          <span className="z-[2] inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#593E98] shadow-sm ring-2 ring-white" />
        </span>
      ) : null}
      {!isRangeStart && !isRangeEnd ? (
        <span className="-mx-[2px] h-2 w-[calc(100%+4px)] rounded-none bg-violet-200" />
      ) : null}
    </div>
  );
}

export function TaskCalendarView({
  tasks,
  categories,
  opportunities,
  customers,
  onOpenCustomerWorkspace,
  onSelectTask,
}: TaskCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timelinePage, setTimelinePage] = useState(1);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, WEEK_OPTS);
  const calendarEnd = endOfWeek(monthEnd, WEEK_OPTS);

  const days = useMemo(() => {
    const result: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [calendarStart, calendarEnd]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, EngagementTask[]>();

    tasks.forEach((task) => {
      const range = getTaskPlanningRange(task);
      if (!range) return;

      const from = startOfDay(max([range.start, calendarStart]));
      const to = startOfDay(min([range.end, calendarEnd]));

      if (from.getTime() > to.getTime()) return;

      eachDayOfInterval({ start: from, end: to }).forEach((d) => {
        const key = format(d, 'yyyy-MM-dd');
        const list = map.get(key);
        if (list == null) {
          map.set(key, [task]);
        } else if (!list.some((existing) => existing.id === task.id)) {
          list.push(task);
        }
      });
    });

    map.forEach((list) => list.sort((a, b) => a.title.localeCompare(b.title)));

    return map;
  }, [tasks, calendarStart, calendarEnd]);

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const tasksOnSelected = selectedKey ? (tasksByDate.get(selectedKey) ?? []) : [];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysInMonth = differenceInCalendarDays(monthEnd, monthStart) + 1;
  const timelineTasks = useMemo(() => {
    return tasks
      .map((task) => {
        const full = getTaskPlanningRange(task);
        if (!full) return null;
        const start = startOfDay(max([full.start, monthStart]));
        const end = startOfDay(min([full.end, monthEnd]));
        if (start.getTime() > end.getTime()) return null;
        const offsetDays = differenceInCalendarDays(start, monthStart);
        const spanDays = differenceInCalendarDays(end, start) + 1;
        const leftPct = (offsetDays / daysInMonth) * 100;
        const widthPct = (spanDays / daysInMonth) * 100;
        const opp = task.opportunityId ? opportunities.find((o) => o.id === task.opportunityId) : null;
        const accountId = task.customerId ?? opp?.customerId ?? null;
        const cust = accountId ? customers.find((c) => c.id === accountId) : null;
        return {
          task,
          leftPct,
          widthPct,
          spanDays,
          accountId,
          customerName: cust?.customerName ?? null,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row != null)
      .sort((a, b) => {
        if (a.leftPct !== b.leftPct) return a.leftPct - b.leftPct;
        return a.task.title.localeCompare(b.task.title);
      });
  }, [tasks, monthStart, monthEnd, daysInMonth, opportunities, customers]);
  const ganttTotalPages = Math.max(1, Math.ceil(timelineTasks.length / GANTT_PAGE_SIZE));
  const ganttPage = Math.min(timelinePage, ganttTotalPages);
  const ganttRows = timelineTasks.slice((ganttPage - 1) * GANTT_PAGE_SIZE, ganttPage * GANTT_PAGE_SIZE);

  useEffect(() => {
    setTimelinePage(1);
  }, [currentMonth]);

  useEffect(() => {
    if (timelinePage > ganttTotalPages) setTimelinePage(ganttTotalPages);
  }, [timelinePage, ganttTotalPages]);

  return (
    <div className="rounded-[1.35rem] border border-[#e8e4ff] bg-white/[0.97] overflow-hidden hub-soft-shadow ring-1 ring-[#9381FF]/[0.08]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 border-b border-violet-100/80 bg-gradient-to-br from-[#faf8ff] to-white">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2 rounded-xl border border-violet-200/70 bg-white/90 text-violet-700 hover:bg-[#9381FF]/10 hover:border-[#9381FF]/35 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(startOfMonth(new Date()))}
            className="text-sm font-semibold px-4 py-2 rounded-full text-[#9381FF] bg-[#9381FF]/10 hover:bg-[#9381FF]/18 border border-[#9381FF]/25 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-xl border border-violet-200/70 bg-white/90 text-violet-700 hover:bg-[#9381FF]/10 hover:border-[#9381FF]/35 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 text-[11px] font-bold uppercase tracking-wider text-violet-400 mb-3 text-center">
          {weekDays.map((wd) => (
            <div key={wd} className="py-2">
              {wd}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate.get(key) ?? [];
            const muted = !isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const isSel = !!(selectedDate && isSameDay(day, selectedDate));

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={`min-h-[112px] p-1.5 rounded-xl border text-left transition-colors flex flex-col ${
                  muted
                    ? 'bg-violet-50/40 border-transparent text-violet-200'
                    : 'bg-white border-violet-100/90 hover:border-[#9381FF]/40 hover:shadow-[0_6px_20px_-12px_rgba(147,129,255,0.35)]'
                } ${isToday ? 'ring-2 ring-[#9381FF]/60 ring-offset-2 ring-offset-white' : ''} ${
                  isSel
                    ? 'bg-[#faf8ff] border-[#9381FF]/50 shadow-[0_8px_24px_-14px_rgba(147,129,255,0.45)]'
                    : ''
                }`}
              >
                <span className={`text-sm font-medium shrink-0 ${muted ? '' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-1 min-h-[30px] w-full shrink-0">
                  {dayTasks.map((task) => (
                    <TaskPlanningStrip key={`${task.id}-${key}`} task={task} day={day} onActivate={() => onSelectTask(task)} />
                  ))}
                </div>

                <div className="mt-auto min-h-[2.125rem] w-full shrink-0">
                  <div className="flex flex-col gap-1">
                    {dayTasks.slice(0, 2).map((t) => {
                      const firstCatId = t.categoryIds?.[0];
                      const cat = firstCatId ? categories.find((c) => c.id === firstCatId) : undefined;
                      const plan = formatTaskPlanningWindow(t);
                      return (
                        <div
                          key={t.id}
                          title={`${t.title}${plan ? ` · ${plan}` : ''}`}
                          className={`text-[10px] px-1 py-0.5 rounded truncate ${
                            cat?.color ?? 'bg-gray-100 text-gray-800'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(t);
                          }}
                          role="presentation"
                        >
                          {t.title}
                        </div>
                      );
                    })}
                  </div>
                  {dayTasks.length > 2 ? (
                    <div className="text-[10px] text-gray-500 mt-0.5">+{dayTasks.length - 2} more</div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-violet-100/80 px-4 py-4 bg-white">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-semibold text-violet-950">Timeline (Gantt)</p>
          <div className="flex items-center gap-3">
            <p className="text-[11px] text-violet-700">
              {timelineTasks.length} task{timelineTasks.length === 1 ? '' : 's'} in {format(currentMonth, 'MMMM')}
            </p>
            {timelineTasks.length > GANTT_PAGE_SIZE ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTimelinePage((p) => Math.max(1, p - 1))}
                  disabled={ganttPage <= 1}
                  className="px-2 py-1 text-[11px] rounded border border-violet-200 text-violet-700 disabled:opacity-45 disabled:cursor-not-allowed hover:bg-violet-50"
                >
                  Prev
                </button>
                <span className="text-[11px] text-violet-800 font-medium">
                  {ganttPage}/{ganttTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setTimelinePage((p) => Math.min(ganttTotalPages, p + 1))}
                  disabled={ganttPage >= ganttTotalPages}
                  className="px-2 py-1 text-[11px] rounded border border-violet-200 text-violet-700 disabled:opacity-45 disabled:cursor-not-allowed hover:bg-violet-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {timelineTasks.length === 0 ? (
          <p className="text-sm text-violet-600">No planned ranges in this month.</p>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {ganttRows.map((row) => (
              <div key={row.task.id} className="rounded-xl border border-violet-100/90 bg-white px-3 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => onSelectTask(row.task)}
                    className="text-left min-w-0 flex-1"
                  >
                    <span className="block text-sm font-semibold text-gray-900 truncate">{row.task.title}</span>
                    <span className="block text-[11px] text-violet-700">
                      {formatTaskPlanningWindow(row.task)} ({row.spanDays}d)
                      {row.customerName ? ` · ${row.customerName}` : ''}
                    </span>
                  </button>
                  {onOpenCustomerWorkspace && row.accountId ? (
                    <button
                      type="button"
                      title="Open account in Customer Management"
                      onClick={() => {
                        if (!row.accountId) return;
                        onOpenCustomerWorkspace(row.accountId, row.task.opportunityId ?? null);
                      }}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100"
                    >
                      <PanelRightOpen className="h-4 w-4" aria-hidden strokeWidth={2} />
                    </button>
                  ) : null}
                </div>
                <div className="relative h-7 rounded-lg bg-violet-50/70 ring-1 ring-violet-100/90 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 right-0 opacity-55"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(to right, rgba(109,40,217,0.12) 0, rgba(109,40,217,0.12) 1px, transparent 1px, transparent calc(100% / 31))',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onSelectTask(row.task)}
                    className={`absolute top-1 bottom-1 rounded-md ${STATUS_BAR_CLASS[row.task.status]} shadow-sm hover:brightness-95`}
                    style={{
                      left: `${row.leftPct}%`,
                      width: `${Math.max(row.widthPct, 1.8)}%`,
                    }}
                    title={`${row.task.title} · ${formatTaskPlanningWindow(row.task) ?? 'No range'}`}
                    aria-label={`Open task ${row.task.title}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="border-t border-violet-100/80 px-4 py-4 bg-gradient-to-br from-[#faf8ff]/90 to-white">
          <p className="text-sm font-semibold text-violet-950 mb-2">
            Tasks on {format(selectedDate, 'MMM d, yyyy')}
          </p>
          {tasksOnSelected.length === 0 ? (
            <p className="text-sm text-violet-600">No tasks planned across this date.</p>
          ) : (
            <ul className="space-y-2">
              {tasksOnSelected.map((t) => {
                const opp = t.opportunityId ? opportunities.find((o) => o.id === t.opportunityId) : null;
                const accountId = t.customerId ?? opp?.customerId ?? null;
                const cust = accountId ? customers.find((c) => c.id === accountId) : null;
                const span = formatTaskPlanningWindow(t);
                return (
                  <li key={t.id} className="flex gap-2 items-stretch">
                    <button
                      type="button"
                      onClick={() => onSelectTask(t)}
                      className="flex-1 min-w-0 text-left text-sm rounded-xl border border-[#e8e4ff] bg-white px-3 py-2 hover:bg-[#9381FF]/8 hover:border-[#9381FF]/35 hover:shadow-[0_6px_18px_-10px_rgba(147,129,255,0.4)] transition-all"
                    >
                      <span className="font-medium">{t.title}</span>
                      {span ? <span className="block text-xs text-violet-700 font-medium">{span}</span> : null}
                      {cust ? <span className="block text-xs text-gray-500">{cust.customerName}</span> : null}
                      {t.links && t.links.length > 0 ? (
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                          {t.links.slice(0, 2).map((lnk) => {
                            const href = taskLinkHref(lnk.url);
                            return (
                              <a
                                key={lnk.id}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 font-semibold text-violet-700 hover:underline truncate max-w-[10rem]"
                              >
                                <Link2 className="h-3 w-3 shrink-0" aria-hidden />
                                {lnk.label?.trim() || href.replace(/^https?:\/\//i, '').split('/')[0]}
                              </a>
                            );
                          })}
                          {t.links.length > 2 ? (
                            <span className="text-gray-400">+{t.links.length - 2}</span>
                          ) : null}
                        </span>
                      ) : null}
                      <span className="text-[10px] text-gray-400">Last action {safeFormatDate(t.lastActionedAt)}</span>
                    </button>
                    {onOpenCustomerWorkspace && accountId ? (
                      <button
                        type="button"
                        title="Open account in Customer Management"
                        aria-label={`Open account in Customer Management${cust ? `: ${cust.customerName}` : ''}`}
                        onClick={() => onOpenCustomerWorkspace(accountId, t.opportunityId ?? null)}
                        className="shrink-0 self-center flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100"
                      >
                        <PanelRightOpen className="h-4 w-4" aria-hidden strokeWidth={2} />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
