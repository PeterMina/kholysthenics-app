import { describe, expect, it } from 'vitest';
import { plateStack } from '@/modules/training';

describe('plateStack', () => {
  it('uses the fewest competition plates', () => {
    expect(plateStack(25)).toEqual([25]);
    expect(plateStack(27.5)).toEqual([25, 2.5]);
    expect(plateStack(42.5)).toEqual([25, 15, 2.5]);
    expect(plateStack(0)).toEqual([]);
  });
});
