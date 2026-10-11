import { TOKEN_STORAGE_KEY } from '@/shared/constants';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};
