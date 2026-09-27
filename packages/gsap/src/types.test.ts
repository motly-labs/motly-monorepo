import { type BurstSpec, rand, type ShapeSpec } from '@motly/core';
import { gsap } from 'gsap';
import { describe, expect, it } from 'vitest';
import './index.js';

const burst: BurstSpec = { kind: 'burst', children: { kind: 'circle' } };
const circle: ShapeSpec<'circle'> = { kind: 'circle', radius: 10 };
// Never run, so no timeline need exist.
const tl = {} as gsap.core.Timeline;
const el = {} as Element;

// Never called: each line is checked by the compiler alone.
describe('the effect types', () => {
  it('take a Spec of their own kind, the binding keys and GSAP’s tween vars', () => {
    const accepted = [
      () => gsap.effects.burst(el, { spec: burst }),
      () => gsap.effects.burst('.button', { spec: burst, seed: 1, renderer: 'svg' }),
      () => gsap.effects.burst({ x: 1, y: 2 }, { spec: burst, container: '.card' }),
      () => gsap.effects.burst([el, el], { spec: burst, reducedMotion: 'always' }),
      () => gsap.effects.burst(el, { spec: burst, duration: 2, ease: 'back.out', repeat: 1 }),
      () => gsap.effects.burst(el, { spec: burst, onComplete: () => {}, scrollTrigger: el }),
      () => gsap.effects.shape(el, { spec: circle, delay: 1 }),
      () => gsap.effects.shape(el, { spec: { kind: 'star', points: 5, radius: rand(10, 20) } }),
      () => tl.burst(el, { spec: burst }, '<').shape(el, { spec: circle }, 1).to(el, { x: 1 }),
    ];

    expect(accepted).toHaveLength(9);
  });

  it('reject a missing Spec, a Spec of the wrong kind and an unknown Renderer', () => {
    const rejected = [
      // @ts-expect-error — no Spec
      () => gsap.effects.burst(el, { duration: 1 }),
      // @ts-expect-error — a Shape's Spec on burst
      () => gsap.effects.burst(el, { spec: circle }),
      // @ts-expect-error — a Burst's Spec on shape
      () => gsap.effects.shape(el, { spec: burst }),
      // @ts-expect-error — circles have no points
      () => gsap.effects.shape(el, { spec: { kind: 'circle', points: 5 } }),
      // @ts-expect-error — not a Renderer
      () => gsap.effects.burst(el, { spec: burst, renderer: 'webgl' }),
      // @ts-expect-error — no Spec
      () => tl.shape(el, {}, 0),
    ];

    expect(rejected).toHaveLength(6);
  });

  it('reject the tween vars a burst cannot honour', () => {
    const rejected = [
      // @ts-expect-error — unsupported
      () => gsap.effects.burst(el, { spec: burst, keyframes: [] }),
      // @ts-expect-error — unsupported
      () => gsap.effects.burst(el, { spec: burst, startAt: {} }),
      // @ts-expect-error — unsupported
      () => gsap.effects.shape(el, { spec: circle, runBackwards: true }),
      // @ts-expect-error — unsupported
      () => tl.burst(el, { spec: burst, stagger: 0.1 }),
    ];

    expect(rejected).toHaveLength(4);
  });
});
