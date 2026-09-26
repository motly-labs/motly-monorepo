/**
 * `@motly/core/svg` — paints Draw lists into an `<svg>` element. The only DOM code in the package
 * lives in Renderer entries like this one; the main entry never touches the DOM.
 */

import { PATH_BOX, type Pen, pathBoxScale, trace } from '../geometry.js';
import type { DrawList, DrawRecord, Renderer } from '../index.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** A Pen writing SVG path data, rounded to a hundredth of a pixel. */
class PathData implements Pen {
  d = '';
  moveTo(x: number, y: number): void {
    this.d += `M${round(x)} ${round(y)}`;
  }
  lineTo(x: number, y: number): void {
    this.d += `L${round(x)} ${round(y)}`;
  }
  closePath(): void {
    this.d += 'Z';
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function create(document: Document, record: DrawRecord): SVGElement {
  if (record.kind === 'circle') return document.createElementNS(SVG_NS, 'circle');
  const path = document.createElementNS(SVG_NS, 'path');
  // A custom path's data never changes, so it is set once, here.
  if (record.kind === 'path') path.setAttribute('d', record.d);
  return path;
}

function paint(element: SVGElement, record: DrawRecord): void {
  let transform = `translate(${record.x} ${record.y}) rotate(${record.angle}) scale(${record.scale})`;
  let strokeWidth = record.strokeWidth;
  switch (record.kind) {
    case 'circle':
      element.setAttribute('r', String(record.radius));
      break;
    case 'path': {
      const boxScale = pathBoxScale(record);
      transform += ` scale(${boxScale}) translate(${-PATH_BOX / 2} ${-PATH_BOX / 2})`;
      strokeWidth = boxScale === 0 ? 0 : strokeWidth / boxScale;
      break;
    }
    default: {
      const data = new PathData();
      trace(record, data);
      element.setAttribute('d', data.d);
    }
  }
  element.setAttribute('transform', transform);
  element.setAttribute('fill', record.fill);
  element.setAttribute('stroke', record.stroke);
  element.setAttribute('stroke-width', String(strokeWidth));
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
