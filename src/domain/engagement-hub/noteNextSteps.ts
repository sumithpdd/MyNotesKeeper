import { MEETING_NOTE_OTHER_FIELDS } from './meetingNoteFields';

/** Actionable step on a customer note (`otherFields.nextSteps`). */
export interface NoteNextStep {
  id: string;
  label: string;
  done: boolean;
  /** e.g. John, Sumith, AE, SC */
  owner?: string;
}

function newStepId() {
  return `ns-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createNoteNextStep(label: string, owner?: string, done = false): NoteNextStep {
  return { id: newStepId(), label: label.trim(), done, ...(owner?.trim() ? { owner: owner.trim() } : {}) };
}

/** Parse legacy string or structured array from Firestore / imports. */
export function parseNoteNextSteps(raw: unknown): NoteNextStep[] {
  if (raw == null) return [];
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return [];
    return t
      .split(/\n+/)
      .map((line) => line.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)
      .map((label) => createNoteNextStep(label));
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (typeof item === 'string') {
        const label = item.trim();
        return label ? createNoteNextStep(label) : null;
      }
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>;
        const label = String(o.label ?? o.text ?? '').trim();
        if (!label) return null;
        return {
          id: String(o.id ?? `ns-${index}`),
          label,
          done: Boolean(o.done),
          ...(o.owner != null && String(o.owner).trim()
            ? { owner: String(o.owner).trim() }
            : {}),
        } satisfies NoteNextStep;
      }
      return null;
    })
    .filter((s): s is NoteNextStep => s != null);
}

export function noteNextStepsFieldKey(): string {
  return MEETING_NOTE_OTHER_FIELDS.nextSteps;
}
