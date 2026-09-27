// @vitest-environment happy-dom
import type { BurstSpec } from '@motly/core';
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Motly } from './index.js';
import { button, oracle, overlay, spec } from './testing/dom.js';

// Rests halfway, at 0.4 s of 0.8 s, where the burst still shows something.
const resting: BurstSpec = { ...spec, restAt: 0.5 };
// The centre of every `button(100, 50)` below.
const origin = { x: 120, y: 60 };

beforeAll(() => {
  gsap.registerPlugin(Motly);
});

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe('reduced motion', () => {
  it('paints the Resting frame at every progress between the ends when forced on', () => {
    prefersReducedMotion(false);
    const tween = gsap.effects.burst(button(100, 50), {
      spec: resting,
      reducedMotion: 'always',
      paused: true,
    });

    for (const p of [0.1, 0.5, 0.9]) {
      tween.progress(p);
      expect(overlay()?.innerHTML).toBe(oracle(origin, 0.4, resting));
    }
    tween.progress(1);
    expect(overlay()).toBeNull();
  });

  it('keeps its full length, so what follows it in a timeline starts on time', () => {
    const next = gsap.to({}, { duration: 1 });
    const tl = gsap.timeline({ paused: true });
    tl.burst(button(100, 50), { spec: resting, reducedMotion: 'always' }).add(next);

    expect(next.startTime()).toBeCloseTo(0.8);
    expect(tl.duration()).toBeCloseTo(1.8);
  });

  it('moves when forced off, even for a viewer who prefers reduced motion', () => {
    prefersReducedMotion(true);
    const tween = gsap.effects.burst(button(100, 50), {
      spec: resting,
      reducedMotion: 'never',
      paused: true,
    });

    tween.progress(0.25);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.2, resting));
  });

  it('reads the viewer’s preference at each start from 0 moving forward', () => {
    prefersReducedMotion(false);
    const tween = gsap.effects.burst(button(100, 50), { spec: resting, paused: true });

    tween.progress(0.25);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.2, resting));

    // Mid-flight, a change waits for the next start.
    prefersReducedMotion(true);
    tween.progress(0.75);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.75 * 0.8, resting));

    tween.progress(0);
    tween.progress(0.25);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.4, resting));

    prefersReducedMotion(false);
    tween.progress(0);
    tween.progress(0.25);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.2, resting));
  });
});

/** Make the viewer's `prefers-reduced-motion` media query match, or not. */
function prefersReducedMotion(reduce: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
  }));
}
