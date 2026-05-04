import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
  /** Short accessibility hint or clarification (shown under the metric) */
  hint?: string;
}

const COLOR_CLASSES: Record<StatCardProps['color'], string> = {
  blue: 'from-blue-500 to-indigo-600 text-white shadow-lg',
  green: 'from-emerald-500 to-teal-600 text-white shadow-lg',
  purple: 'from-violet-500 to-purple-600 text-white shadow-lg',
  orange: 'from-amber-500 to-orange-600 text-white shadow-lg',
};

export function StatCard({ icon: Icon, label, value, color, hint }: StatCardProps) {
  return (
    <div className="group relative hub-soft-shadow bg-white/95 backdrop-blur-sm p-6 rounded-3xl border border-white/80 ring-1 ring-slate-900/[0.04] hover:border-slate-200/90 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.18)] transition-all duration-300 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white via-transparent to-slate-100/70 opacity-[0.35] group-hover:opacity-[0.55] transition-opacity duration-300" />
      <div className="relative flex items-start gap-4">
        <div className={`p-3.5 rounded-xl bg-gradient-to-br shrink-0 ${COLOR_CLASSES[color]}`}>
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1.5 tracking-tight tabular-nums">{value}</p>
          {hint ? (
            <p className="text-xs text-gray-500 mt-2 leading-snug">{hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
