/**
 * Deal qualification: MEDDPICC and BANT.
 *
 * Two different things get called a "score" here, and conflating them loses the
 * signal:
 *
 * - **`signalCount`** — how many times a topic surfaced in a call, per
 *   conversation analytics (Gong trackers and similar). It measures *coverage*:
 *   whether the subject came up at all. A low count means the conversation never
 *   went there, which is a gap in the pursuit, not a judgement about the deal.
 * - **`score`** — a deliberate 0-10 read on how well the element is actually
 *   satisfied. A seller sets this; nothing derives it automatically.
 *
 * A deal can score well on pain and still be unqualified because nobody has met
 * the economic buyer — which is exactly what a low Authority count reveals.
 */

export type MeddpiccElementId =
  | 'metrics'
  | 'economic_buyer'
  | 'decision_criteria'
  | 'decision_process'
  | 'paper_process'
  | 'identify_pain'
  | 'champion'
  | 'competition';

export type BantElementId = 'budget' | 'authority' | 'need' | 'timeline';

export interface QualificationSignal {
  /** Deliberate 0-10 read on how well this element is satisfied. */
  score?: number;
  /** Mentions detected by call analytics — coverage, not quality. */
  signalCount?: number;
  notes?: string;
}

export interface DealQualification {
  meddpicc?: Partial<Record<MeddpiccElementId, QualificationSignal>>;
  bant?: Partial<Record<BantElementId, QualificationSignal>>;
  /** Where the numbers came from, e.g. "Gong call, 5 Sep 2026". */
  source?: string;
  assessedAt?: Date;
}

export interface QualificationElementDefinition<T extends string> {
  id: T;
  label: string;
  /** What a healthy answer looks like — used in UI help and AI guidance. */
  prompt: string;
}

export const MEDDPICC_ELEMENTS: readonly QualificationElementDefinition<MeddpiccElementId>[] = [
  { id: 'metrics', label: 'Metrics', prompt: 'What measurable outcome does the customer expect, in their numbers?' },
  { id: 'economic_buyer', label: 'Economic buyer', prompt: 'Who releases the budget, and have we met them?' },
  { id: 'decision_criteria', label: 'Decision criteria', prompt: 'What must be true for them to choose us?' },
  { id: 'decision_process', label: 'Decision process', prompt: 'What steps and approvals lead to a signature?' },
  { id: 'paper_process', label: 'Paper process', prompt: 'Legal, security, procurement — what does contracting require?' },
  { id: 'identify_pain', label: 'Identify pain', prompt: 'What breaks if they do nothing?' },
  { id: 'champion', label: 'Champion', prompt: 'Who sells for us internally when we are not in the room?' },
  { id: 'competition', label: 'Competition', prompt: 'Who else is in play, including do-nothing and build-it-ourselves?' },
] as const;

export const BANT_ELEMENTS: readonly QualificationElementDefinition<BantElementId>[] = [
  { id: 'budget', label: 'Budget', prompt: 'Is there funding, and in which cycle?' },
  { id: 'authority', label: 'Authority', prompt: 'Who can say yes on their own?' },
  { id: 'need', label: 'Need', prompt: 'What business need drives this now?' },
  { id: 'timeline', label: 'Timeline', prompt: 'What date are they working back from, and why that date?' },
] as const;

/** Below this many mentions, a topic effectively did not get covered. */
export const LOW_SIGNAL_THRESHOLD = 12;

export interface QualificationGap {
  framework: 'MEDDPICC' | 'BANT';
  id: string;
  label: string;
  prompt: string;
  /** `unrecorded` = nothing captured at all; `low-signal` = captured but barely discussed. */
  reason: 'unrecorded' | 'low-signal';
  signalCount?: number;
  score?: number;
}

function gapsFor<T extends string>(
  framework: 'MEDDPICC' | 'BANT',
  definitions: readonly QualificationElementDefinition<T>[],
  values: Partial<Record<T, QualificationSignal>> | undefined,
  threshold: number,
): QualificationGap[] {
  const gaps: QualificationGap[] = [];
  for (const def of definitions) {
    const v = values?.[def.id];
    if (!v || (v.signalCount == null && v.score == null)) {
      gaps.push({ framework, id: def.id, label: def.label, prompt: def.prompt, reason: 'unrecorded' });
      continue;
    }
    if (v.signalCount != null && v.signalCount < threshold) {
      gaps.push({
        framework,
        id: def.id,
        label: def.label,
        prompt: def.prompt,
        reason: 'low-signal',
        signalCount: v.signalCount,
        score: v.score,
      });
    }
  }
  return gaps;
}

/**
 * Elements that are unrecorded or barely discussed — the questions still to ask.
 * Ordered weakest-first so the most urgent gap reads at the top.
 */
export function qualificationGaps(
  qualification: DealQualification | undefined,
  threshold: number = LOW_SIGNAL_THRESHOLD,
): QualificationGap[] {
  if (!qualification) {
    return [
      ...gapsFor('MEDDPICC', MEDDPICC_ELEMENTS, undefined, threshold),
      ...gapsFor('BANT', BANT_ELEMENTS, undefined, threshold),
    ];
  }
  const gaps = [
    ...gapsFor('MEDDPICC', MEDDPICC_ELEMENTS, qualification.meddpicc, threshold),
    ...gapsFor('BANT', BANT_ELEMENTS, qualification.bant, threshold),
  ];
  return gaps.sort((a, b) => {
    if (a.reason !== b.reason) return a.reason === 'unrecorded' ? -1 : 1;
    return (a.signalCount ?? 0) - (b.signalCount ?? 0);
  });
}

/** How many elements have anything recorded at all. */
export function qualificationCoverage(qualification: DealQualification | undefined): {
  meddpicc: { recorded: number; total: number };
  bant: { recorded: number; total: number };
} {
  const count = <T extends string>(
    defs: readonly QualificationElementDefinition<T>[],
    values: Partial<Record<T, QualificationSignal>> | undefined,
  ) =>
    defs.filter((d) => {
      const v = values?.[d.id];
      return v != null && (v.signalCount != null || v.score != null);
    }).length;

  return {
    meddpicc: { recorded: count(MEDDPICC_ELEMENTS, qualification?.meddpicc), total: MEDDPICC_ELEMENTS.length },
    bant: { recorded: count(BANT_ELEMENTS, qualification?.bant), total: BANT_ELEMENTS.length },
  };
}

/** Parse a stored blob back into the typed shape. */
export function parseDealQualification(raw: unknown): DealQualification | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const assessedAt = o.assessedAt;
  return {
    ...(o as DealQualification),
    assessedAt:
      assessedAt == null
        ? undefined
        : assessedAt instanceof Date
          ? assessedAt
          : typeof (assessedAt as { toDate?: unknown }).toDate === 'function'
            ? (assessedAt as { toDate: () => Date }).toDate()
            : new Date(assessedAt as string),
  };
}
