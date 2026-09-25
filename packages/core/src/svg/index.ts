/**
 * `@motly/core/svg` — paints Draw lists into an `<svg>` element. The only DOM code in the package
 * lives in Renderer entries like this one; the main entry never touches the DOM.
 */

import type { DrawList, DrawRecord, Renderer } from '../index.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function create(document: Document, record: DrawRecord): SVGElement {
  switch (record.kind) {
    case 'circle':
      return document.createElementNS(SVG_NS, 'circle');
  }
}

function paint(element: SVGElement, record: DrawRecord): void {
  switch (record.kind) {
    case 'circle':
      element.setAttribute('r', String(record.radius));
      break;
  }
  element.setAttribute(
    'transform',
    `translate(${record.x} ${record.y}) rotate(${record.angle}) scale(${record.scale})`,
  );
  element.setAttribute('fill', record.fill);
  element.setAttribute('stroke', record.stroke);
  element.setAttribute('stroke-width', String(record.strokeWidth));
  element.setAttribute('opacity', String(record.opacity));
}

/**
 * Paints into an `<svg>` you own, keeping one live SVG element per Element and updating its
 * attributes each frame. Reach for it up to a few hundred Elements, or when you want to inspect
 * the result in dev tools. One SVGRenderer can host any number of Instances.
 */
export class SVGRenderer implements Renderer {
  readonly #svg: SVGSVGElement;
  readonly #painted = new Map<object, SVGElement[]>();

  constructor(svg: SVGSVGElement) {
    this.#svg = svg;
  }

  draw(owner: object, list: DrawList): void {
    let elements = this.#painted.get(owner);
    if (elements === undefined) {
      elements = [];
      this.#painted.set(owner, elements);
    }
    for (const [index, record] of list.entries()) {
      let element = elements[index];
      if (element === undefined) {
        element = create(this.#svg.ownerDocument, record);
        this.#svg.append(element);
        elements.push(element);
      }
      paint(element, record);
    }
  }

  release(owner: object): void {
    for (const element of this.#painted.get(owner) ?? []) element.remove();
    this.#painted.delete(owner);
  }
}
