// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { clearToken, getToken, setToken } from '@/shared/services';

beforeEach(() => localStorage.clear());

describe('token storage', () => {
  it('stores a trimmed token and clears it', () => {
    expect(getToken()).toBeNull();
    setToken('  github_pat_example \n');
    expect(getToken()).toBe('github_pat_example');
    clearToken();
    expect(getToken()).toBeNull();
  });
});
