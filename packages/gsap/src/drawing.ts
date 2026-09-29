import {
  type BurstSpec,
  createScope,
  type Instance,
  isMotionReduced,
  type Origin,
  type ReducedMotion,
  type Renderer,
  type Scope,
  type ShapeSpec,
} from '@motly/core';
import { AutoRenderer } from '@motly/core/auto';
import { CanvasRenderer } from '@motly/core/canvas';
import { SVGRenderer } from '@motly/core/svg';

const SVG_NS = 'http://www.w3.org/2000/svg';
// Marks the layers the adapter mounts, so a container can tell whether any is left in it.
const LAYER = 'data-motly-layer';
// The inline `position` a static container had before the adapter made it relative. Kept on the
// container, not in a Drawing, so every tween drawing in it shares it.
const SAVED_POSITION = 'motlyPosition';

/** The element a burst or a Shape is read from, at its centre. */
export type Anchor = Element;

// By node type, not by `x` and `y`: an `<img>` has numeric ones of its own. Not `instanceof`,
// which fails for an element from another frame.
function isAnchor(target: Anchor | Origin): target is Anchor {
  return (target as Partial<Anchor>).nodeType === 1;
}

/** Where `target`'s burst comes from, in viewport CSS pixels: an Anchor's centre, or the point. */
function originOf(target: Anchor | Origin): Origin {
  if (!isAnchor(target)) return { x: target.x, y: target.y };
  const box = target.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

/**
 * Which Renderer paints a burst or a Shape: `auto` picks SVG or canvas by its Element count
 * (ADR-0015). Reach for it to type a setting passed on to `renderer` in the vars.
 */
export type RendererName = 'svg' | 'canvas' | 'auto';

/** The GSAP effect's binding keys from `vars`, with `container` resolved to its element. */
export interface DrawingOptions {
  /** Target `i` draws from `seed + i`; a random Seed when not given. */
  seed: number | undefined;
  /** The element painted into, or the overlay when not given. */
  container: HTMLElement | undefined;
  rendererName: RendererName;
  /** Whether to show the Resting frame instead of motion, as for an Instance (ADR-0012). */
  reducedMotion: ReducedMotion;
}

/**
 * The element a burst is painted in and the Renderer that paints it, not yet in the document. It
 * covers the viewport, above everything the page stacks, or else its container, and catches no
 * clicks.
 */
function createLayer(
  document: Document,
  name: RendererName,
  container: HTMLElement | undefined,
): [HTMLElement | SVGSVGElement, Renderer] {
  let layer: HTMLElement | SVGSVGElement;
  let renderer: Renderer;
  if (name === 'svg') {
    const svg = document.createElementNS(SVG_NS, 'svg');
    [layer, renderer] = [svg, new SVGRenderer(svg)];
  } else if (name === 'canvas') {
    const canvas = document.createElement('canvas');
    [layer, renderer] = [canvas, new CanvasRenderer(canvas)];
  } else {
    const div = document.createElement('div');
    [layer, renderer] = [div, new AutoRenderer(div)];
  }
  layer.setAttribute('aria-hidden', 'true');
  layer.setAttribute(LAYER, '');
  Object.assign(layer.style, {
    position: container === undefined ? 'fixed' : 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    // Above everything the page stacks: a burst drawn under a card would look broken. In a
    // container, the container's own stacking decides.
    zIndex: container === undefined ? '2147483647' : '',
  });
  return [layer, renderer];
}

/** Make a static container relative, so a layer sits on it, as core's AutoRenderer does. */
function claimPosition(container: HTMLElement): void {
  if (container.dataset[SAVED_POSITION] !== undefined) return;
  const view = container.ownerDocument.defaultView;
  if (view?.getComputedStyle(container).position !== 'static') return;
  container.dataset[SAVED_POSITION] = container.style.position;
  container.style.position = 'relative';
}

/**
 * Put back the `position` claimPosition() changed, once the last layer has left the container, so
 * a released burst leaves the page as it found it.
 */
function releasePosition(container: HTMLElement): void {
  const saved = container.dataset[SAVED_POSITION];
  if (saved === undefined) return;
  if (Array.from(container.children).some((child) => child.hasAttribute(LAYER))) return;
  container.style.position = saved;
  delete container.dataset[SAVED_POSITION];
}

/**
 * Where the layer's top left corner is in viewport CSS pixels: inside the container's border, and
 * moved by its scroll, since an absolute layer scrolls with the container's content.
 */
function corner(container: HTMLElement): Origin {
  const box = container.getBoundingClientRect();
  return {
    x: box.left + container.clientLeft - container.scrollLeft,
    y: box.top + container.clientTop - container.scrollTop,
  };
}

/** Nothing: for the Instances that are only asked their duration. */
const nowhere: Renderer = { draw: () => {}, release: () => {} };

/**
 * What one GSAP tween draws: an Instance per target, in a layer over the viewport or its container
 * that is in the document only while the tween is strictly between its ends. The tween's plugin
 * hands it every render.
 */
export class Drawing {
  /** The tween's length: the longest of its Instances' durations. */
  readonly duration: number;
  readonly #spec: BurstSpec | ShapeSpec;
  readonly #targets: readonly (Anchor | Origin)[];
  readonly #seed: number;
  // GSAP's tween decides time and reaches the Instances through the plugin's `render(ratio)`, which
  // only seeks them. Core's rAF Driver draws a seek at once and starts no frame loop for it.
  readonly #scope: Scope = createScope();
  readonly #container: HTMLElement | undefined;
  readonly #rendererName: RendererName;
  readonly #reducedMotion: ReducedMotion;
  #origins: Origin[] | undefined;
  // Whether the draws since the last start show the Resting frame rather than motion.
  #reduced = false;
  #layer: HTMLElement | SVGSVGElement | undefined;
  #renderer: Renderer | undefined;
  #instances: Instance[] = [];
  // Whether the tween was last rendered at its very start, before any iteration ran.
  #atStart = true;

  constructor(
    spec: BurstSpec | ShapeSpec,
    targets: readonly (Anchor | Origin)[],
    { seed, container, rendererName, reducedMotion }: DrawingOptions,
  ) {
    this.#spec = spec;
    this.#targets = targets;
    this.#container = container;
    this.#rendererName = rendererName;
    this.#reducedMotion = reducedMotion;
    // One Seed per tween, so every remount draws the same burst; target i resolves from seed + i.
    this.#seed = seed ?? Math.floor(Math.random() * 2 ** 32);
    // Targets that match nothing still give a tween as long as the Spec, so a timeline keeps time.
    const measured = Array.from({ length: Math.max(targets.length, 1) }, (_, i) =>
      this.#create(nowhere, { x: 0, y: 0 }, i),
    );
    this.duration = Math.max(0, ...measured.map((instance) => instance.duration));
    for (const instance of measured) instance.destroy();
  }

  /**
   * Draw `tween` where GSAP's eased `ratio` puts the Playheads. The ends come from the tween's own
   * progress through its iteration, since an ease can overshoot 0 or 1 mid-tween: between them the
   * layer is mounted, at either one it is released.
   */
  render(ratio: number, tween: gsap.core.Tween): void {
    const progress = tween.progress();
    if (progress > 0 && progress < 1) {
      if (this.#instances.length === 0) this.#mount();
      for (const instance of this.#instances) {
        // Under reduced motion the tween still runs its full length, so what follows it in a
        // timeline keeps its timing; only what it draws holds still (ADR-0012).
        instance.seek(this.#reduced ? instance.restingPlayhead : ratio * instance.duration);
      }
    } else {
      this.release();
    }
    this.#atStart = tween.totalProgress() === 0;
  }

  /** Remove everything drawn. A later draw between the ends mounts it again. */
  release(): void {
    for (const instance of this.#instances) instance.destroy();
    this.#instances = [];
    this.#layer?.remove();
    if (this.#container !== undefined) releasePosition(this.#container);
  }

  #mount(): void {
    if (this.#targets.length === 0) return;
    const container = this.#container;
    // Measured at each start from the tween's very start, where GSAP calls onStart; scrubbing back
    // in, a repeat and a yoyo keep where it began. In a container, both the targets and the
    // container are read then, and the Origins are moved into its coordinates. The viewer's
    // preference is read then too, so changing it takes effect on the next start without a reload.
    if (this.#atStart || this.#origins === undefined) {
      this.#reduced = isMotionReduced(this.#reducedMotion);
      const { x, y } = container === undefined ? { x: 0, y: 0 } : corner(container);
      this.#origins = this.#targets
        .map(originOf)
        .map((point) => ({ x: point.x - x, y: point.y - y }));
    }
    const origins = this.#origins;
    if (this.#layer === undefined || this.#renderer === undefined) {
      // The container's, or an Anchor's own document, so a burst in an iframe is drawn there.
      const document =
        container?.ownerDocument ??
        this.#targets.find(isAnchor)?.ownerDocument ??
        globalThis.document;
      [this.#layer, this.#renderer] = createLayer(document, this.#rendererName, container);
    }
    if (container !== undefined) claimPosition(container);
    (container ?? this.#layer.ownerDocument.body).append(this.#layer);
    const renderer = this.#renderer;
    this.#instances = origins.map((origin, i) => this.#create(renderer, origin, i));
  }

  #create(renderer: Renderer, origin: Origin, index: number): Instance {
    const spec = this.#spec;
    const binding = { renderer, origin, seed: this.#seed + index };
    return spec.kind === 'burst'
      ? this.#scope.burst(spec, binding)
      : this.#scope.shape(spec, binding);
  }
}
