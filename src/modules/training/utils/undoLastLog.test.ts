import { describe, expect, it } from 'vitest';
import { lastUndoable, logSession, mergeUpserts, undoLastLog } from '@/modules/training';
import { formatSessionsFile } from '@/shared/utils';
import { fixtureSessions, readFixtureText } from '@/shared/testing';

const TODAY = '2026-10-12';

describe('undoLastLog', () => {
  it('offers nothing for sessions logged before the app', () => {
    expect(lastUndoable(fixtureSessions())).toBeNull();
    expect(undoLastLog(fixtureSessions(), TODAY)).toBeNull();
  });

  it('restores the file exactly and returns the draft', () => {
    const draft = { lifts: { pullup: [{ reps: 5, kg: 25 }, { reps: 5, kg: 25 }, { reps: 5, kg: 25 }] }, done: { '1': true }, notes: 'ok', date: TODAY };
    const logged = mergeUpserts(fixtureSessions(), logSession(fixtureSessions(), '54', draft, TODAY).upserts);
    const undo = undoLastLog(logged, TODAY);
    expect(undo?.sessionId).toBe('54');
    expect(undo?.message).toBe('chore(log): undo day 54');
    expect(undo?.draft).toEqual(draft);
    const restored = mergeUpserts(logged, undo?.upserts ?? []);
    expect(formatSessionsFile(restored)).toBe(readFixtureText());
  });
});
