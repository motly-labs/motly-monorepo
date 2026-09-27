// @vitest-environment happy-dom
import type { ShapeSpec } from '@motly/core';
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Motly } from './index.js';
import { button, oracle, overlay } from './testing/dom.js';

const ring: ShapeSpec<'circle'> = {
  kind: 'circle',
  radius: [0, 60],
  fill: 'none',
  stroke: ['red', 'blue'],
  strokeWidth: [8, 0],
  duration: 0.8,
};
// The centre of every `button(100, 50)` below.
const origin = { x: 120, y: 60 };

beforeAll(() => {
  gsap.registerPlugin(Motly);
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('gsap.effects.shape', () => {
  it('paints one Element from the Anchor’s centre, as long as the Shape', () => {
    const tween = gsap.effects.shape(button(100, 50), { spec: ring, paused: true });

    expect(tween.duration()).toBeCloseTo(0.8);
    tween.progress(0.5);
    expect(overlay()?.children).toHaveLength(1);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.4, ring));
  });

  it('draws one Element per target, and clears them when killed mid-flight', () => {
    const tween = gsap.effects.shape([button(100, 50), { x: 300, y: 200 }], {
      spec: ring,
      paused: true,
    });

    tween.progress(0.5);
    expect(overlay()?.innerHTML).toBe(
      oracle(origin, 0.4, ring) + oracle({ x: 300, y: 200 }, 0.4, ring),
    );
    tween.kill();
    expect(overlay()).toBeNull();
  });

  it('clears the Shape mid-flight when reverted', () => {
    const tween = gsap.effects.shape(button(100, 50), { spec: ring, paused: true });

    tween.progress(0.5);
    tween.revert();
    expect(overlay()).toBeNull();
  });
});

describe('tl.shape', () => {
  it('places the Shape by GSAP’s position parameter, stretched by duration', () => {
    const tl = gsap.timeline({ paused: true });
    tl.to({}, { duration: 2 }).shape(button(100, 50), { spec: ring, duration: 1.6 }, 1);

    expect(tl.duration()).toBeCloseTo(2.6);
    tl.time(1.8);
    expect(overlay()?.innerHTML).toBe(oracle(origin, 0.4, ring));
  });
});
