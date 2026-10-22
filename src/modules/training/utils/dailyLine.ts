import { DAILY_LINES, type TrainingLine } from '@/modules/training/constants';

const MS_PER_DAY = 86_400_000;

/**
 * Day number for the local calendar date.
 *
 * Built through Date.UTC on purpose: subtracting two local midnights and
 * dividing by a day is wrong across a daylight-saving change, where a local
 * day is 23 or 25 hours long. That made the line repeat itself for two days
 * every time the clocks moved.
 */
const localDayIndex = (date: Date): number =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);

/** The line for a given day. Stable all day, so it never changes mid-session. */
export const dailyLine = (date: Date = new Date()): TrainingLine => {
  const index = localDayIndex(date) % DAILY_LINES.length;
  return DAILY_LINES[(index + DAILY_LINES.length) % DAILY_LINES.length] as TrainingLine;
};
