import { z } from 'zod';
import { sessionSchema } from '.';

export const pendingChangeSchema = z.object({
  upserts: z.array(sessionSchema),
  message: z.string().min(1),
});
/** A stored list read as-is; its entries are validated one by one. */
export const storedListSchema = z.array(z.unknown());
export const cachedSessionsSchema = z.array(sessionSchema);
export const lastSyncSchema = z.string();

export type PendingChange = z.infer<typeof pendingChangeSchema>;
