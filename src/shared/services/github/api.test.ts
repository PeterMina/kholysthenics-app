import { afterEach, describe, expect, it, vi } from 'vitest';
import { DATA_BRANCH } from '@/shared/constants';
import { errorForResponse, fetchSessionsFile, GitHubError, putSessionsFile } from '@/shared/services';
import { decodeBase64Utf8, encodeBase64Utf8 } from '@/shared/utils';
import { readFixtureText } from '@/shared/testing';

const TOKEN = 'test-token';
const jsonResponse = (status: number, body: unknown, headers: Record<string, string> = {}): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const stubFetch = (response: Response | Error): ReturnType<typeof vi.fn> => {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchSessionsFile', () => {
  it('decodes the file and returns its sha', async () => {
    const encoded = encodeBase64Utf8(readFixtureText()).replace(/(.{60})/g, '$1\n');
    const fetchMock = stubFetch(jsonResponse(200, { sha: 'abc', content: encoded, encoding: 'base64' }));
    const file = await fetchSessionsFile(TOKEN);
    expect(file.sha).toBe('abc');
    expect(file.sessions).toHaveLength(63);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`https://api.github.com/repos/PeterMina/kholysthenics/contents/data/sessions.json?ref=${DATA_BRANCH}`);
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${TOKEN}`);
  });

  it.each([
    [401, {}, 'auth'],
    [403, {}, 'forbidden'],
    [403, { 'x-ratelimit-remaining': '0' }, 'rate_limited'],
    [404, {}, 'not_found'],
    [409, {}, 'conflict'],
    [422, {}, 'conflict'],
    [500, {}, 'unknown'],
  ] as const)('maps HTTP %i to %s', async (status, headers, kind) => {
    stubFetch(jsonResponse(status, { message: 'x' }, headers));
    await expect(fetchSessionsFile(TOKEN)).rejects.toMatchObject({ kind });
  });

  it('reports no connection', async () => {
    stubFetch(new TypeError('Failed to fetch'));
    const error = await fetchSessionsFile(TOKEN).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GitHubError);
    expect(error).toMatchObject({ kind: 'network', status: null });
  });
});

describe('putSessionsFile', () => {
  it('sends the text, base sha, branch and message, and returns the new sha', async () => {
    const fetchMock = stubFetch(jsonResponse(200, { content: { sha: 'new-sha' } }));
    const sha = await putSessionsFile(TOKEN, '[\n {"note": "3×3 — ✅"}\n]', 'old-sha', 'chore(log): day 52 legs');
    expect(sha).toBe('new-sha');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('PUT');
    const body = JSON.parse(String(init.body)) as { content: string; sha: string; branch: string; message: string };
    expect(decodeBase64Utf8(body.content)).toBe('[\n {"note": "3×3 — ✅"}\n]');
    expect(body).toMatchObject({ sha: 'old-sha', branch: DATA_BRANCH, message: 'chore(log): day 52 legs' });
  });
});

describe('request timeout', () => {
  it('gives up on a hanging request and reports no connection', async () => {
    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(AbortSignal.abort(new DOMException('timed out', 'TimeoutError')));
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      if (init.signal?.aborted) throw new DOMException('timed out', 'TimeoutError');
      return jsonResponse(200, { content: { sha: 'never' } });
    }));
    await expect(fetchSessionsFile(TOKEN)).rejects.toMatchObject({ kind: 'network' });
  });
});

describe('errorForResponse', () => {
  it('tells the user where to replace an expired token', () => {
    expect(errorForResponse(new Response(null, { status: 401 })).message).toBe(
      'Your GitHub token no longer works. Replace it in Settings.',
    );
  });
});
