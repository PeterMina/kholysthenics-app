import type { Session } from '@/shared/validators';
import { blockSessions, type LogDraft, type SessionChange } from '.';

export interface UndoResult extends SessionChange {
  sessionId: string;
  draft: LogDraft;
}

export const lastUndoable = (sessions: readonly Session[]): Session | null => {
  const last = blockSessions(sessions)
    .filter((s) => (s.status === 'done' && Array.isArray(s.applied)) || s.status === 'skipped')
    .at(-1);
  return last ?? null;
};

export const undoLastLog = (sessions: readonly Session[], today: string): UndoResult | null => {
  const target = lastUndoable(sessions);
  if (!target) return null;
  const working = new Map<string, Session>();
  const edit = (id: string): Session | undefined => {
    const existing = working.get(id);
    if (existing) return existing;
    const source = sessions.find((s) => s._id === id);
    if (!source) return undefined;
    const copy = structuredClone(source);
    working.set(id, copy);
    return copy;
  };

  for (const change of [...(target.applied ?? [])].reverse()) {
    const lift = edit(change.id)?.lifts.find((l) => l.key === change.key);
    if (!lift) continue;
    if (change.field === 'load' && change.from !== null) lift.load = change.from;
    if (change.field === 'best') lift.best = change.from;
  }

  const reopened = edit(target._id);
  if (!reopened) return null;

  if (target.status === 'skipped') {
    reopened.status = 'planned';
    reopened.skippedAt = null;
    delete reopened.skipReason;
    const empty: LogDraft = { lifts: {}, done: {}, notes: '', date: today };
    return {
      upserts: [...working.values()],
      message: `chore(log): un-skip day ${target.day}`,
      notices: [],
      sessionId: target._id,
      draft: empty,
    };
  }
  const draft: LogDraft = {
    lifts: reopened.log.lifts ?? {},
    done: reopened.log.done ?? {},
    notes: reopened.log.notes ?? '',
    date: reopened.loggedAt ?? today,
  };
  reopened.status = 'planned';
  reopened.loggedAt = null;
  reopened.log = {};
  delete reopened.applied;

  return { upserts: [...working.values()], message: `chore(log): undo day ${target.day}`, notices: [], sessionId: target._id, draft };
};
