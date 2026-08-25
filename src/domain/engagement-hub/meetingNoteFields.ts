/**
 * Canonical `CustomerNote.otherFields` keys for structured meeting capture.
 * UI (e.g. NoteForm) and seed scripts should use these strings for consistency.
 */
export const MEETING_NOTE_OTHER_FIELDS = {
  meetingId: 'meetingId',
  meetingType: 'meetingType',
  /** Hypotheses / initiatives / execution backlog for the next account cycle */
  ideasExecution: 'ideasExecution',
  /** Structured checklist (`NoteNextStep[]`) — see `noteNextSteps.ts` */
  nextSteps: 'nextSteps',
} as const;
