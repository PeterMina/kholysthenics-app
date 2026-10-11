import { z } from 'zod';

export const contentsResponseSchema = z.object({
  sha: z.string().min(1),
  content: z.string(),
  encoding: z.literal('base64'),
});

export const putResponseSchema = z.object({
  content: z.object({ sha: z.string().min(1) }),
});
