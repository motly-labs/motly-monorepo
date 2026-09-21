import { describe, expect, it } from 'vitest';
import { clamp, lerp } from './index.js';

describe('clamp', () => {
  it('passes values inside the range through untouched', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps at both bounds', () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('lerp', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('interpolates linearly in between', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});
