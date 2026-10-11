const LOCALE = 'en-GB';
const pad = (value: number): string => String(value).padStart(2, '0');

export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseIsoDate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (iso: string, days: number): string => {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

export const todayIso = (): string => toIsoDate(new Date());

export const formatShortDate = (iso: string): string =>
  parseIsoDate(iso).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });

export const formatWeekday = (iso: string): string =>
  parseIsoDate(iso).toLocaleDateString(LOCALE, { weekday: 'short' });
