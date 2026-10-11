import { describe, expect, it } from 'vitest';
import { mergeUpserts } from '@/modules/training';
import { fixtureSessions } from '@/shared/testing';

describe('mergeUpserts', () => {
  it('replaces by _id and keeps array position', () => {
    const remote = fixtureSessions();
    const changed = { ...remote[60], status: 'done' as const };
    const merged = mergeUpserts(remote, [changed]);
    expect(merged).toHaveLength(remote.length);
    expect(merged[60]).toBe(changed);
  });

  it('appends unknown ids once, later upserts winning', () => {
    const remote = fixtureSessions();
    const first = { ...remote[0], _id: 'new', day: 99 };
    const second = { ...first, day: 100 };
    const merged = mergeUpserts(remote, [first, second]);
    expect(merged).toHaveLength(remote.length + 1);
    expect(merged.at(-1)?.day).toBe(100);
  });
});
