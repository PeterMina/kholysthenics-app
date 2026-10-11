import { ARCHIVE_BLOCK } from '@/modules/training/constants';
import type { LoggedSet, Session } from '@/shared/validators';

export const blockSessions = (sessions: readonly Session[]): Session[] =>
  sessions.filter((s) => s.block !== ARCHIVE_BLOCK).sort((a, b) => a.order - b.order);

export const archiveSessions = (sessions: readonly Session[]): Session[] =>
  sessions.filter((s) => s.block === ARCHIVE_BLOCK).sort((a, b) => b.order - a.order);

export const nextSession = (sessions: readonly Session[]): Session | null =>
  blockSessions(sessions).find((s) => s.status !== 'done') ?? null;

export const previousLoggedSets = (
  sessions: readonly Session[],
  key: string,
  beforeOrder: number,
): LoggedSet[] | null => {
  const logged = blockSessions(sessions).filter(
    (s) => s.status === 'done' && s.order < beforeOrder && s.log.lifts?.[key],
  );
  return logged.at(-1)?.log.lifts?.[key] ?? null;
};
