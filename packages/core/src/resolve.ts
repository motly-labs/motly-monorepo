import { parseColor, type Rgba } from './color.js';
import {
  isKeyframes,
  notAValue,
  resolveKeyframes,
  resolveNumeric,
  resolveValue,
} from './descriptors.js';
import { derive, keyOf } from './rng.js';
import type { ChildSpec, ColorProperty, LengthUnit, NumericProperty } from './spec.js';
import { ANGLE, LENGTH, TIME, UNITLESS, type Units } from './units.js';

const DEFAULT_DURATION = 1;
const DEFAULT_COUNT = 5;
const DEFAULT_BURST_RADIUS: NumericProperty<LengthUnit> = [0, 50];
const DEFAULT_RADIUS = 50;
const DEFAULT_FILL = 'deeppink';
const DEFAULT_STROKE = 'none';

/**
 * A numeric property with every Descriptor resolved and every unit converted: a constant, or two or
 * more Keyframes.
 */
export type ResolvedNumeric = number | readonly number[];

/**
 * A color property with every Descriptor resolved: a constant CSS color exactly as the Spec wrote
 * it, or two or more parsed Keyframes.
 */
export type ResolvedColor = string | readonly Rgba[];

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
  readonly fill: ResolvedColor;
  readonly stroke: ResolvedColor;
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
  const numeric = (name: string, property: NumericProperty<string>, units: Units) =>
    resolveNumeric(property, derive(seed, keyOf(name)), index, units, name);
  if (spec.kind !== 'burst') {
    // A Distributable<NumericValue> holds no Keyframes, so duration resolves to a number.
    const duration = numeric('duration', spec.duration ?? DEFAULT_DURATION, TIME) as number;
    out.push({
      kind: spec.kind,
      duration,
      radius: numeric('radius', spec.radius ?? DEFAULT_RADIUS, LENGTH),
      angle: numeric('angle', spec.angle ?? 0, ANGLE),
      scale: numeric('scale', spec.scale ?? 1, UNITLESS),
      opacity: numeric('opacity', spec.opacity ?? 1, UNITLESS),
      strokeWidth: numeric('strokeWidth', spec.strokeWidth ?? 0, LENGTH),
      fill: color('fill', spec.fill ?? DEFAULT_FILL, index),
      stroke: color('stroke', spec.stroke ?? DEFAULT_STROKE, index),
      placements,
    });
    return duration;
  }
  const emitter: ResolvedEmitter = {
    radius: numeric('radius', spec.radius ?? DEFAULT_BURST_RADIUS, LENGTH),
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

/**
 * Color property `name` for the Child at `index`. A constant passes through as written, so `none`
 * and `currentColor` still work; Keyframes are parsed now, so a bad one throws at creation.
 */
function color(name: string, property: ColorProperty, index: number): ResolvedColor {
  const value = resolveValue(property, index);
  if (typeof value === 'string') return value;
  if (!isKeyframes(value)) throw notAValue(name, value);
  const frames = resolveKeyframes(value, name, (frame) => parseColor(frame, name));
  return frames.length === 1 ? value[0] : frames;
}
