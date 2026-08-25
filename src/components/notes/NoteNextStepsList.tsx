'use client';

import type { NoteNextStep } from '@/domain/engagement-hub/noteNextSteps';

interface NoteNextStepsListProps {
  steps: NoteNextStep[];
  compact?: boolean;
}

export function NoteNextStepsList({ steps, compact }: NoteNextStepsListProps) {
  if (!steps.length) return null;

  return (
    <ul className={compact ? 'space-y-1' : 'space-y-2'}>
      {steps.map((step) => (
        <li
          key={step.id}
          className={`flex items-start gap-2 text-sm ${step.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}
        >
          <span
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
              step.done ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-300 bg-white'
            }`}
            aria-hidden
          >
            {step.done ? '✓' : ''}
          </span>
          <span className="flex-1">
            {step.label}
            {step.owner ? (
              <span className="ml-2 text-xs font-medium text-gray-500">({step.owner})</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
