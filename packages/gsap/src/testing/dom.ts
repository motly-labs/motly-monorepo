import { type BurstSpec, createScope, type Origin } from '@motly/core';
import { SVGRenderer } from '@motly/core/svg';

const SVG_NS = 'http://www.w3.org/2000/svg';

// No rand(): the burst is the same for every Seed, so core's sample() is the oracle.
export const spec: BurstSpec = {
  kind: 'burst',
  count: 5,
  radius: [0, 80],
  children: { kind: 'circle', radius: [10, 0], fill: ['red', 'blue'], duration: 0.8 },
};

/** A button laid out at `left`, `top`, 40 × 20, whose centre is (`left` + 20, `top` + 10). */
export function button(left: number, top: number): HTMLElement {
  const element = document.createElement('button');
  document.body.append(element);
  place(element, left, top);
  return element;
}

/** Move `element` to `left`, `top`, as layout would. */
export function place(element: HTMLElement, left: number, top: number): void {
  element.getBoundingClientRect = () => new DOMRect(left, top, 40, 20);
}

/** The overlay the burst is painted in, if it is in the document. */
export function overlay(): SVGSVGElement | null {
  return document.querySelector('svg');
}

/** Every burst overlay in the document. */
export function overlays(): NodeListOf<SVGSVGElement> {
  return document.querySelectorAll('svg');
}

/** What core paints for `burst` from `origin` at Playhead `t` seconds, under `seed` if given. */
export function oracle(origin: Origin, t: number, burst: BurstSpec = spec, seed?: number): string {
  const svg = document.createElementNS(SVG_NS, 'svg');
  const renderer = new SVGRenderer(svg);
  const instance = createScope().burst(burst, {
    renderer,
    origin,
    ...(seed === undefined ? {} : { seed }),
  });
  renderer.draw(instance, instance.sample(t));
  return svg.innerHTML;
}
