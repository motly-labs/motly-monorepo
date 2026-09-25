import { resolveNumeric, resolveValue } from './descriptors.js';
import { derive, keyOf } from './rng.js';
import type { ChildSpec, NumericProperty } from './spec.js';

const DEFAULT_DURATION = 1;
const DEFAULT_COUNT = 5;
const DEFAULT_BURST_RADIUS: NumericProperty = [0, 50];
const DEFAULT_RADIUS = 50;
const DEFAULT_FILL = 'deeppink';
const DEFAULT_STROKE = 'none';

/** A numeric property with every Descriptor resolved: a constant, or two Keyframes. */
export type ResolvedNumeric = number | readonly [from: number, to: number];

/** One Emitter in the resolved tree. `duration` is derived from its Children. */
export interface ResolvedEmitter {
  readonly radius: ResolvedNumeric;
  duration: number;
}

/** Where one Emitter puts one Child: a unit direction from the Emitter's Origin. */
export interface Placement {
  readonly emitter: ResolvedEmitter;
  readonly dx: number;
  readonly dy: number;
}

/**
 * One Element with concrete values for every property, and every Placement between it and the
 * Instance's Origin, outermost first.
 */
export interface ResolvedElement {
  readonly kind: 'circle';
  readonly duration: number;
  readonly radius: ResolvedNumeric;
  readonly angle: ResolvedNumeric;
  readonly scale: ResolvedNumeric;
  readonly opacity: ResolvedNumeric;
  readonly strokeWidth: ResolvedNumeric;
  readonly fill: string;
  readonly stroke: string;
  readonly placements: readonly Placement[];
}

/** A Spec flattened into its Elements. Built once per Instance, never per frame. */
export interface ResolvedTree {
  /** The latest end across every Child, recursively (ADR-0016). */
  readonly duration: number;
  readonly elements: readonly ResolvedElement[];
}

/** Resolve `spec` under `seed`, the Instance's Seed. */
export function resolve(spec: ChildSpec, seed: number): ResolvedTree {
  const elements: ResolvedElement[] = [];
  const duration = walk(spec, seed >>> 0, 0, [], elements);
  return { duration, elements };
}

/** Append `spec`'s Elements to `out` and return the latest end among them. */
function walk(
  spec: ChildSpec,
  seed: number,
  index: number,
  placements: readonly Placement[],
  out: ResolvedElement[],
): number {
  // Each property draws from its own Seed, derived from its name, so adding a property to a Spec
  // leaves the values of the others unchanged.
  const numeric = (name: string, property: NumericProperty) =>
    resolveNumeric(property, derive(seed, keyOf(name)), index);
  if (spec.kind !== 'burst') {
    // A Distributable<NumericValue> holds no Keyframes, so duration resolves to a number.
    const duration = numeric('duration', spec.duration ?? DEFAULT_DURATION) as number;
    out.push({
      kind: spec.kind,
      duration,
      radius: numeric('radius', spec.radius ?? DEFAULT_RADIUS),
      angle: numeric('angle', spec.angle ?? 0),
      scale: numeric('scale', spec.scale ?? 1),
      opacity: numeric('opacity', spec.opacity ?? 1),
      strokeWidth: numeric('strokeWidth', spec.strokeWidth ?? 0),
      fill: resolveValue(spec.fill ?? DEFAULT_FILL, index),
      stroke: resolveValue(spec.stroke ?? DEFAULT_STROKE, index),
      placements,
    });
    return duration;
  }
  const emitter: ResolvedEmitter = {
    radius: numeric('radius', spec.radius ?? DEFAULT_BURST_RADIUS),
    duration: 0,
  };
  const count = spec.count ?? DEFAULT_COUNT;
  for (let index = 0; index < count; index++) {
    // Clockwise from 12 o'clock in a y-down space.
    const angle = (2 * Math.PI * index) / count;
    const placement: Placement = { emitter, dx: Math.sin(angle), dy: -Math.cos(angle) };
    // Each Child's Seed comes from this one and its index, so raising `count` leaves the Seeds of
    // the existing Children unchanged.
    const end = walk(spec.children, derive(seed, index), index, [...placements, placement], out);
    emitter.duration = Math.max(emitter.duration, end);
  }
  return emitter.duration;
}
