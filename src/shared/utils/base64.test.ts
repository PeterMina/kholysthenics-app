import { describe, expect, it } from 'vitest';
import { decodeBase64Utf8, encodeBase64Utf8 } from '@/shared/utils';

describe('base64 utf-8', () => {
  it('round-trips non-ASCII text', () => {
    const text = 'Pull day — 3×3 → 2 mins ✅';
    expect(decodeBase64Utf8(encodeBase64Utf8(text))).toBe(text);
  });

  it('ignores the line breaks GitHub puts in base64', () => {
    const encoded = encodeBase64Utf8('Kholy ① strength');
    const wrapped = `${encoded.slice(0, 8)}\n${encoded.slice(8)}\n`;
    expect(decodeBase64Utf8(wrapped)).toBe('Kholy ① strength');
  });
});
