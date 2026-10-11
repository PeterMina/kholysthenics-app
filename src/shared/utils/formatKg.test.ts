import { describe, expect, it } from 'vitest';
import { formatKg } from '@/shared/utils';

describe('formatKg', () => {
  it('drops trailing zeros', () => {
    expect(formatKg(25)).toBe('25');
    expect(formatKg(2.5)).toBe('2.5');
    expect(formatKg(1.25)).toBe('1.25');
  });

  it('rounds float noise to two decimals', () => {
    expect(formatKg(22.499999)).toBe('22.5');
  });
});
