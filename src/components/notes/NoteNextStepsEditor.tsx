'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { NoteNextStep } from '@/domain/engagement-hub/noteNextSteps';
import { createNoteNextStep } from '@/domain/engagement-hub/noteNextSteps';

interface NoteNextStepsEditorProps {
  steps: NoteNextStep[];
  onChange: (steps: NoteNextStep[]) => void;
}

export function NoteNextStepsEditor({ steps, onChange }: NoteNextStepsEditorProps) {
  const update = (index: number, patch: Partial<NoteNextStep>) => {
    onChange(steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const remove = (index: number) => {
    onChange(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {steps.length === 0 ? (
        <p className="text-xs text-gray-500">No steps yet — add actionable follow-ups below.</p>
      ) : (
        steps.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-wrap items-start gap-2 rounded-md border border-gray-200 bg-gray-50/80 p-2"
          >
            <input
              type="checkbox"
              checked={step.done}
              onChange={(e) => update(index, { done: e.target.checked })}
              className="mt-2 rounded border-gray-300"
              aria-label="Step done"
            />
            <input
              type="text"
              value={step.label}
              onChange={(e) => update(index, { label: e.target.value })}
              className="min-w-[12rem] flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 bg-white"
              placeholder="What needs to happen?"
            />
            <input
              type="text"
              value={step.owner ?? ''}
              onChange={(e) => update(index, { owner: e.target.value })}
              className="w-24 px-2 py-1.5 text-sm border border-gray-300 rounded-md text-gray-900 bg-white"
              placeholder="Owner"
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
              aria-label="Remove step"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))
      )}
      <button
        type="button"
        onClick={() => onChange([...steps, createNoteNextStep('')])}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <Plus className="h-4 w-4" />
        Add step
      </button>
    </div>
  );
}
