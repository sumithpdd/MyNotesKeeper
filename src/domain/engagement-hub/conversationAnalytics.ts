/**
 * Call / meeting conversation analytics (Gong-style trackers).
 * Counts measure how often a topic surfaced — coverage, not deal quality.
 * Pair with `dealQualification.ts` for deliberate MEDDPICC/BANT scores.
 */

import type { DealQualification, MeddpiccElementId, BantElementId } from './dealQualification';

export interface ConversationTrackerHit {
  id: string;
  label: string;
  count: number;
  /** Optional per-tracker help (overrides section default). */
  helpText?: string;
}

export interface ConversationAnalyticsSection {
  id: string;
  title: string;
  /** Shown next to section title (?) — what this block means. */
  helpText: string;
  kind: 'methodology' | 'questions' | 'ai' | 'keywords' | 'filler' | 'messaging';
  hits: ConversationTrackerHit[];
}

export interface ConversationAnalytics {
  sections: ConversationAnalyticsSection[];
  source?: string;
  recordedAt?: Date | string;
}

/** Framework glossary for UI tooltips and docs. */
export const SALES_FRAMEWORK_GLOSSARY = {
  command_of_the_message: {
    title: 'Command of the Message',
    summary:
      'Sitecore sales messaging: contrast the customer’s world before and after adoption, tie to positive business outcomes, surface negative consequences of inaction, and confirm required capabilities.',
  },
  meddpicc: {
    title: 'MEDDPICC',
    summary:
      'Enterprise qualification: Metrics, Economic buyer, Decision criteria, Decision process, Paper process, Identify pain, Champion, Competition. Counts show how often each theme appeared on calls — not whether it is satisfied.',
  },
  bant: {
    title: 'BANT',
    summary:
      'Classic qualification: Budget, Authority, Need, Timeline. Useful for early-stage fit; counts reflect how much each topic was discussed.',
  },
  questions: {
    title: 'Questions',
    summary:
      'Who drove discovery — your team vs the customer or partner. Balanced questioning usually signals a healthy dialogue.',
  },
  ai_trackers: {
    title: 'AI trackers',
    summary:
      'Themes an AI model detected across the conversation: objections, motives, strategic goals, product feedback, next steps, and product-specific topics (e.g. SitecoreAI).',
  },
  keyword_trackers: {
    title: 'Keyword trackers',
    summary:
      'Exact or near-exact phrase matches (discovery questions, objection language). Useful for coaching talk tracks.',
  },
  filler_words: {
    title: 'Filler words',
    summary:
      'Low-information words (e.g. “like”, “basically”) — coaching signal for clarity and confidence, not deal health.',
  },
} as const;

const MEDDPICC_LABEL_TO_ID: Record<string, MeddpiccElementId> = {
  metrics: 'metrics',
  'economic buyer': 'economic_buyer',
  'decision criteria': 'decision_criteria',
  'decision process': 'decision_process',
  'paper process': 'paper_process',
  'identify pain': 'identify_pain',
  pain: 'identify_pain',
  champion: 'champion',
  competition: 'competition',
};

const BANT_LABEL_TO_ID: Record<string, BantElementId> = {
  budget: 'budget',
  authority: 'authority',
  need: 'need',
  timeline: 'timeline',
};

function normLabel(s: string): string {
  return s.trim().toLowerCase();
}

export function parseConversationAnalytics(raw: unknown): ConversationAnalytics | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as ConversationAnalytics;
  if (!Array.isArray(o.sections)) return undefined;
  return {
    sections: o.sections.filter((s) => s && typeof s.title === 'string' && Array.isArray(s.hits)),
    source: typeof o.source === 'string' ? o.source : undefined,
    recordedAt: o.recordedAt,
  };
}

/** Merge analytics mention counts into deal qualification signalCount fields. */
export function mergeAnalyticsIntoQualification(
  qualification: DealQualification | undefined,
  analytics: ConversationAnalytics | undefined,
): DealQualification {
  const base: DealQualification = qualification ? { ...qualification } : {};
  if (!analytics?.sections.length) return base;

  base.meddpicc = { ...base.meddpicc };
  base.bant = { ...base.bant };

  for (const section of analytics.sections) {
    if (section.id === 'meddpicc' || section.title.toLowerCase().includes('meddpicc')) {
      for (const hit of section.hits) {
        const id = MEDDPICC_LABEL_TO_ID[normLabel(hit.label)];
        if (!id) continue;
        base.meddpicc![id] = {
          ...base.meddpicc![id],
          signalCount: hit.count,
        };
      }
    }
    if (section.id === 'bant' || section.title.toLowerCase() === 'bant') {
      for (const hit of section.hits) {
        const id = BANT_LABEL_TO_ID[normLabel(hit.label)];
        if (!id) continue;
        base.bant![id] = {
          ...base.bant![id],
          signalCount: hit.count,
        };
      }
    }
  }

  if (!base.source && analytics.source) base.source = analytics.source;
  return base;
}

/** Example snapshot shape (e.g. from Gong export) — used for seeds and empty state docs. */
export function sampleConversationAnalytics(): ConversationAnalytics {
  return {
    source: 'Conversation intelligence (example)',
    recordedAt: new Date().toISOString(),
    sections: [
      {
        id: 'command_of_the_message',
        title: 'Command of the Message',
        kind: 'messaging',
        helpText: SALES_FRAMEWORK_GLOSSARY.command_of_the_message.summary,
        hits: [
          { id: 'pbo', label: 'After scenario-Positive Business Outcomes', count: 2 },
          { id: 'nbo', label: 'Before scenario-Negative outcomes', count: 1 },
          { id: 'cap', label: 'Required capabilities', count: 2 },
        ],
      },
      {
        id: 'meddpicc',
        title: 'MEDDPICC',
        kind: 'methodology',
        helpText: SALES_FRAMEWORK_GLOSSARY.meddpicc.summary,
        hits: [
          { id: 'decision_process', label: 'Decision Process', count: 2 },
          { id: 'identify_pain', label: 'Identify Pain', count: 21 },
          { id: 'champion', label: 'Champion', count: 3 },
          { id: 'competition', label: 'Competition', count: 12 },
        ],
      },
      {
        id: 'bant',
        title: 'BANT',
        kind: 'methodology',
        helpText: SALES_FRAMEWORK_GLOSSARY.bant.summary,
        hits: [{ id: 'timeline', label: 'Timeline', count: 2 }],
      },
      {
        id: 'questions',
        title: 'Questions',
        kind: 'questions',
        helpText: SALES_FRAMEWORK_GLOSSARY.questions.summary,
        hits: [
          { id: 'sitecore', label: 'Asked by Sitecore', count: 3 },
          { id: 'other', label: 'Asked by Other', count: 4 },
        ],
      },
      {
        id: 'ai_trackers',
        title: 'AI trackers',
        kind: 'ai',
        helpText: SALES_FRAMEWORK_GLOSSARY.ai_trackers.summary,
        hits: [
          { id: 'fear', label: 'Fear/Risk Motive', count: 6 },
          { id: 'next', label: 'Next steps', count: 4 },
          { id: 'feedback', label: 'Product feedback', count: 9 },
          { id: 'progression', label: 'Seller deal progression patterns', count: 9 },
          { id: 'demo', label: 'Demo Feedback', count: 1 },
          { id: 'security', label: 'Security/Stability Motive', count: 2 },
          { id: 'objections', label: 'Customer objections', count: 13 },
          { id: 'convenience', label: 'Convenience/Pain Elimination Motive', count: 7 },
          { id: 'goals', label: 'Strategic business goals', count: 19 },
          { id: 'sitecoreai', label: 'SitecoreAI', count: 3 },
          { id: 'concerns', label: 'Customer concerns', count: 18 },
        ],
      },
      {
        id: 'keyword_trackers',
        title: 'Keyword trackers',
        kind: 'keywords',
        helpText: SALES_FRAMEWORK_GLOSSARY.keyword_trackers.summary,
        hits: [
          { id: 'disc_what', label: 'Discovery: what do you', count: 2 },
          { id: 'obj_business', label: 'Objections: business', count: 1 },
        ],
      },
      {
        id: 'filler_words',
        title: 'Filler words',
        kind: 'filler',
        helpText: SALES_FRAMEWORK_GLOSSARY.filler_words.summary,
        hits: [
          { id: 'basically', label: 'basically', count: 0 },
          { id: 'kindof', label: 'kind of', count: 0 },
          { id: 'like', label: 'like', count: 0 },
        ],
      },
    ],
  };
}
