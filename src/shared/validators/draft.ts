import { z } from 'zod';

export const setEntrySchema = z.object({ reps: z.number().nonnegative().nullable(), kg: z.number().nonnegative().nullable() });

export const logDraftSchema = z.object({
  lifts: z.record(z.string(), z.array(setEntrySchema)),
  done: z.record(z.string(), z.boolean()),
  notes: z.string(),
  date: z.string(),
});
