export const NAV_TABS = [
  { to: '/', label: 'Today', id: 'tab-today' },
  { to: '/block', label: 'Block', id: 'tab-block' },
  { to: '/history', label: 'History', id: 'tab-history' },
  { to: '/settings', label: 'Settings', id: 'tab-settings' },
] as const;

export const CONFIRM_WINDOW_MS = 3_500;

export const VERDICT_COLORS = { pending: 'gray', up: 'green', hold: 'gray', drop: 'red', cap: 'yellow' } as const;

export const SYNC_TONE_COLORS = { ok: 'green', waiting: 'yellow', problem: 'red' } as const;

export const PLATE_STYLES: Record<number, { color: string; width: number; height: number }> = {
  25: { color: '#d1262e', width: 11, height: 34 },
  20: { color: '#1f5fb3', width: 10, height: 34 },
  15: { color: '#e8b923', width: 9, height: 30 },
  10: { color: '#2e8b47', width: 8, height: 26 },
  5: { color: '#f4f6f8', width: 6, height: 20 },
};
export const SMALL_PLATE_STYLE = { color: '#6b7480', width: 5, height: 15 };
