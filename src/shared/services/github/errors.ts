export type GitHubErrorKind = 'auth' | 'forbidden' | 'not_found' | 'conflict' | 'rate_limited' | 'network' | 'unknown';

export class GitHubError extends Error {
  public readonly kind: GitHubErrorKind;
  public readonly status: number | null;

  public constructor(kind: GitHubErrorKind, message: string, status: number | null) {
    super(message);
    this.name = 'GitHubError';
    this.kind = kind;
    this.status = status;
  }
}

const HTTP_UNAUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;
const HTTP_UNPROCESSABLE = 422;
const HTTP_TOO_MANY = 429;
const NO_ACCESS_MESSAGE = "This token can't open the kholysthenics repo. Check its repository access.";

export const errorForResponse = (response: Response): GitHubError => {
  const { status } = response;
  const rateLimited = status === HTTP_TOO_MANY || (status === HTTP_FORBIDDEN && response.headers.get('x-ratelimit-remaining') === '0');
  if (rateLimited) return new GitHubError('rate_limited', 'GitHub is busy. Trying again shortly.', status);
  if (status === HTTP_UNAUTHORIZED) return new GitHubError('auth', 'Your GitHub token no longer works. Replace it in Settings.', status);
  if (status === HTTP_FORBIDDEN) return new GitHubError('forbidden', NO_ACCESS_MESSAGE, status);
  if (status === HTTP_NOT_FOUND) return new GitHubError('not_found', NO_ACCESS_MESSAGE, status);
  if (status === HTTP_CONFLICT || status === HTTP_UNPROCESSABLE) return new GitHubError('conflict', 'The log changed on GitHub. Retrying.', status);
  return new GitHubError('unknown', `GitHub answered ${status}.`, status);
};
