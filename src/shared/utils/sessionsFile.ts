import { checkKeepingOrder, sessionsFileSchema, type Session } from '@/shared/validators';

const FILE_INDENT = 1;

export class SessionsFileError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'SessionsFileError';
  }
}

export const formatSessionsFile = (sessions: readonly Session[]): string =>
  JSON.stringify(sessions, null, FILE_INDENT);

export const parseSessionsFile = (text: string): Session[] => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SessionsFileError('sessions.json is not valid JSON.');
  }
  const checked = checkKeepingOrder(sessionsFileSchema, raw);
  if (!checked.ok) {
    throw new SessionsFileError(`sessions.json has a problem: ${checked.issue}`);
  }
  return checked.value;
};
