import { z } from 'zod';
import { SESSION_TYPES } from '.';

export const HISTORY_FILTERS = ['all', ...SESSION_TYPES] as const;
export const historySearchSchema = z.object({
  type: z.enum(HISTORY_FILTERS).optional().catch(undefined),
});
export type HistoryFilter = (typeof HISTORY_FILTERS)[number];
