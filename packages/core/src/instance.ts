import type { DrawList, DrawRecord } from './draw-list.js';
import { createRafDriver, type Driver, type DriverTarget, type Playback } from './driver.js';
import { isMotionReduced, type ReducedMotion } from './reduced-motion.js';
import type { Renderer } from './renderer.js';
import {
  type Placement,
  type ResolvedElement,
  type ResolvedEmitter,
  type ResolvedNumeric,
  type ResolvedSwirl,
  type ResolvedTree,
  resolve,
} from './resolve.js';
import type { BurstSpec, ChildSpec, ShapeKind, ShapeSpec } from './spec.js';
import { colorAt, easedAt, numberAt } from './tween.js';
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
  /**
   * Whether to show the Spec's still Resting frame instead of motion. `'user'`, the default,
   * follows the viewer's `prefers-reduced-motion`, read at each `play()`. Under reduced motion,
   * `play()` draws the frame at `restAt` × `duration` once and resolves at once, `resume()` does
   * nothing, and `reverse()` jumps to the first frame; no Driver runs. `seek()` and
   * `setProgress()` still move the Playhead, as the page calls them on the viewer's own input.
   * Leave it out to respect the viewer; force it only in a demo or a test. Ignored on a Timeline,
   * which decides for everything on it.
   */
  reducedMotion?: ReducedMotion;
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

/**
 * A Spec bound to a Renderer and an Origin: the thing that plays and is destroyed. On a Timeline,
 * the Timeline moves its Playhead: its `play()`, `pause()`, `resume()`, `reverse()`, `seek()` and
 * `setProgress()` do nothing, though `play()` still resolves when the Timeline carries it past its
 * end.
 */
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
function paint(record: DrawRecord, element: ResolvedElement, progress: number): void {
  record.radius = numberAt(element.radius, progress);
  record.angle = numberAt(element.angle, progress);
  record.scale = numberAt(element.scale, progress);
  record.fill = colorAt(element.fill, progress);
  record.stroke = colorAt(element.stroke, progress);
  record.strokeWidth = numberAt(element.strokeWidth, progress);
  record.opacity = numberAt(element.opacity, progress);
  if (element.animated.length > 0) paintAnimated(record, element.animated, progress);
}

/** Write a kind's own animated parameters, beyond `radius`, at `progress` into `record`. */
function paintAnimated(
  record: DrawRecord,
  animated: ResolvedElement['animated'],
  progress: number,
): void {
  for (let i = 0; i < animated.length; i++) {
    const [name, value] = animated[i] as readonly [string, ResolvedNumeric];
    (record as unknown as Record<string, number>)[name] = numberAt(value, progress);
  }
}

/** How far, in radians clockwise, `swirls` turn a throw `progress` of the way through it, 0–1. */
function turnAt(swirls: readonly ResolvedSwirl[], progress: number): number {
  let turn = 0;
  for (let i = 0; i < swirls.length; i++) {
    const { amplitude, rate } = swirls[i] as ResolvedSwirl;
    turn += amplitude * Math.sin(rate * progress);
  }
  return turn;
}

/** The pooled record for `element`, with its kind's held parameters already set. */
function createRecord(element: ResolvedElement): DrawRecord {
  const record = {
    kind: element.kind,
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
  if (element.kind === 'circle') return record as DrawRecord;
  const animated = Object.fromEntries(element.animated.map(([name]) => [name, 0]));
  // The resolver gives each kind exactly the parameters its record type names.
  return Object.assign(record, element.held, animated) as DrawRecord;
}

/**
 * What an Instance hands its Driver: a DriverTarget, and the Playhead of its Resting frame, which
 * a Timeline reads to show each Instance on it at its own.
 */
export interface InstanceTarget extends DriverTarget {
  readonly rest: number;
}

/** Any Spec bound to a Renderer, an Origin and a Driver. Shape and Burst are this, typed. */
export class SpecInstance implements Instance {
  readonly duration: number;
  readonly #resolved: ResolvedTree;
  readonly #origin: Origin;
  readonly #renderer: Renderer;
  readonly #target: InstanceTarget;
  readonly #onDestroy: (() => void) | undefined;
  readonly #callbacks: Pick<InstanceBinding, 'onStart' | 'onUpdate' | 'onComplete'>;
  readonly #reducedMotion: ReducedMotion;
  readonly #playback: Playback;
  // Each pending play(): resolved together when the Playhead reaches the end moving forward.
  #waiters: (() => void)[] = [];
  // Whether a play() has yet to draw its first frame.
  #starting = false;
  #destroyed = false;
  // The pool: one record per Element, allocated here and reused by every sample.
  readonly #records: DrawRecord[];
  // Each Emitter's radius at the Playhead being sampled, for the Child start it was last worked out
  // for. Children that start together share one evaluation. Reused by every sample.
  readonly #distances: Float64Array;
  // How far each of those radii is through its throw, eased, 0–1: what a Swirl's waves follow.
  readonly #throwProgress: Float64Array;
  readonly #distanceStarts: Float64Array;

  constructor(spec: ChildSpec, binding: InstanceBinding, driver: Driver, onDestroy?: () => void) {
    this.#resolved = resolve(spec, binding.seed ?? freshSeed());
    this.#records = this.#resolved.elements.map(createRecord);
    this.#distances = new Float64Array(this.#resolved.emitters.length);
    this.#throwProgress = new Float64Array(this.#resolved.emitters.length);
    this.#distanceStarts = new Float64Array(this.#resolved.emitters.length);
    this.#onDestroy = onDestroy;
    this.#origin = binding.origin;
    this.#renderer = binding.renderer;
    this.#callbacks = binding;
    this.#reducedMotion = binding.reducedMotion ?? 'user';
    this.duration = this.#resolved.duration;
    this.#target = {
      duration: this.duration,
      rest: this.#resolved.restAt * this.duration,
      render: (t) => this.#render(t),
      finish: () => this.#finish(),
    };
    // Attached now, paused at 0 with nothing drawn, so a Timeline knows every Instance on it.
    this.#playback = driver.attach(this.#target);
  }

  play(): Promise<void> {
    if (this.#destroyed) return Promise.resolve();
    const finished = new Promise<void>((resolve) => this.#waiters.push(resolve));
    this.#starting = true;
    if (isMotionReduced(this.#reducedMotion)) {
      // The Resting frame, drawn once as a play that went straight to its end, with the Playhead
      // left on it. A seek moves no frame loop.
      this.#playback.pause();
      this.#playback.seek(this.#target.rest);
      this.#finish();
    } else {
      this.#playback.play();
    }
    return finished;
  }

  pause(): void {
    if (!this.#destroyed) this.#playback.pause();
  }

  resume(): void {
    if (!this.#destroyed && !isMotionReduced(this.#reducedMotion)) this.#playback.resume();
  }

  reverse(): void {
    if (this.#destroyed) return;
    if (isMotionReduced(this.#reducedMotion)) {
      // Where reversing would have run to, without running.
      this.#playback.pause();
      this.#playback.seek(0);
    } else {
      this.#playback.reverse();
    }
  }

  seek(t: number): void {
    if (!this.#destroyed) this.#playback.seek(t);
  }

  setProgress(p: number): void {
    this.seek(p * this.duration);
  }

  destroy(): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#playback.stop();
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
    const throwProgress = this.#throwProgress;
    const distanceStarts = this.#distanceStarts.fill(Number.NaN);
    // Indexed loops: this runs every frame for every Element, and must not allocate.
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as ResolvedElement;
      const record = records[i] as DrawRecord;
      let x = this.#origin.x;
      let y = this.#origin.y;
      for (let p = 0; p < element.placements.length; p++) {
        const placement = element.placements[p] as Placement;
        const { emitter, start } = placement;
        // Elements come in tree order, so the Children of one Child share this in a row.
        if (distanceStarts[emitter] !== start) {
          const { radius, duration } = emitters[emitter] as ResolvedEmitter;
          const progress = progressAt(t - start, duration);
          distances[emitter] = numberAt(radius, progress);
          throwProgress[emitter] = easedAt(radius, progress);
          distanceStarts[emitter] = start;
        }
        const distance = distances[emitter] as number;
        if (placement.swirls.length === 0) {
          x += placement.dx * distance;
          y += placement.dy * distance;
        } else {
          const turn = turnAt(placement.swirls, throwProgress[emitter] as number);
          const cos = Math.cos(turn);
          const sin = Math.sin(turn);
          x += (placement.dx * cos - placement.dy * sin) * distance;
          y += (placement.dx * sin + placement.dy * cos) * distance;
        }
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
    // A ShapeSpec<K> is one of ShapeSpec's members; the compiler cannot see it through K.
    super(spec as ShapeSpec, binding, createRafDriver());
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
