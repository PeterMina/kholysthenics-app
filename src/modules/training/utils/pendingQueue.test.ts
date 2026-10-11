// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { enqueuePending, readPending } from '@/modules/training';
import { PENDING_QUEUE_KEY } from '@/shared/constants';
import { fixtureSessions } from '@/shared/testing';

beforeEach(() => localStorage.clear());

describe('pending queue', () => {
  it('keeps the valid changes when one stored change is invalid', () => {
    const good = { upserts: [fixtureSessions()[60]], message: 'good' };
    const bad = { upserts: [{ ...fixtureSessions()[61], loggedAt: '' }], message: 'bad' };
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify([good, bad]));
    expect(readPending().map((p) => p.message)).toEqual(['good']);
    enqueuePending({ upserts: [], message: 'next' });
    expect(readPending().map((p) => p.message)).toEqual(['good', 'next']);
  });
});
