'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { AIButton } from './AIButton';

interface CopyableFieldWithAIProps {
  label: string;
  value: string;
  className?: string;
  textClassName?: string;
  /** Extra context sent to `/api/ai/refine-text` (defaults to label). */
  aiContext?: string;
}

export function CopyableFieldWithAI({
  label,
  value,
  className = '',
  textClassName = '',
  aiContext,
}: CopyableFieldWithAIProps) {
  const [copied, setCopied] = useState(false);
  const display = value?.trim() ? value.trim() : 'Not specified';
  const aiSource = display === 'Not specified' ? '' : display;

  const copyText = async (text: string) => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-lg border ${className}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        <p className={`text-sm text-gray-900 whitespace-pre-wrap ${textClassName}`}>{display}</p>
      </div>
      <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
        {aiSource ? (
          <AIButton
            currentText={aiSource}
            context={aiContext ?? `Customer profile — ${label}. Keep factual; suitable for CRM or executive summary.`}
            onGenerated={(text) => void copyText(text)}
          />
        ) : null}
        <button
          type="button"
          onClick={() => void copyText(display === 'Not specified' ? '' : display)}
          disabled={display === 'Not specified'}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          title="Copy to clipboard"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
