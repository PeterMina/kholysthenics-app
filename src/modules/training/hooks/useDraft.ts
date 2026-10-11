import { useLocalStorage } from '@mantine/hooks';
import { useMemo } from 'react';
import { draftKey, emptyDraft, type LogDraft } from '@/modules/training/utils';
import { todayIso } from '@/shared/utils';
import { checkKeepingOrder, logDraftSchema, type Session } from '@/shared/validators';

type DraftState = [LogDraft, (next: LogDraft) => void, () => void];

/** The unsent log for one session, kept on the phone until it is logged. */
export const useDraft = (session: Session): DraftState => {
  const fallback = useMemo(() => emptyDraft(session, todayIso()), [session]);
  const [draft, setDraft, removeDraft] = useLocalStorage<LogDraft>({
    key: draftKey(session._id),
    defaultValue: fallback,
    getInitialValueInEffect: false,
    deserialize: (raw) => {
      if (raw === undefined) return fallback;
      try {
        const checked = checkKeepingOrder(logDraftSchema, JSON.parse(raw));
        return checked.ok ? checked.value : fallback;
      } catch {
        return fallback;
      }
    },
  });
  return [draft, setDraft, removeDraft];
};
