import type { CircleRecord, DrawList } from './draw-list.js';
import { createRafDriver, type Driver, type DriverTarget, type Playback } from './driver.js';
import type { Renderer } from './renderer.js';
import {
  type Placement,
  type ResolvedElement,
  type ResolvedEmitter,
  type ResolvedTree,
  resolve,
} from './resolve.js';
import type { BurstSpec, ChildSpec, ShapeKind, ShapeSpec } from './spec.js';
import { colorAt, numberAt } from './tween.js';
import { clamp } from './utils/index.js';

/** A point in a Renderer's coordinate space. */
export interface Origin {
  x: number;
  y: number;
}

/** What an Instance is bound to at creation. None of it belongs in the Spec. */
export interface InstanceBinding {
  renderer: Renderer;
  origin: Origin;
  /**
   * The integer every `rand()` in the Spec resolves from, taken modulo 2^32. Pass one to
   * reproduce a burst exactly on every run; leave it out for a fresh random one per Instance.
   */
  seed?: number;
  /** Called on the first draw after each `play()`. Reach for it to reveal or log an effect. */
  onStart?: () => void;
  /**
   * Called after every draw, by playing or seeking, with the Playhead in seconds. Reach for it to
   * keep something else, such as a slider, in step with the effect.
   */
  onUpdate?: (t: number) => void;
  /**
   * Called when pending `play()`s settle because the Playhead reached the end moving forward:
   * once for all of them, and not on `destroy()`. Where the Driver cannot run at all, as rAF on a
   * server, `play()` settles at once and this fires with nothing drawn. Reach for it, or await
   * `play()`, to chain what comes next.
   */
  onComplete?: () => void;
}

/** A Spec bound to a Renderer and an Origin: the thing that plays and is destroyed. */
export interface Instance {
  /** Seconds from the first frame to the last. */
  readonly duration: number;
  /** The Draw list at Playhead `t` seconds. Pure: depends on nothing but `t`. */
  sample(t: number): DrawList;
  /**
   * Play from the start. Resolves the first time the Playhead then reaches the end moving
   * forward, or on `destroy()`; never rejects.
   */
  play(): Promise<void>;
  /** Stop the Playhead where it is. Reach for it to hold an effect while something else happens. */
  pause(): void;
  /**
   * Carry on from where `pause()` left the Playhead, in the direction it was moving. Reach for it to
   * continue an effect held by `pause()`, rather than restart it with `play()`.
   */
  resume(): void;
  /**
   * Run the Playhead backward from where it is, stopping at 0. Reach for it to take an effect back
   * out, as on a hover ending. Reaching 0 does not settle `play()`.
   */
  reverse(): void;
  /**
   * Move the Playhead to `t` seconds, held within 0 and `duration`, and draw there now, playing
   * or paused as before. Works on an Instance that has never played. Reach for it to jump to a
   * moment, or scrub in seconds. A seek forward to the end settles a pending `play()`, whichever
   * way the Playhead was running.
   */
  seek(t: number): void;
  /**
   * `seek()` by progress: 0 is the first frame, 1 the last. Reach for it to scrub from a slider or
   * a scroll position. Draws what `sample(p * duration)` returns.
   */
  setProgress(p: number): void;
  /** Stop playing and remove everything drawn. Resolves a pending `play()` rather than rejecting. */
  destroy(): void;
}

/** A Seed for an Instance created without one. The only use of `Math.random` in core. */
function freshSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

/** How far through `duration` seconds the Playhead `t` is, held at 0 before and 1 after. */
function progressAt(t: number, duration: number): number {
  if (duration > 0) return clamp(t / duration, 0, 1);
  return t < 0 ? 0 : 1;
}

/**
 * Write `element`'s own properties at `progress` into its pooled `record`. A function of its own
 * on purpose: inlined in `sample()`'s loop, one more field read there cost 30% a frame on 5,000
 * Elements, as the loop grew past what V8 would optimize.
 */
function paint(record: CircleRecord, element: ResolvedElement, progress: number): void {
  record.radius = numberAt(element.radius, progress);
  record.angle = numberAt(element.angle, progress);
  record.scale = numberAt(element.scale, progress);
  record.fill = colorAt(element.fill, progress);
  record.stroke = colorAt(element.stroke, progress);
  record.strokeWidth = numberAt(element.strokeWidth, progress);
  record.opacity = numberAt(element.opacity, progress);
}

function createRecord(): CircleRecord {
  return {
    kind: 'circle',
    radius: 0,
    x: 0,
    y: 0,
    angle: 0,
    scale: 1,
    fill: '',
    stroke: '',
    strokeWidth: 0,
    opacity: 1,
  };
}

/** Any Spec bound to a Renderer, an Origin and a Driver. Shape and Burst are this, typed. */
export class SpecInstance implements Instance {
  readonly duration: number;
  readonly #resolved: ResolvedTree;
  readonly #origin: Origin;
  readonly #renderer: Renderer;
  readonly #driver: Driver;
  readonly #target: DriverTarget;
  readonly #onDestroy: (() => void) | undefined;
  readonly #callbacks: Pick<InstanceBinding, 'onStart' | 'onUpdate' | 'onComplete'>;
  #playback: Playback | undefined;
  // Each pending play(): resolved together when the Playhead reaches the end moving forward.
  #waiters: (() => void)[] = [];
  // Whether a play() has yet to draw its first frame.
  #starting = false;
  #destroyed = false;
  // The pool: one record per Element, allocated here and reused by every sample.
  readonly #records: CircleRecord[];
  // Each Emitter's radius at the Playhead being sampled, for the Child start it was last worked out
  // for. Children that start together share one evaluation. Reused by every sample.
  readonly #distances: Float64Array;
  readonly #distanceStarts: Float64Array;

  constructor(spec: ChildSpec, binding: InstanceBinding, driver: Driver, onDestroy?: () => void) {
    this.#resolved = resolve(spec, binding.seed ?? freshSeed());
    this.#records = this.#resolved.elements.map(createRecord);
    this.#distances = new Float64Array(this.#resolved.emitters.length);
    this.#distanceStarts = new Float64Array(this.#resolved.emitters.length);
    this.#onDestroy = onDestroy;
    this.#origin = binding.origin;
    this.#renderer = binding.renderer;
    this.#callbacks = binding;
    this.#driver = driver;
    this.duration = this.#resolved.duration;
    this.#target = {
      duration: this.duration,
      render: (t) => this.#render(t),
      finish: () => this.#finish(),
    };
  }

  play(): Promise<void> {
    if (this.#destroyed) return Promise.resolve();
    const finished = new Promise<void>((resolve) => this.#waiters.push(resolve));
    this.#starting = true;
    this.#attached().play();
    return finished;
  }

  pause(): void {
    if (!this.#destroyed) this.#attached().pause();
  }

  resume(): void {
    if (!this.#destroyed) this.#attached().resume();
  }

  reverse(): void {
    if (!this.#destroyed) this.#attached().reverse();
  }

  seek(t: number): void {
    if (!this.#destroyed) this.#attached().seek(t);
  }

  setProgress(p: number): void {
    this.seek(p * this.duration);
  }

  /** The Playback for this Instance, attaching to the Driver the first time it is needed. */
  #attached(): Playback {
    this.#playback ??= this.#driver.attach(this.#target);
    return this.#playback;
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#playback?.stop();
    this.#playback = undefined;
    this.#renderer.release(this);
    this.#settle();
    this.#onDestroy?.();
  }

  #render(t: number): void {
    if (this.#destroyed) return;
    this.#renderer.draw(this, this.sample(t));
    if (this.#starting) {
      this.#starting = false;
      this.#callbacks.onStart?.();
    }
    // A callback may have destroyed the Instance: nothing more fires after destroy().
    if (!this.#destroyed) this.#callbacks.onUpdate?.(t);
  }

  /** The Driver's word that the Playhead reached the end moving forward: complete any play(). */
  #finish(): void {
    if (this.#waiters.length === 0) return;
    this.#starting = false;
    this.#settle();
    this.#callbacks.onComplete?.();
  }

  #settle(): void {
    const waiters = this.#waiters;
    this.#waiters = [];
    for (const resolve of waiters) resolve();
  }

  sample(t: number): DrawList {
    const { elements, emitters } = this.#resolved;
    const records = this.#records;
    const distances = this.#distances;
    const distanceStarts = this.#distanceStarts.fill(Number.NaN);
    // Indexed loops: this runs every frame for every Element, and must not allocate.
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as ResolvedElement;
      const record = records[i] as CircleRecord;
      let x = this.#origin.x;
      let y = this.#origin.y;
      for (let p = 0; p < element.placements.length; p++) {
        const { emitter, start, dx, dy } = element.placements[p] as Placement;
        // Elements come in tree order, so the Children of one Child share this in a row.
        if (distanceStarts[emitter] !== start) {
          const { radius, duration } = emitters[emitter] as ResolvedEmitter;
          distances[emitter] = numberAt(radius, progressAt(t - start, duration));
          distanceStarts[emitter] = start;
        }
        const distance = distances[emitter] as number;
        x += dx * distance;
        y += dy * distance;
      }
      record.x = x;
      record.y = y;
      paint(record, element, progressAt(t - element.start, element.duration));
    }
    return records;
  }
}

/**
 * One Element, played on its own. Reach for it for a single effect; use a Scope's `shape()` when
 * several Instances should share a frame loop and be released together.
 */
export class Shape<K extends ShapeKind = ShapeKind> extends SpecInstance {
  constructor(spec: ShapeSpec<K>, binding: InstanceBinding) {
    super(spec, binding, createRafDriver());
  }
}

/**
 * `count` Children thrown outward around the Origin, played on its own. Reach for it for the
 * classic burst; nest another Burst as its `children` for bursts of bursts. Use a Scope's `burst()`
 * when several Instances should share a frame loop and be released together.
 */
export class Burst extends SpecInstance {
  constructor(spec: BurstSpec, binding: InstanceBinding) {
    super(spec, binding, createRafDriver());
  }
}
