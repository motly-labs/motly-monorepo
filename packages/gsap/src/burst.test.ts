// @vitest-environment happy-dom
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Motly } from './index.js';
import { button, layer, oracle, overlay, place, spec } from './testing/dom.js';

beforeAll(() => {
  gsap.registerPlugin(Motly);
});

afterEach(() => {
  document.body.replaceChildren();
});

describe('gsap.effects.burst', () => {
  it('returns a tween as long as the burst, painting core’s sample at progress × duration', () => {
    const tween = gsap.effects.burst(button(100, 50), { spec, paused: true });

    expect(tween.duration()).toBeCloseTo(0.8);
    for (const p of [0.25, 0.5, 0.9]) {
      tween.progress(p);
      expect(overlay()?.innerHTML).toBe(oracle({ x: 120, y: 60 }, p * 0.8));
    }
  });

  it('paints in a fixed overlay that catches no clicks, only strictly between the ends', () => {
    const tween = gsap.effects.burst(button(100, 50), { spec, paused: true });

    expect(overlay()).toBeNull();
    tween.progress(0.5);
    const { style } = layer() as HTMLElement;
    expect(layer()?.parentElement).toBe(document.body);
    expect(style.position).toBe('fixed');
    expect(style.pointerEvents).toBe('none');
    expect(style.width).toBe('100%');
    expect(style.height).toBe('100%');
    tween.progress(1);
    expect(overlay()).toBeNull();
    tween.progress(0.5);
    expect(overlay()).not.toBeNull();
    tween.progress(0);
    expect(overlay()).toBeNull();
  });

  it('reads the Anchor’s centre when the tween starts from 0 moving forward, not per frame', () => {
    const anchor = button(100, 50);
    const tween = gsap.effects.burst(anchor, { spec, paused: true });

    place(anchor, 300, 200);
    tween.progress(0.25);
    expect(overlay()?.innerHTML).toBe(oracle({ x: 320, y: 210 }, 0.2));

    place(anchor, 0, 0);
    tween.progress(0.5);
    tween.progress(1);
    tween.progress(0.5);
    expect(overlay()?.innerHTML).toBe(oracle({ x: 320, y: 210 }, 0.4));

    tween.progress(0);
    tween.progress(0.5);
    expect(overlay()?.innerHTML).toBe(oracle({ x: 20, y: 10 }, 0.4));
  });
});

describe('tl.burst', () => {
  it('places the burst by GSAP’s position parameter', () => {
    const tl = gsap.timeline({ paused: true });
    tl.to({}, { duration: 2 }).burst(button(100, 50), { spec }, '<');

    expect(tl.duration()).toBe(2);
    tl.time(0.4);
    expect(overlay()?.innerHTML).toBe(oracle({ x: 120, y: 60 }, 0.4));
  });
});
