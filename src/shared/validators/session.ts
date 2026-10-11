import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const SESSION_TYPES = ['Pull', 'Push', 'Legs', 'Supersets'] as const;
export const sessionTypeSchema = z.enum(SESSION_TYPES);

export const liftSchema = z.looseObject({
  key: z.string().min(1),
  name: z.string().min(1),
  load: z.number().nonnegative(),
  sets: z.number().int().positive(),
  repMin: z.number().int().nonnegative(),
  repMax: z.number().int().positive(),
  best: z.number().nullable(),
  increment: z.number().positive().optional(),
  incrementFast: z.number().positive().optional(),
  maxLoad: z.number().positive().optional(),
  progress: z.literal('reps').optional(),
  perLeg: z.boolean().optional(),
  bodyweight: z.boolean().optional(),
  cue: z.string().optional(),
});

export const loggedSetSchema = z.object({
  reps: z.number().nonnegative(),
  kg: z.number().nonnegative(),
});

export const sessionLogSchema = z.looseObject({
  lifts: z.record(z.string(), z.array(loggedSetSchema)).optional(),
  done: z.record(z.string(), z.boolean()).optional(),
  notes: z.string().optional(),
});

export const appliedChangeSchema = z.object({
  id: z.string(),
  key: z.string(),
  field: z.enum(['load', 'best']),
  from: z.number().nullable(),
  to: z.number(),
});

export const workItemSchema = z.object({ slot: z.string(), text: z.string() });

export const sessionSchema = z.looseObject({
  _id: z.string().min(1),
  day: z.number().int(),
  type: sessionTypeSchema,
  week: z.number().int(),
  order: z.number(),
  block: z.string().min(1),
  status: z.enum(['planned', 'done']),
  loggedAt: z.string().regex(ISO_DATE).nullable(),
  skill: z.object({ name: z.string(), target: z.string() }).optional(),
  lifts: z.array(liftSchema),
  work: z.array(workItemSchema),
  log: sessionLogSchema,
  applied: z.array(appliedChangeSchema).optional(),
  title: z.string().optional(),
  notesText: z.string().optional(),
  handwritten: z.boolean().optional(),
  historical: z.boolean().optional(),
});

export const sessionsFileSchema = z.array(sessionSchema).superRefine((sessions, ctx) => {
  const seen = new Set<string>();
  sessions.forEach((session, index) => {
    if (seen.has(session._id)) {
      ctx.addIssue({ code: 'custom', message: `duplicate _id "${session._id}"`, path: [index, '_id'] });
    }
    seen.add(session._id);
  });
});

export type SessionType = z.infer<typeof sessionTypeSchema>;
export type Lift = z.infer<typeof liftSchema>;
export type LoggedSet = z.infer<typeof loggedSetSchema>;
export type SessionLog = z.infer<typeof sessionLogSchema>;
export type AppliedChange = z.infer<typeof appliedChangeSchema>;
export type WorkItem = z.infer<typeof workItemSchema>;
export type Session = z.infer<typeof sessionSchema>;
