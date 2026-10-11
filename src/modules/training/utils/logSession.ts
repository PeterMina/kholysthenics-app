import { formatKg } from '@/shared/utils';
import type { AppliedChange, Lift, LoggedSet, Session } from '@/shared/validators';
import { blockSessions, evaluateLift, previousLoggedSets, type SetEntry, type Verdict } from '.';

export interface LogDraft {
  lifts: Record<string, SetEntry[]>;
  done: Record<string, boolean>;
  notes: string;
  date: string;
}

export interface SessionChange {
  upserts: Session[];
  message: string;
  notices: string[];
}

export class LogValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'LogValidationError';
  }
}

type Editor = (id: string) => Session;

const createEditor = (sessions: readonly Session[], working: Map<string, Session>): Editor => (id) => {
  const existing = working.get(id);
  if (existing) return existing;
  const source = sessions.find((s) => s._id === id);
  if (!source) throw new LogValidationError(`Session ${id} not found.`);
  const copy = structuredClone(source);
  working.set(id, copy);
  return copy;
};

const completeSets = (lift: Lift, entries: readonly SetEntry[]): LoggedSet[] =>
  Array.from({ length: lift.sets }, (_, index) => {
    const entry = entries[index];
    if (!entry || entry.reps === null) {
      throw new LogValidationError(`Enter reps for every set of ${lift.name.toLowerCase()} first.`);
    }
    return { reps: entry.reps, kg: lift.bodyweight ? 0 : entry.kg ?? lift.load };
  });

const findLift = (session: Session, key: string): Lift | undefined => session.lifts.find((l) => l.key === key);

const applyNextLoad = (
  sessions: readonly Session[],
  current: Session,
  lift: Lift,
  verdict: Verdict,
  edit: Editor,
  applied: AppliedChange[],
): string | null => {
  if (verdict.nextLoad === null) return null;
  const nextLoad = verdict.nextLoad;
  const upcoming = blockSessions(sessions).filter((s) => s.status !== 'done' && s.order > current.order && findLift(s, lift.key));
  const changing = upcoming.filter((s) => findLift(s, lift.key)?.load !== nextLoad);
  for (const session of changing) {
    const target = findLift(edit(session._id), lift.key);
    if (!target) continue;
    applied.push({ id: session._id, key: lift.key, field: 'load', from: target.load, to: nextLoad });
    target.load = nextLoad;
  }
  if (changing.length === 0) return null;
  const plural = changing.length === 1 ? 'session' : 'sessions';
  return `${lift.name}: next ${changing.length} ${plural} set to +${formatKg(nextLoad)} kg.`;
};

const applyBest = (
  sessions: readonly Session[],
  lift: Lift,
  kgUsed: number,
  edit: Editor,
  applied: AppliedChange[],
): string | null => {
  if (lift.best === null || kgUsed <= lift.best) return null;
  for (const session of blockSessions(sessions).filter((s) => findLift(s, lift.key))) {
    const target = findLift(edit(session._id), lift.key);
    if (!target) continue;
    applied.push({ id: session._id, key: lift.key, field: 'best', from: target.best, to: kgUsed });
    target.best = kgUsed;
  }
  return `New best: ${lift.name.toLowerCase()} +${formatKg(kgUsed)} kg.`;
};

const describeSets = (lift: Lift, sets: readonly LoggedSet[], kgUsed: number): string =>
  `${lift.name.toLowerCase()} ${sets.map((s) => s.reps).join('/')}${lift.bodyweight ? '' : ` @ ${formatKg(kgUsed)}kg`}`;

const checkLoggable = (session: Session | undefined, sessionId: string, draft: LogDraft, today: string): Session => {
  if (!session) throw new LogValidationError(`Session ${sessionId} not found.`);
  if (session.status === 'done') throw new LogValidationError(`Day ${session.day} is already logged.`);
  if (draft.date > today) throw new LogValidationError("The training date can't be in the future.");
  return session;
};

export const logSession = (sessions: readonly Session[], sessionId: string, draft: LogDraft, today: string): SessionChange => {
  const session = checkLoggable(sessions.find((s) => s._id === sessionId), sessionId, draft, today);
  const working = new Map<string, Session>();
  const edit = createEditor(sessions, working);
  const applied: AppliedChange[] = [];
  const notices: string[] = [];
  const loggedLifts: Record<string, LoggedSet[]> = {};
  const parts: string[] = [];

  for (const lift of session.lifts) {
    const sets = completeSets(lift, draft.lifts[lift.key] ?? []);
    const verdict = evaluateLift(lift, sets, previousLoggedSets(sessions, lift.key, session.order));
    const kgUsed = verdict.kgUsed ?? lift.load;
    loggedLifts[lift.key] = sets;
    parts.push(describeSets(lift, sets, kgUsed));
    const loadNotice = applyNextLoad(sessions, session, lift, verdict, edit, applied);
    const bestNotice = applyBest(sessions, lift, kgUsed, edit, applied);
    notices.push(...[loadNotice, bestNotice].filter((n): n is string => n !== null));
  }

  const logged = edit(session._id);
  logged.status = 'done';
  logged.loggedAt = draft.date;
  logged.log = { lifts: loggedLifts, done: draft.done, notes: draft.notes };
  logged.applied = applied;

  const summary = parts.length > 0 ? ` — ${parts.join(', ')}` : '';
  return { upserts: [...working.values()], message: `chore(log): day ${session.day} ${session.type.toLowerCase()}${summary}`, notices };
};
