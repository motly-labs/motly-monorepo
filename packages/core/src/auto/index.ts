/**
 * `@motly/core/auto` — picks SVGRenderer or CanvasRenderer for each Instance from its Element
 * count (ADR-0015). It imports both Renderers, so it is an entry of its own: a page that names one
 * Renderer does not pay for the other.
 */

import { CanvasRenderer } from '../canvas/index.js';
import type { DrawList, Renderer } from '../index.js';
import { SVGRenderer } from '../svg/index.js';

/**
 * The Element count from which an Instance is painted on a canvas rather than in SVG. Chosen from
 * `apps/demos/bench.html`'s numbers: below it the two cost the same within noise, so SVG, which can
 * be inspected, keeps the small effects. ADR-0015 records the machine, the numbers and the reasons.
 */
const CANVAS_FROM = 50;

/**
 * Paints each Instance with SVGRenderer or CanvasRenderer, whichever suits its Element count, into
 * layers it creates inside a container you own. Reach for it when you do not want to choose: a
 * small burst stays inspectable SVG, a big one gets a canvas. An Instance's Element count never
 * changes, so the choice made on its first draw holds for its whole life; nothing switches while
 * playing.
 *
 * The container must have a size of its own and be in the document by the first draw. The layers
 * cover it, one `<svg>` over one `<canvas>`, each created the first time an Instance needs it, and
 * share its coordinate space: Origins are CSS pixels from its top left corner. Both clip at its
 * edges and let pointer events through. A container with `position: static` is made `relative`, so
 * the layers can sit on it. The layers stay when their Instances are released, empty, and go with
 * the container.
 */
export class AutoRenderer implements Renderer {
  readonly #container: HTMLElement;
  readonly #chosen = new Map<object, Renderer>();
  #svg: SVGRenderer | undefined;
  #canvas: CanvasRenderer | undefined;

  constructor(container: HTMLElement) {
    this.#container = container;
  }

  draw(owner: object, list: DrawList): void {
    let renderer = this.#chosen.get(owner);
    if (renderer === undefined) {
      renderer = list.length >= CANVAS_FROM ? this.#canvasLayer() : this.#svgLayer();
      this.#chosen.set(owner, renderer);
    }
    renderer.draw(owner, list);
  }

  release(owner: object): void {
    this.#chosen.get(owner)?.release(owner);
    this.#chosen.delete(owner);
  }

  #svgLayer(): SVGRenderer {
    if (this.#svg === undefined) {
      const svg = this.#container.ownerDocument.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );
      this.#position();
      cover(svg);
      this.#container.append(svg);
      this.#svg = new SVGRenderer(svg);
    }
    return this.#svg;
  }

  #canvasLayer(): CanvasRenderer {
    if (this.#canvas === undefined) {
      const canvas = this.#container.ownerDocument.createElement('canvas');
      this.#position();
      cover(canvas);
      // Under the SVG layer, whichever came first.
      this.#container.prepend(canvas);
      this.#canvas = new CanvasRenderer(canvas);
    }
    return this.#canvas;
  }

  /**
   * Make a `static` container `relative`, so the layers can sit on it. Read when the first layer
   * is made, not when the Renderer is built: a container not yet in the document has no style.
   */
  #position(): void {
    const view = this.#container.ownerDocument.defaultView;
    if (view?.getComputedStyle(this.#container).position === 'static') {
      this.#container.style.position = 'relative';
    }
  }
}

/** Make `layer` cover its container exactly, and let pointer events through to what is under it. */
function cover(layer: HTMLElement | SVGElement): void {
  Object.assign(layer.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  });
}
