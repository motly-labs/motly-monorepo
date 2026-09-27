// @vitest-environment happy-dom
import { createScope, type ShapeSpec } from '@motly/core';
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Motly } from './index.js';
import { button, oracle, overlay, spec } from './testing/dom.js';

// Vars GSAP's tween would honour and a burst cannot: stripped at runtime, rejected by the types.
// Given here as plain JavaScript would give them, past the types.
const unsupported: object = {
  keyframes: [{ duration: 5 }],
  startAt: { duration: 3 },
  runBackwards: true,
  stagger: 0.5,
};

const circle: ShapeSpec<'circle'> = { kind: 'circle', duration: 0.8 };

beforeAll(() => {
  gsap.registerPlugin(Motly);
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('unsupported vars', () => {
  it('are ignored, with one warning per registration however often they are given', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const first = gsap.effects.burst(button(100, 50), { spec, ...unsupported, paused: true });
    gsap.effects.shape(button(100, 50), { spec: circle, ...unsupported, paused: true });
    const tl = gsap.timeline({ paused: true }).burst(button(100, 50), { spec, ...unsupported });

    expect(warn).toHaveBeenCalledOnce();
    // keyframes of 5 s and a stagger would have lengthened it.
    expect(tl.duration()).toBeCloseTo(0.8);
    expect(warn.mock.calls[0]?.[0]).toMatch(/keyframes, startAt, runBackwards, stagger/);
    expect(first.duration()).toBeCloseTo(0.8);
    first.progress(0.5);
    expect(overlay()?.innerHTML).toBe(oracle({ x: 120, y: 60 }, 0.4));
  });

  it('warn again when the same plugin is registered on another copy of GSAP', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // This copy has warned, here or in the test before.
    gsap.effects.burst(button(100, 50), { spec, ...unsupported });
    warn.mockClear();
    vi.resetModules();
    const { gsap: other } = await import('gsap');
    other.registerPlugin(Motly);

    other.effects.burst(button(100, 50), { spec, ...unsupported });
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toMatch(/are ignored/);
  });
});

describe('an invalid Spec', () => {
  it('throws core’s validation message at the effect call', () => {
    const invalid = { ...spec, count: -1 };
    const backwards: ShapeSpec<'circle'> = { kind: 'circle', duration: -1 };
    const binding = { renderer: { draw: () => {}, release: () => {} }, origin: { x: 0, y: 0 } };

    expect(() => gsap.effects.burst(button(100, 50), { spec: invalid })).toThrow(
      message(() => createScope().burst(invalid, binding)),
    );
    expect(() => gsap.effects.shape(button(100, 50), { spec: backwards })).toThrow(
      message(() => createScope().shape(backwards, binding)),
    );
  });
});

/** The message `fails` throws. */
function message(fails: () => unknown): string {
  try {
    fails();
  } catch (error) {
    return (error as Error).message;
  }
  throw new Error('expected it to throw');
}
