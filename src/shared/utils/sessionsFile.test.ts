import { describe, expect, it } from 'vitest';
import { formatSessionsFile, parseSessionsFile, SessionsFileError } from '@/shared/utils';
import { readFixtureText } from '@/shared/testing';

describe('sessions file', () => {
  it('round-trips the real file byte for byte', () => {
    const text = readFixtureText();
    expect(formatSessionsFile(parseSessionsFile(text))).toBe(text);
  });

  it('keeps every session', () => {
    expect(parseSessionsFile(readFixtureText())).toHaveLength(63);
  });

  it('rejects an unknown session type and names the path', () => {
    const broken = readFixtureText().replace('"type": "Pull"', '"type": "Cardio"');
    expect(() => parseSessionsFile(broken)).toThrow(SessionsFileError);
    expect(() => parseSessionsFile(broken)).toThrow(/type/);
  });

  it('rejects duplicate ids', () => {
    const sessions = parseSessionsFile(readFixtureText());
    const duplicated = formatSessionsFile([...sessions, sessions[0]]);
    expect(() => parseSessionsFile(duplicated)).toThrow(/duplicate _id/);
  });

  it('rejects text that is not JSON', () => {
    expect(() => parseSessionsFile('{oops')).toThrow('sessions.json is not valid JSON.');
  });
});
