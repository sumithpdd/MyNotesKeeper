'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { EntityCompleteness } from '@/domain/engagement-hub/completeness';

/**
 * Shows how complete one record is, and what is missing.
 *
 * The score is the hook; the list of missing fields is the point. Each gap
 * carries the reason it matters so the panel reads as a worklist rather than a
 * grade.
 */

function toneFor(score: number): { bar: string; text: string; ring: string } {
  if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-700', ring: 'border-green-200' };
  if (score >= 50) return { bar: 'bg-yellow-500', text: 'text-yellow-700', ring: 'border-yellow-200' };
  return { bar: 'bg-red-500', text: 'text-red-700', ring: 'border-red-200' };
}

interface CompletenessBarProps {
  score: number;
  label?: string;
  compact?: boolean;
}

/** Inline score bar — usable in list rows and headers. */
export function CompletenessBar({ score, label, compact = false }: CompletenessBarProps) {
  const tone = toneFor(score);
  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {label && <span className="text-gray-600">{label}</span>}
      <div
        className={`${compact ? 'h-1.5 w-16' : 'h-2 w-28'} rounded-full bg-gray-200 overflow-hidden`}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ? `${label} completeness` : 'Completeness'}
      >
        <div className={`h-full ${tone.bar} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-medium tabular-nums ${tone.text}`}>{score}%</span>
    </div>
  );
}

interface CompletenessPanelProps {
  completeness: EntityCompleteness;
  /** Collapsed by default in dense views. */
  defaultOpen?: boolean;
  className?: string;
}

export function CompletenessPanel({
  completeness,
  defaultOpen = false,
  className = '',
}: CompletenessPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const tone = toneFor(completeness.score);
  const { requiredMissing, recommendedMissing } = completeness;
  const totalMissing = requiredMissing.length + recommendedMissing.length;

  return (
    <div className={`rounded-lg border ${tone.ring} bg-white ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg"
      >
        <div className="flex items-center gap-3 min-w-0">
          {totalMissing === 0 ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          ) : (
            <AlertCircle className={`h-5 w-5 shrink-0 ${tone.text}`} />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">Record completeness</p>
            <p className="text-xs text-gray-600">
              {totalMissing === 0
                ? 'Everything recorded'
                : `${requiredMissing.length} required, ${recommendedMissing.length} recommended still to fill`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <CompletenessBar score={completeness.score} />
          {open ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {open && totalMissing > 0 && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-3">
          {requiredMissing.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-2">
                Required ({requiredMissing.length})
              </h4>
              <ul className="space-y-2">
                {requiredMissing.map((m) => (
                  <li key={m.id} className="text-sm">
                    <span className="font-medium text-gray-900">{m.label}</span>
                    <span className="block text-xs text-gray-600">{m.why}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendedMissing.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Recommended ({recommendedMissing.length})
              </h4>
              <ul className="space-y-2">
                {recommendedMissing.map((m) => (
                  <li key={m.id} className="text-sm">
                    <span className="font-medium text-gray-800">{m.label}</span>
                    <span className="block text-xs text-gray-600">{m.why}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
