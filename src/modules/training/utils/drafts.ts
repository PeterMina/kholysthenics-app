import { DRAFT_KEY_PREFIX } from '@/shared/constants';
import type { Session } from '@/shared/validators';
import type { LogDraft } from '.';

export const draftKey = (sessionId: string): string => `${DRAFT_KEY_PREFIX}${sessionId}`;

export const emptyDraft = (session: Session, today: string): LogDraft => ({
  lifts: Object.fromEntries(
    session.lifts.map((lift) => [
      lift.key,
      Array.from({ length: lift.sets }, () => ({ reps: null, kg: lift.bodyweight ? 0 : lift.load })),
    ]),
  ),
  done: {},
  notes: '',
  date: today,
});
