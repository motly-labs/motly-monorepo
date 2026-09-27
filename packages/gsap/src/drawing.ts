import {
  type BurstSpec,
  createScope,
  type Driver,
  type Instance,
  type Origin,
  type Renderer,
  type Scope,
} from '@motly/core';
import { SVGRenderer } from '@motly/core/svg';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * A Driver that moves a Playhead only when seeked. GSAP's tween decides time and reaches the
 * Instances through the plugin's `render(ratio)`, so nothing here advances on its own.
 */
function seekDriver(): Driver {
  return {
    attach(target) {
      const idle = () => {};
      return {
        play: idle,
        pause: idle,
        resume: idle,
        reverse: idle,
        seek: (t) => target.render(Math.min(Math.max(t, 0), target.duration)),
        stop: idle,
      };
    },
  };
}

/** The element a burst is read from, at its centre. */
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

/** A viewport-sized `<svg>` above the page that catches no clicks, not yet in the document. */
function createOverlay(document: Document): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    // Above everything the page stacks: a burst drawn under a card would look broken.
    zIndex: '2147483647',
  });
  return svg;
}

/** Nothing: for the Instances that are only asked their duration. */
const nowhere: Renderer = { draw: () => {}, release: () => {} };

/**
 * What one GSAP tween draws: an Instance per target, in an overlay that is in the document only
 * while the tween is strictly between its ends. The tween's plugin hands it every render.
 */
export class Drawing {
  /** The tween's length: the longest of its Instances' durations. */
  readonly duration: number;
  readonly #spec: BurstSpec;
  readonly #targets: readonly (Anchor | Origin)[];
  readonly #seed: number;
  readonly #scope: Scope = createScope({ driver: seekDriver() });
  #origins: Origin[] | undefined;
  #overlay: SVGSVGElement | undefined;
  #renderer: SVGRenderer | undefined;
  #instances: Instance[] = [];
  // Whether the tween was last rendered at its very start, before any iteration ran.
  #atStart = true;

  constructor(spec: BurstSpec, targets: readonly (Anchor | Origin)[], seed?: number) {
    this.#spec = spec;
    this.#targets = targets;
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
   * overlay is mounted, at either one it is released.
   */
  render(ratio: number, tween: gsap.core.Tween): void {
    const progress = tween.progress();
    if (progress > 0 && progress < 1) {
      if (this.#instances.length === 0) this.#mount();
      for (const instance of this.#instances) instance.seek(ratio * instance.duration);
    } else {
      this.release();
    }
    this.#atStart = tween.totalProgress() === 0;
  }

  /** Remove everything drawn. A later draw between the ends mounts it again. */
  release(): void {
    for (const instance of this.#instances) instance.destroy();
    this.#instances = [];
    this.#overlay?.remove();
  }

  #mount(): void {
    if (this.#targets.length === 0) return;
    // Measured at each start from the tween's very start, where GSAP calls onStart; scrubbing back
    // in, a repeat and a yoyo keep where it began.
    if (this.#atStart || this.#origins === undefined) {
      this.#origins = this.#targets.map(originOf);
    }
    const origins = this.#origins;
    // An Anchor's own document, so a burst on an element in an iframe is drawn there.
    const anchor = this.#targets.find(isAnchor);
    this.#overlay ??= createOverlay(anchor?.ownerDocument ?? globalThis.document);
    this.#renderer ??= new SVGRenderer(this.#overlay);
    this.#overlay.ownerDocument.body.append(this.#overlay);
    const renderer = this.#renderer;
    this.#instances = origins.map((origin, i) => this.#create(renderer, origin, i));
  }

  #create(renderer: Renderer, origin: Origin, index: number): Instance {
    return this.#scope.burst(this.#spec, { renderer, origin, seed: this.#seed + index });
  }
}
