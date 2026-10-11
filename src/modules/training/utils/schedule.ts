import { SCHEDULE_FIRST_GAP_ORDER, SCHEDULE_GAPS_DAYS } from '@/modules/training/constants';
import { addDays } from '@/shared/utils';
import type { Session } from '@/shared/validators';
import { blockSessions } from '.';

const CYCLE = SCHEDULE_GAPS_DAYS.length;

export const gapBefore = (order: number): number =>
  SCHEDULE_GAPS_DAYS[(((order - SCHEDULE_FIRST_GAP_ORDER) % CYCLE) + CYCLE) % CYCLE];

/** Due dates for unlogged block sessions. Never earlier than today; nothing is owed. */
export const schedule = (sessions: readonly Session[], today: string): Record<string, string> => {
  const rows = blockSessions(sessions);
  const loggedDates = rows.flatMap((s) => (s.status === 'done' && s.loggedAt ? [s.loggedAt] : [])).sort();
  let previous: string | null = loggedDates.at(-1) ?? null;
  const due: Record<string, string> = {};
  for (const session of rows) {
    if (session.status === 'done') continue;
    const candidate = previous ? addDays(previous, gapBefore(session.order)) : today;
    const isFirst = Object.keys(due).length === 0;
    const date = isFirst && candidate < today ? today : candidate;
    due[session._id] = date;
    previous = date;
  }
  return due;
};
