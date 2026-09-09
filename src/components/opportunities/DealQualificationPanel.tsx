'use client';

import { Target, HelpCircle } from 'lucide-react';
import {
  MEDDPICC_ELEMENTS,
  BANT_ELEMENTS,
  LOW_SIGNAL_THRESHOLD,
  qualificationGaps,
  qualificationCoverage,
  type DealQualification,
  type QualificationSignal,
  type QualificationElementDefinition,
} from '@/domain/engagement-hub/dealQualification';

/**
 * MEDDPICC / BANT for one opportunity.
 *
 * Renders `signalCount` and `score` as visibly different things. A signal count
 * is how much a topic came up in conversation — high coverage of pain with no
 * coverage of authority is a real and common shape, and collapsing both into
 * one "score" bar would hide exactly that.
 */

interface Props {
  qualification?: DealQualification;
  className?: string;
}

function signalTone(count: number | undefined): string {
  if (count == null) return 'bg-gray-100 text-gray-500';
  if (count < LOW_SIGNAL_THRESHOLD) return 'bg-red-100 text-red-800';
  if (count < LOW_SIGNAL_THRESHOLD * 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

function ElementRow<T extends string>({
  def,
  signal,
}: {
  def: QualificationElementDefinition<T>;
  signal?: QualificationSignal;
}) {
  const recorded = signal != null && (signal.signalCount != null || signal.score != null);
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{def.label}</p>
        {recorded ? (
          signal?.notes && <p className="text-xs text-gray-600 mt-0.5">{signal.notes}</p>
        ) : (
          <p className="text-xs text-gray-500 mt-0.5 italic">Not recorded — {def.prompt}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {signal?.score != null && (
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            title="Deliberate 0-10 read on how well this element is satisfied"
          >
            score {signal.score}/10
          </span>
        )}
        {signal?.signalCount != null ? (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${signalTone(signal.signalCount)}`}
            title="How often this came up in conversation — coverage, not quality"
          >
            {signal.signalCount} mentions
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            —
          </span>
        )}
      </div>
    </div>
  );
}

export function DealQualificationPanel({ qualification, className = '' }: Props) {
  const coverage = qualificationCoverage(qualification);
  const gaps = qualificationGaps(qualification);

  if (!qualification) {
    return (
      <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Qualification
        </h3>
        <p className="text-sm text-gray-600">
          No MEDDPICC or BANT recorded for this opportunity yet. All 12 elements are open.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Qualification
        </h3>
        <div className="text-right">
          <p className="text-xs text-gray-600">
            MEDDPICC {coverage.meddpicc.recorded}/{coverage.meddpicc.total} · BANT{' '}
            {coverage.bant.recorded}/{coverage.bant.total}
          </p>
          {qualification.source && (
            <p className="text-xs text-gray-500 mt-0.5">{qualification.source}</p>
          )}
        </div>
      </div>

      <div
        className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-md p-3 mb-4"
        role="note"
      >
        <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
        <p>
          <strong>Mentions</strong> measure how much a topic was discussed — coverage, not quality. A
          low count means the conversation never went there.{' '}
          <strong>Score</strong> is a deliberate read on how well the element is satisfied.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">MEDDPICC</h4>
          <div>
            {MEDDPICC_ELEMENTS.map((def) => (
              <ElementRow key={def.id} def={def} signal={qualification.meddpicc?.[def.id]} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-1">BANT</h4>
          <div>
            {BANT_ELEMENTS.map((def) => (
              <ElementRow key={def.id} def={def} signal={qualification.bant?.[def.id]} />
            ))}
          </div>
        </div>
      </div>

      {gaps.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Still to find out ({gaps.length})
          </h4>
          <ul className="space-y-1.5">
            {gaps.slice(0, 6).map((g) => (
              <li key={`${g.framework}-${g.id}`} className="text-sm text-gray-700">
                <span className="font-medium">{g.label}</span>
                <span className="text-gray-500"> · {g.framework}</span>
                {g.reason === 'low-signal' && g.signalCount != null && (
                  <span className="text-gray-500"> · only {g.signalCount} mentions</span>
                )}
                <span className="block text-xs text-gray-600">{g.prompt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
