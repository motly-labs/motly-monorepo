/**
 * `@motly/core/canvas` — paints Draw lists onto a `<canvas>`. Like every Renderer entry, it holds
 * the package's DOM code so the main entry never touches the DOM.
 */

import { PATH_BOX, pathBoxScale, trace } from '../geometry.js';
import type { DrawList, DrawRecord, Renderer } from '../index.js';

/** SVG's default, so a sharp corner is cut where SVGRenderer cuts it. */
const MITER_LIMIT = 4;

/**
 * Paints onto a `<canvas>` you own, redrawing every Instance it hosts on each frame. Reach for it
 * past a few hundred Elements, where SVGRenderer's one DOM element per Element gets slow. One
 * CanvasRenderer can host any number of Instances; releasing one leaves the others drawing.
 *
 * Origins are in the canvas's CSS pixels. The canvas holds `devicePixelRatio` times as many pixels,
 * so it stays sharp on high-density screens, and follows its size on the page as the layout or the
 * zoom changes. A canvas the page sizes in CSS stays responsive. One sized only by its `width` and
 * `height` attributes is fixed at its first size, inline, since otherwise its extra pixels would
 * make it grow. Origins do not move when the canvas is resized.
 *
 * It paints once the current task's draws are in, before the browser renders, so every Instance
 * drawing in one frame callback shares one repaint. Instances on one canvas share that callback when
 * they share a Scope's Driver; standalone Shapes and Bursts each have their own, and each repaints
 * the whole canvas. A test reading pixels after a `seek()` awaits a microtask first.
 *
 * Differences from SVGRenderer: `opacity` applies to the fill and the stroke one after the other,
 * so a translucent stroke over its fill shows the fill through it; and colors must be ones a canvas
 * understands, so no `var()`.
 */
export class CanvasRenderer implements Renderer {
  readonly #canvas: HTMLCanvasElement;
  readonly #context: CanvasRenderingContext2D;
  // A copy of each Instance's last Draw list, in the order they first drew: a Draw list is valid
  // only until its Instance is sampled again, and every repaint paints all of them.
  readonly #lists = new Map<object, DrawRecord[]>();
  readonly #paths = new Map<string, Path2D>();
  readonly #observer: ResizeObserver;
  #observing = false;
  #paintScheduled = false;
  // The canvas's size on the page, in CSS pixels, and the device pixels per CSS pixel its backing
  // store was last sized for. A width of 0 means it has not been laid out yet.
  #width = 0;
  #height = 0;
  #ratio = 0;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (context === null) throw new Error('motly: CanvasRenderer cannot get a 2D context.');
    this.#canvas = canvas;
    this.#context = context;
    this.#fit(canvas.clientWidth, canvas.clientHeight);
    this.#observer = new ResizeObserver(([entry]) => {
      const box = entry?.contentBoxSize[0];
      if (box === undefined) return;
      const pixels = entry?.devicePixelContentBoxSize?.[0];
      this.#fit(box.inlineSize, box.blockSize, pixels?.inlineSize, pixels?.blockSize);
      this.#paint();
    });
  }

  draw(owner: object, list: DrawList): void {
    let copy = this.#lists.get(owner);
    if (copy === undefined) {
      copy = [];
      this.#lists.set(owner, copy);
    }
    // Copied into the records of the last copy, so a steady frame allocates nothing.
    for (let i = 0; i < list.length; i++) {
      copy[i] = Object.assign(copy[i] ?? {}, list[i]) as DrawRecord;
    }
    copy.length = list.length;
    if (!this.#observing) {
      this.#observer.observe(this.#canvas, { box: 'content-box' });
      this.#observing = true;
    }
    this.#schedule();
  }

  release(owner: object): void {
    if (!this.#lists.delete(owner)) return;
    if (this.#lists.size === 0) {
      this.#observer.disconnect();
      this.#observing = false;
      this.#paths.clear();
    }
    this.#schedule();
  }

  /**
   * Paint once the current task's draws are all in. The Instances of one Driver draw in the same
   * frame callback, so they share one repaint rather than each clearing the others'.
   */
  #schedule(): void {
    if (this.#paintScheduled) return;
    this.#paintScheduled = true;
    queueMicrotask(() => {
      this.#paintScheduled = false;
      this.#paint();
    });
  }

  /**
   * Size the canvas's backing store to its size on the page, `width` × `height` CSS pixels, and if
   * that made it grow, as a canvas sized only by its attributes does, fix it at that size. A canvas
   * not laid out, hidden or not yet in the document, measures 0 and is left as it is until it is.
   */
  #fit(width: number, height: number, pixelWidth?: number, pixelHeight?: number): void {
    if (width === 0 || height === 0) return;
    this.#sizeBackingStore(width, height, pixelWidth, pixelHeight);
    const canvas = this.#canvas;
    // clientWidth is whole pixels; the size given may not be.
    if (Math.abs(canvas.clientWidth - width) > 1 || Math.abs(canvas.clientHeight - height) > 1) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
  }

  /**
   * Give the canvas the device pixels for `width` × `height` CSS pixels, exactly `pixelWidth` ×
   * `pixelHeight` where the browser says so. This clears it.
   */
  #sizeBackingStore(
    width: number,
    height: number,
    pixelWidth?: number,
    pixelHeight?: number,
  ): void {
    const ratio = this.#canvas.ownerDocument.defaultView?.devicePixelRatio ?? 1;
    this.#width = width;
    this.#height = height;
    this.#ratio = ratio;
    this.#canvas.width = pixelWidth ?? Math.round(width * ratio);
    this.#canvas.height = pixelHeight ?? Math.round(height * ratio);
  }

  #paint(): void {
    const canvas = this.#canvas;
    const context = this.#context;
    // Zoom and moving to another screen change the ratio; not every browser reports it as a resize.
    const ratio = canvas.ownerDocument.defaultView?.devicePixelRatio ?? 1;
    if (ratio !== this.#ratio) this.#fit(this.#width, this.#height);
    // Not laid out yet: nothing on the page to paint.
    if (this.#width === 0) return;
    const scaleX = canvas.width / this.#width;
    const scaleY = canvas.height / this.#height;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.miterLimit = MITER_LIMIT;
    for (const list of this.#lists.values()) {
      for (let i = 0; i < list.length; i++) {
        this.#paintRecord(list[i] as DrawRecord, scaleX, scaleY);
      }
    }
  }

  #paintRecord(record: DrawRecord, scaleX: number, scaleY: number): void {
    const context = this.#context;
    // Translate, rotate and scale in one matrix, on top of CSS pixels to device pixels.
    const radians = (record.angle * Math.PI) / 180;
    const cos = record.scale * Math.cos(radians);
    const sin = record.scale * Math.sin(radians);
    context.setTransform(
      cos * scaleX,
      sin * scaleY,
      -sin * scaleX,
      cos * scaleY,
      record.x * scaleX,
      record.y * scaleY,
    );
    // A canvas ignores an alpha outside 0–1, keeping the last Element's; SVG clamps it.
    context.globalAlpha = Math.min(Math.max(record.opacity, 0), 1);
    let lineWidth = record.strokeWidth;
    let path: Path2D | undefined;
    context.beginPath();
    switch (record.kind) {
      case 'circle':
        // An easing that overshoots can take a radius below 0, which `arc` throws on; SVG draws
        // nothing there.
        if (record.radius <= 0) return;
        context.arc(0, 0, record.radius, 0, 2 * Math.PI);
        break;
      case 'path': {
        const boxScale = pathBoxScale(record);
        if (boxScale === 0) return;
        const shift = (-boxScale * PATH_BOX) / 2;
        context.transform(boxScale, 0, 0, boxScale, shift, shift);
        lineWidth /= boxScale;
        path = this.#paths.get(record.d);
        if (path === undefined) {
          path = new Path2D(record.d);
          this.#paths.set(record.d, path);
        }
        break;
      }
      default:
        trace(record, context);
    }
    if (record.fill !== 'none') {
      context.fillStyle = record.fill;
      if (path === undefined) context.fill();
      else context.fill(path);
    }
    if (record.stroke !== 'none' && lineWidth > 0) {
      context.strokeStyle = record.stroke;
      context.lineWidth = lineWidth;
      if (path === undefined) context.stroke();
      else context.stroke(path);
    }
  }
}
