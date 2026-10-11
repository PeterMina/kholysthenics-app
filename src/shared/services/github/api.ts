import {
  DATA_BRANCH, DATA_FILE_PATH, DATA_REPO_NAME, DATA_REPO_OWNER, GITHUB_API_URL, GITHUB_API_VERSION, GITHUB_REQUEST_TIMEOUT_MS,
} from '@/shared/constants';
import { decodeBase64Utf8, encodeBase64Utf8, parseSessionsFile } from '@/shared/utils';
import { contentsResponseSchema, putResponseSchema } from '@/shared/validators';
import { errorForResponse, GitHubError, type RemoteFile } from '.';

const CONTENTS_PATH = `/repos/${DATA_REPO_OWNER}/${DATA_REPO_NAME}/contents/${DATA_FILE_PATH}`;

const request = async (token: string, path: string, init: RequestInit = {}): Promise<Response> => {
  let response: Response;
  try {
    response = await fetch(`${GITHUB_API_URL}${path}`, {
      ...init,
      cache: 'no-store',
      // Weak gym signal can leave a request hanging; give up and fall back to the phone's copy.
      signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': GITHUB_API_VERSION,
      },
    });
  } catch {
    throw new GitHubError('network', "No connection to GitHub. Saved on this phone; it will sync when you're online.", null);
  }
  if (!response.ok) throw errorForResponse(response);
  return response;
};

export const fetchSessionsFile = async (token: string): Promise<RemoteFile> => {
  const response = await request(token, `${CONTENTS_PATH}?ref=${encodeURIComponent(DATA_BRANCH)}`);
  const body = contentsResponseSchema.parse(await response.json());
  return { sessions: parseSessionsFile(decodeBase64Utf8(body.content)), sha: body.sha };
};

export const putSessionsFile = async (token: string, text: string, sha: string, message: string): Promise<string> => {
  const response = await request(token, CONTENTS_PATH, {
    method: 'PUT',
    body: JSON.stringify({ message, content: encodeBase64Utf8(text), sha, branch: DATA_BRANCH }),
  });
  return putResponseSchema.parse(await response.json()).content.sha;
};
