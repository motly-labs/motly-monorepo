import type { CircleRecord, DrawList } from './draw-list.js';
import { createRafDriver, type Driver, type DriverTarget, type Playback } from './driver.js';
import type { Renderer } from './renderer.js';
import type { NumericProperty, ShapeKind, ShapeSpec } from './spec.js';
import { clamp, lerp } from './utils/index.js';

/** A point in a Renderer's coordinate space. */
export interface Origin {
  x: number;
  y: number;
}

/** What an Instance is bound to at creation. None of it belongs in the Spec. */
export interface InstanceBinding {
  renderer: Renderer;
  origin: Origin;
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

const DEFAULT_DURATION = 1;
const DEFAULT_RADIUS = 50;
const DEFAULT_FILL = 'deeppink';
const DEFAULT_STROKE = 'none';

function valueAt(property: NumericProperty, progress: number): number {
  return typeof property === 'number' ? property : lerp(property[0], property[1], progress);
}

export class ShapeInstance implements Instance {
  readonly duration: number;
  readonly #spec: ShapeSpec;
  readonly #origin: Origin;
  readonly #renderer: Renderer;
  readonly #driver: Driver;
  readonly #target: DriverTarget;
  readonly #onDestroy: (() => void) | undefined;
  #playback: Playback | undefined;
  #waiters: (() => void)[] = [];
  #destroyed = false;
  readonly #record: CircleRecord = {
    kind: 'circle',
    radius: 0,
    x: 0,
    y: 0,
    angle: 0,
    scale: 1,
    fill: DEFAULT_FILL,
    stroke: DEFAULT_STROKE,
    strokeWidth: 0,
    opacity: 1,
  };
  readonly #list: DrawList = [this.#record];

  constructor(spec: ShapeSpec, binding: InstanceBinding, driver: Driver, onDestroy?: () => void) {
    this.#spec = spec;
    this.#onDestroy = onDestroy;
    this.#origin = binding.origin;
    this.#renderer = binding.renderer;
    this.#driver = driver;
    this.duration = spec.duration ?? DEFAULT_DURATION;
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
    const progress = this.duration > 0 ? clamp(t / this.duration, 0, 1) : 1;
    const spec = this.#spec;
    const record = this.#record;
    record.radius = valueAt(spec.radius ?? DEFAULT_RADIUS, progress);
    record.x = this.#origin.x;
    record.y = this.#origin.y;
    record.angle = valueAt(spec.angle ?? 0, progress);
    record.scale = valueAt(spec.scale ?? 1, progress);
    record.fill = spec.fill ?? DEFAULT_FILL;
    record.stroke = spec.stroke ?? DEFAULT_STROKE;
    record.strokeWidth = valueAt(spec.strokeWidth ?? 0, progress);
    record.opacity = valueAt(spec.opacity ?? 1, progress);
    return this.#list;
  }
}

/**
 * One Element, played on its own. Reach for it for a single effect; use a Scope's `shape()` when
 * several Instances should share a frame loop and be released together.
 */
export class Shape<K extends ShapeKind = ShapeKind> extends ShapeInstance {
  constructor(spec: ShapeSpec<K>, binding: InstanceBinding) {
    super(spec, binding, createRafDriver());
  }
}
