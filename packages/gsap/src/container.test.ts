// @vitest-environment happy-dom
import type { BurstSpec } from '@motly/core';
import { gsap } from 'gsap';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Motly } from './index.js';
import { button, layer, oracle, overlay, overlays, spec } from './testing/dom.js';

beforeAll(() => {
  gsap.registerPlugin(Motly);
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

/** A card laid out at 50, 20, 400 × 300, so a viewport point (x, y) is (x − 50, y − 20) in it. */
function card(): HTMLElement {
  const element = document.createElement('div');
  element.className = 'card';
  document.body.append(element);
  element.getBoundingClientRect = () => new DOMRect(50, 20, 400, 300);
  return element;
}

describe('container', () => {
  it('paints inside the container, in its coordinates, and adds nothing to the overlay', () => {
    const container = card();
    const tween = gsap.effects.burst(button(100, 50), {
      spec,
      container,
      renderer: 'svg',
      paused: true,
    });

    tween.progress(0.5);
    expect(overlays()).toHaveLength(1);
    expect(container.querySelector('svg')?.innerHTML).toBe(oracle({ x: 70, y: 40 }, 0.4));
  });

  it('takes a selector, and moves an Origin into the container, inside its border', () => {
    const container = card();
    Object.defineProperties(container, { clientLeft: { value: 5 }, clientTop: { value: 10 } });
    const tween = gsap.effects.burst(
      { x: 150, y: 120 },
      {
        spec,
        container: '.card',
        renderer: 'svg',
        paused: true,
      },
    );

    tween.progress(0.5);
    expect(container.querySelector('svg')?.innerHTML).toBe(oracle({ x: 95, y: 90 }, 0.4));
  });

  it('places the burst on the content of a container scrolled inside itself', () => {
    const container = card();
    Object.defineProperties(container, { scrollLeft: { value: 30 }, scrollTop: { value: 100 } });
    const tween = gsap.effects.burst(button(100, 50), {
      spec,
      container,
      renderer: 'svg',
      paused: true,
    });

    tween.progress(0.5);
    expect(container.querySelector('svg')?.innerHTML).toBe(oracle({ x: 100, y: 140 }, 0.4));
  });

  it('covers the container with a layer that catches no clicks, making a static one relative', () => {
    const container = card();
    container.style.position = 'static';
    const tween = gsap.effects.burst(button(100, 50), { spec, container, paused: true });

    tween.progress(0.5);
    expect(container.style.position).toBe('relative');
    const { style } = layer() as HTMLElement;
    expect(layer()?.parentElement).toBe(container);
    expect(style.position).toBe('absolute');
    expect(style.pointerEvents).toBe('none');
    expect(style.width).toBe('100%');
    expect(style.height).toBe('100%');
  });

  it('leaves a positioned container as it is', () => {
    const container = card();
    container.style.position = 'sticky';
    gsap.effects.burst(button(100, 50), { spec, container, paused: true }).progress(0.5);

    expect(container.style.position).toBe('sticky');
  });

  it('releases the burst at the ends, on kill and on revert, as in the overlay', () => {
    const container = card();
    const fire = () => gsap.effects.burst(button(100, 50), { spec, container, paused: true });

    const scrubbed = fire();
    scrubbed.progress(0.5);
    expect(container.querySelector('svg')).not.toBeNull();
    scrubbed.progress(1);
    expect(container.children).toHaveLength(0);
    scrubbed.progress(0.5);
    scrubbed.progress(0);
    expect(container.children).toHaveLength(0);

    const killed = fire();
    killed.progress(0.5);
    killed.kill();
    expect(container.children).toHaveLength(0);

    const reverted = fire();
    reverted.progress(0.5);
    reverted.revert();
    expect(container.children).toHaveLength(0);
  });

  it('warns once for a container that matches nothing, and lasts the Spec drawing nothing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const tween = gsap.effects.burst(button(100, 50), {
      spec,
      container: '.nothing',
      renderer: 'svg',
      paused: true,
    });

    expect(warn).toHaveBeenCalledOnce();
    expect(tween.duration()).toBeCloseTo(0.8);
    for (const p of [0.5, 1, 0.5]) tween.progress(p);
    expect(layer()).toBeNull();
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe('renderer', () => {
  // 60 Elements: past the count from which 'auto' paints on a canvas (ADR-0015).
  const big: BurstSpec = { ...spec, count: 60 };

  /** happy-dom has no 2D context: give canvases one that draws nothing. */
  function stubCanvas(): void {
    const context = new Proxy({}, { get: (target, key) => Reflect.get(target, key) ?? (() => {}) });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as CanvasRenderingContext2D,
    );
  }

  it('defaults to auto, which keeps a small burst in SVG and paints a large one on a canvas', () => {
    stubCanvas();
    gsap.effects.burst(button(100, 50), { spec, paused: true }).progress(0.5);
    expect(layer()?.tagName).toBe('DIV');
    expect(layer()?.querySelector('svg')?.innerHTML).toBe(oracle({ x: 120, y: 60 }, 0.4));
    document.body.replaceChildren();

    gsap.effects.burst(button(100, 50), { spec: big, paused: true }).progress(0.5);
    expect(layer()?.tagName).toBe('DIV');
    expect(layer()?.querySelector('canvas')).not.toBeNull();
    expect(overlay()).toBeNull();
  });

  it('paints in SVG when named, however large the burst', () => {
    gsap.effects.burst(button(100, 50), { spec: big, renderer: 'svg', paused: true }).progress(0.5);

    expect(layer()?.tagName).toBe('svg');
    expect(overlay()?.children).toHaveLength(60);
  });

  it('paints on a canvas when named, however small the burst, in a container too', () => {
    stubCanvas();
    const container = card();
    gsap.effects
      .burst(button(100, 50), { spec, container, renderer: 'canvas', paused: true })
      .progress(0.5);

    expect(layer()?.tagName).toBe('CANVAS');
    expect(layer()?.parentElement).toBe(container);
    expect(overlay()).toBeNull();
  });
});
