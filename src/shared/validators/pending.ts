import { z } from 'zod';
import { sessionSchema } from '.';

export const pendingChangeSchema = z.object({
  upserts: z.array(sessionSchema),
  message: z.string().min(1),
});
export const pendingQueueSchema = z.array(pendingChangeSchema);
export const cachedSessionsSchema = z.array(sessionSchema);

export type PendingChange = z.infer<typeof pendingChangeSchema>;
