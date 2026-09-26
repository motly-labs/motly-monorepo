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
}

/** A Spec bound to a Renderer and an Origin: the thing that plays and is destroyed. */
export interface Instance {
  /** Seconds from the first frame to the last. */
  readonly duration: number;
  /** The Draw list at Playhead `t` seconds. Pure: depends on nothing but `t`. */
  sample(t: number): DrawList;
  /** Play from the start. Resolves when the Playhead reaches the end, or on `destroy()`. */
  play(): Promise<void>;
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
  #playback: Playback | undefined;
  #waiters: (() => void)[] = [];
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
    this.#driver = driver;
    this.duration = this.#resolved.duration;
    this.#target = {
      duration: this.duration,
      render: (t) => this.#render(t),
      finish: () => this.#settle(),
    };
  }

  play(): Promise<void> {
    if (this.#destroyed) return Promise.resolve();
    this.#playback?.stop();
    const finished = new Promise<void>((resolve) => this.#waiters.push(resolve));
    this.#playback = this.#driver.play(this.#target);
    return finished;
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
    this.#renderer.draw(this, this.sample(t));
    if (t >= this.duration) this.#settle();
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
