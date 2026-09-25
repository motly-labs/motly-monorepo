/**
 * `@motly/core` — the renderer-agnostic engine.
 *
 * Invariant: this entry has zero runtime dependencies and never touches the DOM. Renderers live
 * in their own subpath entries.
 */

export {
  type Distributable,
  type EachDescriptor,
  each,
  type RandDescriptor,
  rand,
} from './descriptors.js';
export type { CircleRecord, DrawList, DrawRecord, Style, Transform } from './draw-list.js';
export type { Driver, DriverTarget, Playback } from './driver.js';
export { Burst, type Instance, type InstanceBinding, type Origin, Shape } from './instance.js';
export type { Renderer } from './renderer.js';
export { createScope, type Scope, type ScopeOptions } from './scope.js';
export type {
  AngleUnit,
  BurstSpec,
  ChildSpec,
  ColorProperty,
  Keyframes,
  LengthUnit,
  NumericProperty,
  NumericValue,
  ShapeKind,
  ShapeSpec,
  TimeUnit,
} from './spec.js';

export const VERSION = '0.0.0';
