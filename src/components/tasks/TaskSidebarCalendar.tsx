'use client';

import { useEffect, useMemo, useState } from 'react';
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
  max,
  min,
  eachDayOfInterval,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EngagementTask } from '@/types';
import { getTaskPlanningRange } from '@/lib/taskPlanningRange';

interface TaskSidebarCalendarProps {
  /** Tasks that already match search/board filters — dots reflect this set only */
  tasks: EngagementTask[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

/** Week grids start Monday — matches Tasks calendar primary view */
const WEEK_OPTS = { weekStartsOn: 1 as const };

export function TaskSidebarCalendar({ tasks, selectedDate, onSelectDate }: TaskSidebarCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    if (!selectedDate) return;
    setViewMonth((prev) => (isSameMonth(selectedDate, prev) ? prev : startOfMonth(selectedDate)));
  }, [selectedDate]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
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

  const datesWithPlanningTasks = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      const r = getTaskPlanningRange(t);
      if (!r) return;
      const from = startOfDay(max([r.start, calendarStart]));
      const to = startOfDay(min([r.end, calendarEnd]));
      if (from.getTime() > to.getTime()) return;
      for (const d of eachDayOfInterval({ start: from, end: to })) {
        set.add(format(d, 'yyyy-MM-dd'));
      }
    });
    return set;
  }, [tasks, calendarStart, calendarEnd]);

  const weekLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="rounded-[1.35rem] border border-[#e8e4ff] bg-white/[0.97] backdrop-blur-sm hub-soft-shadow ring-1 ring-[#9381FF]/[0.07] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-100/80 bg-gradient-to-br from-[#faf8ff] to-white">
        <h3 className="text-base font-bold text-gray-900 tracking-tight">{format(viewMonth, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            className="p-2 rounded-xl text-violet-600 hover:bg-[#9381FF]/15 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setViewMonth(startOfMonth(new Date()))}
            className="text-xs font-semibold px-3 py-1.5 rounded-full text-[#9381FF] hover:bg-[#9381FF]/12"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-xl text-violet-600 hover:bg-[#9381FF]/15 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-7 gap-y-2 text-[11px] font-bold text-violet-300 text-center uppercase tracking-wider mb-2">
          {weekLetters.map((w, idx) => (
            <span key={`${idx}-${w}`}>{w}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-x-2 gap-y-3">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const muted = !isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const selected = !!(selectedDate && isSameDay(day, selectedDate));
            const hasTasks = datesWithPlanningTasks.has(key);

            return (
              <div key={key} className="flex flex-col items-center justify-start min-h-[2.75rem]">
                <button
                  type="button"
                  onClick={() => (selected ? onSelectDate(null) : onSelectDate(day))}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
                    muted ? 'text-violet-200/90' : 'text-gray-800'
                  } ${
                    selected
                      ? 'bg-[#9381FF] text-white shadow-[0_4px_14px_-4px_#9381FF]'
                      : isToday && !muted
                        ? 'ring-2 ring-[#9381FF]/60 ring-offset-2 ring-offset-white'
                        : !muted && hasTasks
                          ? 'hover:bg-violet-100/80'
                          : !muted
                            ? 'hover:bg-gray-100/80'
                            : ''
                  }`}
                  aria-pressed={selected}
                  aria-label={
                    selected
                      ? `Clear filter, ${format(day, 'MMM d yyyy')}`
                      : `Tasks planned ${format(day, 'MMM d yyyy')}`
                  }
                >
                  {format(day, 'd')}
                </button>
                {hasTasks && !muted ? (
                  <span
                    className={`mt-0.5 block h-[5px] w-[5px] rounded-full shrink-0 ${
                      selected ? 'bg-white' : 'bg-[#9381FF]'
                    }`}
                    aria-hidden
                  />
                ) : (
                  <span className="mt-0.5 block h-[5px] w-[5px] shrink-0" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="px-4 pb-4 pt-1 text-[11px] font-medium leading-relaxed text-violet-500/90 border-t border-violet-100/70 bg-[#faf8ff]/60">
        Tap a highlighted day when a task plan touches it to filter the board. Tap again on the purple day to clear.
      </p>
    </div>
  );
}
