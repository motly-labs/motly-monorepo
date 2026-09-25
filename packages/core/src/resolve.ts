import type { ChildSpec, NumericProperty, ShapeSpec } from './spec.js';

const DEFAULT_DURATION = 1;
const DEFAULT_COUNT = 5;
const DEFAULT_BURST_RADIUS: NumericProperty = [0, 50];

/** One Emitter in the resolved tree. `duration` is derived from its Children. */
export interface ResolvedEmitter {
  readonly radius: NumericProperty;
  duration: number;
}

/** Where one Emitter puts one Child: a unit direction from the Emitter's Origin. */
export interface Placement {
  readonly emitter: ResolvedEmitter;
  readonly dx: number;
  readonly dy: number;
}

/** One Element, with every Placement between it and the Instance's Origin, outermost first. */
export interface ResolvedElement {
  readonly spec: ShapeSpec;
  readonly duration: number;
  readonly placements: readonly Placement[];
}

/** A Spec flattened into its Elements. Built once per Instance, never per frame. */
export interface Resolved {
  /** The latest end across every Child, recursively (ADR-0016). */
  readonly duration: number;
  readonly elements: readonly ResolvedElement[];
}

export function resolve(spec: ChildSpec): Resolved {
  const elements: ResolvedElement[] = [];
  const duration = walk(spec, [], elements);
  return { duration, elements };
}

/** Append `spec`'s Elements to `out` and return the latest end among them. */
function walk(spec: ChildSpec, placements: readonly Placement[], out: ResolvedElement[]): number {
  if (spec.kind !== 'burst') {
    const duration = spec.duration ?? DEFAULT_DURATION;
    out.push({ spec, duration, placements });
    return duration;
  }
  const emitter: ResolvedEmitter = { radius: spec.radius ?? DEFAULT_BURST_RADIUS, duration: 0 };
  const count = spec.count ?? DEFAULT_COUNT;
  for (let index = 0; index < count; index++) {
    // Clockwise from 12 o'clock in a y-down space.
    const angle = (2 * Math.PI * index) / count;
    const placement: Placement = { emitter, dx: Math.sin(angle), dy: -Math.cos(angle) };
    const end = walk(spec.children, [...placements, placement], out);
    emitter.duration = Math.max(emitter.duration, end);
  }
  return emitter.duration;
}
