'use client';

import { useState, useMemo } from 'react';
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
} from 'date-fns';
import { ChevronLeft, ChevronRight, FileText, Edit, StickyNote, User, Target } from 'lucide-react';
import type { AccountActivity } from '@/lib/activityUtils';

interface ActivityCalendarProps {
  activities: AccountActivity[];
  onSelectCustomer?: (customerId: string) => void;
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  account_created: FileText,
  account_updated: Edit,
  note_added: StickyNote,
  note_updated: StickyNote,
  profile_updated: User,
  opportunity_created: Target,
  opportunity_updated: Target,
};

const TYPE_COLORS: Record<string, string> = {
  account_created: 'bg-blue-100 text-blue-800',
  account_updated: 'bg-amber-100 text-amber-800',
  note_added: 'bg-green-100 text-green-800',
  note_updated: 'bg-emerald-100 text-emerald-800',
  profile_updated: 'bg-violet-100 text-violet-800',
  opportunity_created: 'bg-purple-100 text-purple-800',
  opportunity_updated: 'bg-fuchsia-100 text-fuchsia-800',
};

export function ActivityCalendar({ activities, onSelectCustomer }: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = useMemo(() => {
    const result: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [calendarStart, calendarEnd]);

  const activitiesByDate = useMemo(() => {
    const map = new Map<string, AccountActivity[]>();
    activities.forEach((a) => {
      const key = format(a.date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    return map;
  }, [activities]);

  const selectedActivities = selectedDate
    ? activitiesByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Activity Calendar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium text-gray-800 min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayActivities = activitiesByDate.get(key) || [];
            const hasActivity = dayActivities.length > 0;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[80px] p-2 rounded-lg border text-left transition-colors ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : hasActivity
                      ? 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50'
                      : 'border-gray-100 hover:border-gray-200'
                } ${!isCurrentMonth ? 'text-gray-400' : ''}`}
              >
                <span className="text-sm font-medium">{format(day, 'd')}</span>
                {hasActivity && (
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {dayActivities.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          a.type === 'account_updated' || a.type === 'note_updated'
                            ? 'bg-amber-500'
                            : a.type === 'note_added'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                        }`}
                        title={a.title}
                      />
                    ))}
                    {dayActivities.length > 3 && (
                      <span className="text-[10px] text-gray-500">+{dayActivities.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day activities */}
        {selectedDate && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            {selectedActivities.length === 0 ? (
              <p className="text-sm text-gray-500">No activity on this day</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedActivities.map((a) => {
                  const Icon = TYPE_ICONS[a.type] || FileText;
                  const colorClass = TYPE_COLORS[a.type] || 'bg-gray-100 text-gray-800';
                  return (
                    <div
                      key={a.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border border-gray-100 ${colorClass} cursor-pointer hover:opacity-90`}
                      onClick={() => onSelectCustomer?.(a.customerId)}
                    >
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">{a.title}</div>
                        <div className="text-xs opacity-90 mt-0.5">{a.customerName}</div>
                        {a.description && (
                          <div className="text-xs mt-1 opacity-80 truncate">{a.description}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
