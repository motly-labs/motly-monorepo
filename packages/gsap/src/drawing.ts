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

/** Where an Anchor's burst comes from: its centre, in viewport CSS pixels. */
function centre(anchor: Element): Origin {
  const box = anchor.getBoundingClientRect();
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
 * What one GSAP tween draws: an Instance per Anchor, in an overlay that is in the document only
 * while the tween is strictly between its ends. The tween's plugin hands it every `ratio`.
 */
export class Drawing {
  /** The tween's length: the longest of its Instances' durations. */
  readonly duration: number;
  readonly #spec: BurstSpec;
  readonly #anchors: readonly Element[];
  readonly #seed: number;
  readonly #scope: Scope = createScope({ driver: seekDriver() });
  #origins: Origin[] | undefined;
  #overlay: SVGSVGElement | undefined;
  #renderer: SVGRenderer | undefined;
  #instances: Instance[] = [];
  #lastRatio = 0;

  constructor(spec: BurstSpec, anchors: readonly Element[]) {
    this.#spec = spec;
    this.#anchors = anchors;
    // One Seed per tween, so every remount draws the same burst; Anchor i resolves from seed + i.
    this.#seed = Math.floor(Math.random() * 2 ** 32);
    const measured = anchors.map((_, i) => this.#create(nowhere, { x: 0, y: 0 }, i));
    this.duration = Math.max(0, ...measured.map((instance) => instance.duration));
    for (const instance of measured) instance.destroy();
  }

  /** Draw at `ratio` of the tween: between the ends, mounted; at either end, released. */
  render(ratio: number): void {
    if (ratio > 0 && ratio < 1) {
      if (this.#instances.length === 0) this.#mount();
      for (const instance of this.#instances) instance.seek(ratio * instance.duration);
    } else {
      this.release();
    }
    this.#lastRatio = ratio;
  }

  /** Remove everything drawn. A later draw between the ends mounts it again. */
  release(): void {
    for (const instance of this.#instances) instance.destroy();
    this.#instances = [];
    this.#overlay?.remove();
  }

  #mount(): void {
    const [first] = this.#anchors;
    if (first === undefined) return;
    // Measured at each start from 0 moving forward; scrubbing back in keeps where it started.
    if (this.#lastRatio === 0 || this.#origins === undefined) {
      this.#origins = this.#anchors.map(centre);
    }
    const origins = this.#origins;
    this.#overlay ??= createOverlay(first.ownerDocument);
    this.#renderer ??= new SVGRenderer(this.#overlay);
    first.ownerDocument.body.append(this.#overlay);
    const renderer = this.#renderer;
    this.#instances = origins.map((origin, i) => this.#create(renderer, origin, i));
  }

  #create(renderer: Renderer, origin: Origin, index: number): Instance {
    return this.#scope.burst(this.#spec, { renderer, origin, seed: this.#seed + index });
  }
}
