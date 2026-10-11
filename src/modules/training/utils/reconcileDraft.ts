import type { Session } from '@/shared/validators';
import { emptyDraft, type LogDraft } from '.';

/**
 * Fits a stored draft to the session as it is now. If the plan changed after
 * the draft was saved (more or fewer sets, a new lift), the entered values
 * are kept and rows are padded or trimmed, so the session can still be logged.
 */
export const reconcileDraft = (draft: LogDraft, session: Session): LogDraft => {
  const blank = emptyDraft(session, draft.date);
  const lifts = Object.fromEntries(
    session.lifts.map((lift) => {
      const stored = draft.lifts[lift.key] ?? [];
      const rows = blank.lifts[lift.key].map((empty, index) => stored[index] ?? empty);
      return [lift.key, rows];
    }),
  );
  return { ...draft, lifts };
};
