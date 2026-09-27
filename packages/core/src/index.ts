/**
 * `@motly/core` — the renderer-agnostic engine.
 *
 * Invariant: this entry has zero runtime dependencies and never touches the DOM. Renderers live
 * in their own subpath entries.
 */

export {
  backIn,
  backInOut,
  backOut,
  bounceIn,
  bounceInOut,
  bounceOut,
  circIn,
  circInOut,
  circOut,
  cubicIn,
  cubicInOut,
  cubicOut,
  elasticIn,
  elasticInOut,
  elasticOut,
  expoIn,
  expoInOut,
  expoOut,
  quadIn,
  quadInOut,
  quadOut,
  quartIn,
  quartInOut,
  quartOut,
  quintIn,
  quintInOut,
  quintOut,
  sineIn,
  sineInOut,
  sineOut,
} from './curves.js';
export {
  type Distributable,
  type EachDescriptor,
  each,
  type RandDescriptor,
  rand,
} from './descriptors.js';
export type {
  CircleRecord,
  CrossRecord,
  DrawList,
  DrawRecord,
  LineRecord,
  PathRecord,
  PolygonRecord,
  StarRecord,
  Style,
  Transform,
  ZigzagRecord,
} from './draw-list.js';
export type { Driver, DriverTarget, Playback } from './driver.js';
export type { CssEasing, CubicBezier, Curve, PathCurve } from './easing.js';
export { Burst, type Instance, type InstanceBinding, type Origin, Shape } from './instance.js';
export { isMotionReduced, type ReducedMotion } from './reduced-motion.js';
export type { Renderer } from './renderer.js';
export { createScope, type Scope, type ScopeOptions } from './scope.js';
export type {
  AngleUnit,
  BurstSpec,
  ChildSpec,
  ColorProperty,
  Easing,
  Keyframes,
  LengthUnit,
  NumericProperty,
  NumericValue,
  ShapeKind,
  ShapeSpec,
  SwirlSpec,
  TimeUnit,
} from './spec.js';
export type { Timeline, TimelineOptions } from './timeline.js';
