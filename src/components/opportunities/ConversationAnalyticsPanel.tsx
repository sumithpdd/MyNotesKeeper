'use client';

import { Sparkles, HelpCircle, MessageSquare } from 'lucide-react';
import {
  parseConversationAnalytics,
  SALES_FRAMEWORK_GLOSSARY,
  type ConversationAnalytics,
  type ConversationAnalyticsSection,
} from '@/domain/engagement-hub/conversationAnalytics';

interface Props {
  analytics?: ConversationAnalytics | unknown;
  className?: string;
}

function SectionHelp({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex ml-1 align-middle">
      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" aria-hidden />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 w-72 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

function HitChip({ label, count }: { label: string; count: number }) {
  const tone =
    count === 0
      ? 'bg-gray-100 text-gray-600 border-gray-200'
      : count >= 10
        ? 'bg-amber-100 text-amber-900 border-amber-200'
        : 'bg-sky-50 text-sky-900 border-sky-200';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      {label}
      {count > 0 && (
        <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
          {count}
        </span>
      )}
    </span>
  );
}

function AnalyticsSection({ section }: { section: ConversationAnalyticsSection }) {
  const showSparkle = section.kind === 'ai' || section.kind === 'methodology' || section.kind === 'messaging';
  return (
    <section className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
        {showSparkle ? (
          <Sparkles className="h-4 w-4 text-violet-500 shrink-0" aria-hidden />
        ) : (
          <MessageSquare className="h-4 w-4 text-gray-400 shrink-0" aria-hidden />
        )}
        {section.title}
        <SectionHelp text={section.helpText} />
      </h4>
      <div className="flex flex-wrap gap-2">
        {section.hits.map((h) => (
          <HitChip key={h.id} label={h.label} count={h.count} />
        ))}
      </div>
    </section>
  );
}

export function ConversationAnalyticsPanel({ analytics: raw, className = '' }: Props) {
  const analytics = parseConversationAnalytics(raw);

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Conversation analytics</h3>
        {analytics?.source && <p className="text-xs text-gray-500 text-right max-w-xs">{analytics.source}</p>}
      </div>

      <div
        className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-md p-3 mb-5"
        role="note"
      >
        <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
        <div className="space-y-2">
          <p>
            <strong>Counts</strong> show how often a topic appeared on recorded conversations (coverage). They do
            not replace MEDDPICC/BANT <strong>scores</strong> in Qualification below.
          </p>
          <p>
            <strong>MEDDPICC</strong> — {SALES_FRAMEWORK_GLOSSARY.meddpicc.summary}
          </p>
          <p>
            <strong>BANT</strong> — {SALES_FRAMEWORK_GLOSSARY.bant.summary}
          </p>
        </div>
      </div>

      {!analytics?.sections?.length ? (
        <p className="text-sm text-gray-600">
          No conversation analytics yet. Import from your call-intelligence tool or add via API seed.
        </p>
      ) : (
        <div className="space-y-4">
          {analytics.sections.map((s) => (
            <AnalyticsSection key={s.id} section={s} />
          ))}
        </div>
      )}
    </div>
  );
}
