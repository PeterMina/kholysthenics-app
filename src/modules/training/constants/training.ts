export const ARCHIVE_BLOCK = 'archive';
/** Days between sessions, cycling by block order: 2, 2, 3 — one week per three sessions. */
export const SCHEDULE_GAPS_DAYS = [2, 2, 3] as const;
/** The first gap in the cycle falls before the session with this order. */
export const SCHEDULE_FIRST_GAP_ORDER = 2;
export const DEFAULT_INCREMENT_KG = 2.5;
export const DEFAULT_FAST_INCREMENT_KG = 5;
export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25] as const;
