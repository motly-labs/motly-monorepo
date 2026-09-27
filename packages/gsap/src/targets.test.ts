// @vitest-environment happy-dom
import { type BurstSpec, rand } from '@motly/core';
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Motly } from './index.js';
import { button, oracle, overlay, place, spec } from './testing/dom.js';

// A burst that differs by Seed, so a test can tell which Seed painted it.
const seeded: BurstSpec = { ...spec, radius: [0, rand(40, 120)] };

beforeAll(() => {
  gsap.registerPlugin(Motly);
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('seeds', () => {
  it('draws the same bursts from the same seed on a second run', () => {
    const run = () => {
      const tween = gsap.effects.burst([button(100, 50), button(300, 200)], {
        spec: seeded,
        seed: 7,
        paused: true,
      });
      tween.progress(0.5);
      const painted = overlay()?.innerHTML;
      tween.kill();
      document.body.replaceChildren();
      return painted;
    };

    expect(run()).toBe(run());
  });

  it('draws a different burst per call without a seed', () => {
    const anchor = button(100, 50);
    const first = gsap.effects.burst(anchor, { spec: seeded, paused: true });
    const second = gsap.effects.burst(anchor, { spec: seeded, paused: true });

    first.progress(0.5);
    const painted = overlay()?.innerHTML;
    first.progress(0);
    second.progress(0.5);

    expect(painted).toBeDefined();
    expect(overlay()?.innerHTML).not.toBe(painted);
  });

  it('keeps each Seed for the tween’s life: across a repeat, a restart and a scrub', () => {
    const tween = gsap.effects.burst([button(100, 50), button(300, 200)], {
      spec: seeded,
      repeat: 1,
      paused: true,
    });

    tween.totalProgress(0.25);
    const painted = overlay()?.innerHTML;
    expect(painted).toBeDefined();

    tween.totalProgress(0.75);
    expect(overlay()?.innerHTML).toBe(painted);
    tween.restart().pause();
    tween.totalProgress(0.25);
    expect(overlay()?.innerHTML).toBe(painted);
    tween.totalProgress(0.9);
    tween.totalProgress(0.1);
    tween.totalProgress(0.25);
    expect(overlay()?.innerHTML).toBe(painted);
  });
});

describe('targets', () => {
  it('gives several Anchors distinct bursts, each from its centre, target i with Seed seed + i', () => {
    const tween = gsap.effects.burst([button(100, 50), button(300, 200)], {
      spec: seeded,
      seed: 7,
      paused: true,
    });

    tween.progress(0.5);
    const [a, b] = [
      oracle({ x: 120, y: 60 }, 0.4, seeded, 7),
      oracle({ x: 320, y: 210 }, 0.4, seeded, 8),
    ];
    expect(overlay()?.innerHTML).toBe(a + b);
    // Distinct in shape, not only in place: the same Seed would give the same radius.
    expect(a).not.toBe(oracle({ x: 120, y: 60 }, 0.4, seeded, 8));
  });

  it('gives one burst per element a selector matches', () => {
    for (const [left, top] of [
      [100, 50],
      [300, 200],
    ] as const)
      button(left, top).className = 'hit';
    const tween = gsap.effects.burst('.hit', { spec, paused: true });

    tween.progress(0.5);
    expect(overlay()?.innerHTML).toBe(
      oracle({ x: 120, y: 60 }, 0.4) + oracle({ x: 320, y: 210 }, 0.4),
    );
  });

  it('reads an element with x and y properties of its own, such as an <img>, as an Anchor', () => {
    const image = document.createElement('img');
    document.body.append(image);
    image.getBoundingClientRect = () => new DOMRect(100, 50, 40, 20);
    const tween = gsap.effects.burst(image, { spec, paused: true });

    tween.progress(0.5);
    expect(overlay()?.innerHTML).toBe(oracle({ x: 120, y: 60 }, 0.4));
  });

  it('paints a point target from that point, in viewport CSS pixels', () => {
    const tween = gsap.effects.burst({ x: 50, y: 70 }, { spec, paused: true });

    tween.progress(0.5);
    expect(overlay()?.innerHTML).toBe(oracle({ x: 50, y: 70 }, 0.4));
  });

  it('reads an Anchor moved before a burst late in a timeline starts where it is by then', () => {
    const anchor = button(100, 50);
    const tl = gsap.timeline({ paused: true });
    tl.to({}, { duration: 1 }).burst(anchor, { spec });

    tl.time(0.5);
    place(anchor, 300, 200);
    tl.time(1.5);
    expect(overlay()?.innerHTML).toBe(oracle({ x: 320, y: 210 }, 0.5));
  });

  it('warns once for targets that match nothing, and lasts the Spec’s duration drawing nothing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const tween = gsap.effects.burst('.nothing', { spec, paused: true });

    expect(warn).toHaveBeenCalledOnce();
    expect(tween.duration()).toBeCloseTo(0.8);
    for (const p of [0.5, 1, 0.5]) tween.progress(p);
    expect(overlay()).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
  });
});
