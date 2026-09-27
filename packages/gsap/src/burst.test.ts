// @vitest-environment happy-dom
import { type BurstSpec, createScope, type Origin } from '@motly/core';
import { SVGRenderer } from '@motly/core/svg';
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Motly } from './index.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// No rand(): the burst is the same for every Seed, so core's sample() is the oracle.
const spec: BurstSpec = {
  kind: 'burst',
  count: 5,
  radius: [0, 80],
  children: { kind: 'circle', radius: [10, 0], fill: ['red', 'blue'], duration: 0.8 },
};

/** A button laid out at `left`, `top`, 40 × 20, whose centre is (`left` + 20, `top` + 10). */
function button(left: number, top: number): HTMLElement {
  const element = document.createElement('button');
  document.body.append(element);
  place(element, left, top);
  return element;
}

function place(element: HTMLElement, left: number, top: number): void {
  element.getBoundingClientRect = () => new DOMRect(left, top, 40, 20);
}

/** The overlay the burst is painted in, if it is in the document. */
function overlay(): SVGSVGElement | null {
  return document.querySelector('svg');
}

/** What core paints for `spec` from `origin` at Playhead `t` seconds. */
function oracle(origin: Origin, t: number): string {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const renderer = new SVGRenderer(svg);
  const instance = createScope().burst(spec, { renderer, origin });
  renderer.draw(instance, instance.sample(t));
  return svg.innerHTML;
}

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
    expect(overlay()?.style.position).toBe('fixed');
    expect(overlay()?.style.pointerEvents).toBe('none');
    expect(overlay()?.style.width).toBe('100%');
    expect(overlay()?.style.height).toBe('100%');
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
