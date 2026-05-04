'use client';

import { HelpCircle } from 'lucide-react';

/**
 * Accessible inline help — full text via `title` and screen reader `aria-label`.
 */
export function FieldHint({ text, id }: { text: string; id?: string }) {
  return (
    <span
      id={id}
      className="inline-flex align-middle ml-1 shrink-0"
      title={text}
      role="img"
      aria-label={text}
    >
      <HelpCircle
        className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-help"
        aria-hidden
      />
    </span>
  );
}
