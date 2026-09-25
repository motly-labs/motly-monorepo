/** Where an Element sits: position in the Renderer's space, rotation in degrees, uniform scale. */
export interface Transform {
  x: number;
  y: number;
  angle: number;
  scale: number;
}

/**
 * How an Element is painted. `fill` and `stroke` are CSS color strings a Renderer can hand straight
 * to an SVG attribute or a Canvas `fillStyle`/`strokeStyle`: a constant color exactly as the Spec
 * wrote it (so possibly `none` or `currentColor`), or, while animating, `rgba(r, g, b, a)` with
 * whole-number channels in 0–255 and alpha in 0–1 to three decimals.
 */
export interface Style {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

/** One circle Element for one frame. */
export interface CircleRecord extends Transform, Style {
  kind: 'circle';
  radius: number;
}

/** One Element for one frame: its kind, that kind's parameters, a transform and a style. */
export type DrawRecord = CircleRecord;

/** Everything to paint for one frame of one Instance. Valid until that Instance is sampled again. */
export type DrawList = readonly DrawRecord[];
