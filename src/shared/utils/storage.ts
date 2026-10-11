import type { z } from 'zod';
import { checkKeepingOrder } from '@/shared/validators';

export const readJson = <T>(key: string, schema: z.ZodType<T>): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const checked = checkKeepingOrder(schema, JSON.parse(raw));
    return checked.ok ? checked.value : null;
  } catch {
    return null;
  }
};

export const writeJson = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Could not save to this device', error);
  }
};

export const removeKey = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Could not clear from this device', error);
  }
};
