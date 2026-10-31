import { ISO_DATE_PATTERN, type Session } from '@/shared/validators';
import { LogValidationError, type SessionChange } from '.';

/**
 * Skip a session — injured, ill, travelling.
 *
 * A skip is neither a success nor a failure, so it moves no weight: the load on
 * later sessions is left exactly where it was, to be earned when training resumes.
 * It also never anchors the schedule, because skipping is not training.
 */
export const skipSession = (
  sessions: readonly Session[],
  sessionId: string,
  reason: string,
  today: string,
): SessionChange => {
  const session = sessions.find((s) => s._id === sessionId);
  if (!session) throw new LogValidationError(`Session ${sessionId} not found.`);
  if (session.status === 'done') throw new LogValidationError(`Day ${session.day} is already logged.`);
  if (session.status === 'skipped') throw new LogValidationError(`Day ${session.day} is already skipped.`);
  if (!ISO_DATE_PATTERN.test(today)) throw new LogValidationError('Pick the date.');

  const trimmed = reason.trim();
  if (trimmed.length === 0) throw new LogValidationError('Say why you are skipping, so the gap makes sense later.');

  const skipped = structuredClone(session);
  skipped.status = 'skipped';
  skipped.skippedAt = today;
  skipped.skipReason = trimmed;

  const typeSkips = sessions.filter(
    (s) => s.block === session.block && s.type === session.type && s.status === 'skipped',
  ).length + 1;
  const notices =
    typeSkips >= 2
      ? [`That is ${typeSkips} ${session.type.toLowerCase()} sessions skipped in this block.`]
      : [];

  return {
    upserts: [skipped],
    message: `chore(log): day ${session.day} ${session.type.toLowerCase()} skipped — ${trimmed}`,
    notices,
  };
};
