/**
 * One line a day, from this program and from his own logged data.
 * Deliberately not attributed to Kholy: putting invented words in a real
 * person's mouth is not something this app should do.
 */
export type TrainingLine = { readonly text: string; readonly source: string };

export const DAILY_LINES: readonly TrainingLine[] = [
  { text: 'Write the reps you got, not the reps you planned.', source: 'the rule' },
  { text: 'The gap is the enemy, not the weight.', source: 'your own data' },
  { text: 'Two days off is rest. Nine is a restart.', source: 'your own data' },
  { text: 'Max the range on all three, then earn the next kilo.', source: 'the rule' },
  { text: 'Miss a day and nothing is owed. Train today.', source: 'the rule' },
  { text: 'The lever is the load.', source: 'skill work' },
  { text: 'A flat back with bent knees beats a sagging back with straight legs.', source: 'front lever' },
  { text: 'Going down slowly is where the strength is.', source: 'pistol squat' },
  { text: 'One leg carries what two cannot be loaded with.', source: 'the squat cap' },
  { text: 'Leave reps in the tank on the way back.', source: 'coming back' },
] as const;
