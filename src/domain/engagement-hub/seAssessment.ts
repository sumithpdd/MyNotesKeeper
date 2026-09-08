import type { SEInvolvement, SERagAssessment } from '@/types/customer';

/** Selectable SE involvement values, in picker order. */
export const SE_INVOLVEMENT_OPTIONS: readonly SEInvolvement[] = [
  '',
  'Yes',
  'No',
  'Not Needed',
] as const;

/** Selectable RAG values, in picker order. */
export const SE_RAG_OPTIONS: readonly SERagAssessment[] = [
  '',
  'Green',
  'Yellow',
  'Red',
  'Not Applicable',
] as const;

const norm = (raw: unknown) => String(raw ?? '').trim().toLowerCase();

/**
 * Read SE involvement from Firestore or a CRM export.
 *
 * Legacy Hub records stored this as a boolean, so `true`/`false` must keep
 * working. A legacy `false` is genuinely ambiguous — it could have meant
 * "not involved" or "not needed" — so it maps to `'No'`, the value that
 * surfaces rather than hides the gap.
 */
export function parseSEInvolvement(raw: unknown): SEInvolvement {
  if (raw === true) return 'Yes';
  if (raw === false) return 'No';

  switch (norm(raw)) {
    case 'yes':
    case 'y':
    case 'true':
      return 'Yes';
    case 'no':
    case 'n':
    case 'false':
      return 'No';
    case 'not needed':
    case 'not-needed':
    case 'notneeded':
    case 'n/a needed':
      return 'Not Needed';
    default:
      return '';
  }
}

/** Read a RAG assessment from Firestore or a CRM export. `-` and blanks are unset. */
export function parseSERag(raw: unknown): SERagAssessment {
  switch (norm(raw)) {
    case 'green':
      return 'Green';
    case 'yellow':
    case 'amber':
      return 'Yellow';
    case 'red':
      return 'Red';
    case 'not applicable':
    case 'not-applicable':
    case 'n/a':
    case 'na':
      return 'Not Applicable';
    default:
      return '';
  }
}

/** True when the SE deliberately answered, as opposed to leaving it blank. */
export function isSERagAnswered(value: SERagAssessment): boolean {
  return value !== '';
}

/**
 * Badge tone for a RAG value. `'Not Applicable'` must never render as red —
 * a deliberate N/A is not a risk signal, and colouring it red invents alarm.
 */
export function seRagTone(value: SERagAssessment): 'green' | 'amber' | 'red' | 'gray' {
  switch (value) {
    case 'Green':
      return 'green';
    case 'Yellow':
      return 'amber';
    case 'Red':
      return 'red';
    default:
      return 'gray';
  }
}

/** Tailwind classes matching `seRagTone`, for inline badges. */
export function seRagBadgeClasses(value: SERagAssessment): string {
  switch (seRagTone(value)) {
    case 'green':
      return 'bg-green-100 text-green-800';
    case 'amber':
      return 'bg-yellow-100 text-yellow-800';
    case 'red':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/** Display label; unset renders as `Not Set` rather than an empty badge. */
export function seRagLabel(value: SERagAssessment): string {
  return value === '' ? 'Not Set' : value;
}

/** Display label for SE involvement; unset renders as `Not Set`. */
export function seInvolvementLabel(value: SEInvolvement): string {
  return value === '' ? 'Not Set' : value;
}
