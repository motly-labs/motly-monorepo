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

/** What every Element's record carries: its transform, its style and its size. */
interface ElementRecord extends Transform, Style {
  /** From the centre to the outline's farthest reach, as each kind defines it. */
  radius: number;
}

/** One circle Element for one frame. */
export interface CircleRecord extends ElementRecord {
  kind: 'circle';
}

/** One regular polygon for one frame: `points` corners, `radius` out, the first at 12 o'clock. */
export interface PolygonRecord extends ElementRecord {
  kind: 'polygon';
  points: number;
}

/**
 * One star for one frame: `points` tips `radius` out, the first at 12 o'clock, with a notch between
 * each pair `innerRadius` × `radius` out.
 */
export interface StarRecord extends ElementRecord {
  kind: 'star';
  points: number;
  innerRadius: number;
}

/** One plus-shaped cross for one frame: two lines through the centre, each arm `radius` long. */
export interface CrossRecord extends ElementRecord {
  kind: 'cross';
}

/** One line for one frame, from `radius` above the centre to `radius` below it. */
export interface LineRecord extends ElementRecord {
  kind: 'line';
}

/**
 * One zigzag for one frame: `points` corners evenly spaced from `radius` above the centre to
 * `radius` below it. The two ends sit on that line; the corners between swing `amplitude` to
 * either side in turn, the first to the right.
 */
export interface ZigzagRecord extends ElementRecord {
  kind: 'zigzag';
  points: number;
  amplitude: number;
}

/**
 * One custom path for one frame: `d` exactly as the Spec wrote it, drawn in a 100×100 box centred
 * on (50, 50) and scaled so that box is 2 × `radius` wide. The stroke width is not scaled with it.
 */
export interface PathRecord extends ElementRecord {
  kind: 'path';
  d: string;
}

/**
 * One Element for one frame: its kind, that kind's parameters, a transform and a style. A Renderer
 * switches on `kind` to reach each kind's parameters, and builds the geometry itself.
 */
export type DrawRecord =
  | CircleRecord
  | PolygonRecord
  | StarRecord
  | CrossRecord
  | LineRecord
  | ZigzagRecord
  | PathRecord;

/** Everything to paint for one frame of one Instance. Valid until that Instance is sampled again. */
export type DrawList = readonly DrawRecord[];
