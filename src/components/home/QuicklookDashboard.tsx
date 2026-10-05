'use client';

import { format } from 'date-fns';
import { AlertTriangle, CalendarDays, Kanban, Target } from 'lucide-react';
import type { QuicklookStats } from '@/domain/engagement-hub/quicklookStats';

interface QuicklookDashboardProps {
  stats: QuicklookStats;
  onOpenTasks: () => void;
  onOpenCustomer?: (customerId: string) => void;
}

export function QuicklookDashboard({ stats, onOpenTasks, onOpenCustomer }: QuicklookDashboardProps) {
  return (
    <section
      aria-label="Quicklook dashboard"
      className="mb-7 rounded-[1.35rem] border border-[#dcd5ff]/90 bg-white/[0.97] p-5 sm:p-6 hub-soft-shadow ring-1 ring-[#9381FF]/[0.08]"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-600/90">Quicklook</p>
          <h2 className="text-lg font-extrabold text-gray-950 tracking-tight">Pipeline &amp; week ahead</h2>
        </div>
        <button
          type="button"
          onClick={onOpenTasks}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white bg-[#9381FF] hover:bg-[#8370ee] transition-colors"
        >
          <Kanban className="h-4 w-4" aria-hidden />
          Open Kanban
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <MiniStat icon={Target} label="Active pipeline opps" value={stats.activePipelineOpps} />
        <MiniStat icon={Kanban} label="In progress tasks" value={stats.inProgressTasks} />
        <MiniStat icon={CalendarDays} label="Due ≤7 days" value={stats.tasksDueThisWeek.length} />
        <MiniStat icon={AlertTriangle} label="Stale SE (14d+)" value={stats.staleSeCustomers.length} tone="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">This week</h3>
          {stats.tasksDueThisWeek.length === 0 ? (
            <p className="text-sm text-slate-500">No open tasks due in the next 7 days.</p>
          ) : (
            <ul className="space-y-2">
              {stats.tasksDueThisWeek.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-2 rounded-xl bg-slate-50/90 px-3 py-2 text-sm ring-1 ring-black/[0.04]"
                >
                  <span className="shrink-0 text-[11px] font-bold text-violet-700 tabular-nums">
                    {format(t.dueDate ?? t.endDate ?? t.startDate!, 'd MMM')}
                  </span>
                  <span className="font-semibold text-gray-900 leading-snug">{t.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">SE notes need refresh</h3>
          {stats.staleSeCustomers.length === 0 ? (
            <p className="text-sm text-slate-500">No SE-involved profiles over 14 days stale.</p>
          ) : (
            <ul className="space-y-2">
              {stats.staleSeCustomers.map((row) => (
                <li key={row.customerId}>
                  <button
                    type="button"
                    onClick={() => onOpenCustomer?.(row.customerId)}
                    className="w-full text-left flex items-center justify-between gap-2 rounded-xl bg-amber-50/90 px-3 py-2 text-sm ring-1 ring-amber-100 hover:bg-amber-100/90 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 truncate">{row.customerName}</span>
                    <span className="shrink-0 text-[11px] font-bold text-amber-800 tabular-nums">
                      {row.daysSince > 900 ? 'never' : `${row.daysSince}d`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tone = 'violet',
}: {
  icon: typeof Target;
  label: string;
  value: number;
  tone?: 'violet' | 'amber';
}) {
  const ring = tone === 'amber' ? 'ring-amber-100 bg-amber-50/80' : 'ring-violet-100 bg-violet-50/80';
  const iconCl = tone === 'amber' ? 'text-amber-700' : 'text-violet-700';
  return (
    <div className={`rounded-xl px-3 py-2.5 ring-1 ${ring}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        <Icon className={`h-3.5 w-3.5 ${iconCl}`} aria-hidden />
        {label}
      </div>
      <p className="text-2xl font-extrabold text-gray-950 tabular-nums mt-1">{value}</p>
    </div>
  );
}
