import type { z } from 'zod';

export type Checked<T> = { ok: true; value: T } | { ok: false; issue: string };

export const checkKeepingOrder = <T>(schema: z.ZodType<T>, value: unknown): Checked<T> => {
  const result = schema.safeParse(value);
  if (!result.success) {
    const first = result.error.issues[0];
    const where = first && first.path.length > 0 ? first.path.join('.') : '(root)';
    return { ok: false, issue: first ? `${where}: ${first.message}` : 'unknown problem' };
  }
  // Zod rebuilds objects in schema-key order. Return the original value so the
  // file's key order survives a read and write, keeping git diffs small.
  return { ok: true, value: value as T };
};
