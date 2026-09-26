import { describe, expect, it } from 'vitest';
import {
  type BurstSpec,
  type ChildSpec,
  createScope,
  each,
  type Renderer,
  type ShapeSpec,
} from './index.js';

const renderer: Renderer = { draw() {}, release() {} };
const binding = { renderer, origin: { x: 0, y: 0 } };

describe('the Element kinds', () => {
  it('draws a polygon as its parameters, not its geometry: radius and points', () => {
    const shape = createScope().shape(
      { kind: 'polygon', points: 5, radius: [0, 40], duration: 1 },
      binding,
    );

    expect(shape.sample(0.5)[0]).toMatchObject({ kind: 'polygon', points: 5, radius: 20 });
  });

  it('types each kind by its own parameters, so a polygon needs points and a circle takes none', () => {
    const polygon: ShapeSpec<'polygon'> = { kind: 'polygon', points: 6 };
    // @ts-expect-error A polygon needs points.
    const pointless: ShapeSpec<'polygon'> = { kind: 'polygon' };
    // @ts-expect-error A circle has no points.
    const pointy: ShapeSpec<'circle'> = { kind: 'circle', points: 6 };

    expect(() => createScope().shape(polygon, binding)).not.toThrow();
    expect(() => createScope().shape(pointless, binding)).toThrow(/points is missing/);
    expect(() => createScope().shape(pointy, binding)).toThrow(/points is not a field of a circle/);
  });

  it("draws a star's notches as a fraction of its radius, a half if left out, and animates it", () => {
    const star = createScope().shape({ kind: 'star', points: 5, radius: 30 }, binding);
    const easing = createScope().shape(
      { kind: 'star', points: 4, innerRadius: [0.2, 0.6], easing: { innerRadius: 'linear' } },
      binding,
    );

    expect(star.sample(0)[0]).toMatchObject({
      kind: 'star',
      points: 5,
      radius: 30,
      innerRadius: 0.5,
    });
    expect(easing.sample(0.5)[0]).toMatchObject({ innerRadius: 0.4 });
  });

  it('swings a zigzag a quarter of its radius if left out, moving with the radius', () => {
    const shape = createScope().shape(
      { kind: 'zigzag', points: 6, radius: [0, 40], duration: 1 },
      binding,
    );
    const swinging = createScope().shape(
      { kind: 'zigzag', points: 3, radius: 40, amplitude: [0, '8px'], duration: 1 },
      binding,
    );

    // Held flat, then rising: at halfway the curve has not moved.
    const eased = createScope().shape(
      {
        kind: 'zigzag',
        points: 6,
        radius: [0, 40],
        duration: 1,
        easing: { amplitude: 'M0,100 L50,100 L100,0' },
      },
      binding,
    );

    expect(shape.sample(0.5)[0]).toMatchObject({ kind: 'zigzag', points: 6, amplitude: 5 });
    expect(eased.sample(0.5)[0]).toMatchObject({ radius: 20, amplitude: 0 });
    expect(swinging.sample(0.5)[0]).toMatchObject({ amplitude: 4 });
  });

  it('strokes a cross, a line and a zigzag when the Spec gives no style, since they enclose nothing', () => {
    const style = { fill: 'none', stroke: 'deeppink', strokeWidth: 2 };
    for (const spec of [
      { kind: 'cross' },
      { kind: 'line' },
      { kind: 'zigzag', points: 4 },
    ] satisfies ShapeSpec[]) {
      expect(createScope().shape(spec, binding).sample(0)[0]).toMatchObject({
        ...style,
        radius: 50,
      });
    }
    expect(
      createScope().shape({ kind: 'line', stroke: 'cyan' }, binding).sample(0)[0],
    ).toMatchObject({ fill: 'none', stroke: 'cyan', strokeWidth: 2 });
    expect(createScope().shape({ kind: 'polygon', points: 3 }, binding).sample(0)[0]).toMatchObject(
      { fill: 'deeppink', stroke: 'none', strokeWidth: 0 },
    );
  });

  it("references a custom path's data from the Spec rather than building geometry", () => {
    const d = 'M50,90 C0,50 20,0 50,30 C80,0 100,50 50,90 Z';
    const shape = createScope().shape({ kind: 'path', d, radius: [0, 20] }, binding);

    expect(shape.sample(1)[0]).toMatchObject({ kind: 'path', d, radius: 20 });
  });

  it('mixes kinds in one Burst with each() of Child Specs, each typed by its own kind', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 4,
        children: each([
          { kind: 'circle', radius: 5 },
          { kind: 'polygon', points: 3 },
          { kind: 'star', points: 5 },
        ]),
      },
      binding,
    );
    const pointy: BurstSpec = {
      kind: 'burst',
      // @ts-expect-error A circle has no points, even handed out by each().
      children: each([{ kind: 'circle', points: 3 }]),
    };

    expect(burst.sample(0).map((record) => record.kind)).toEqual([
      'circle',
      'polygon',
      'star',
      'circle',
    ]);
    expect(() => createScope().burst(pointy, binding)).toThrow(
      /children\.each\[0\]\.points is not a field of a circle/,
    );
  });

  it('checks each kind like any Spec: its whole numbers, its path, and its easing names', () => {
    const make = (spec: unknown) => () =>
      createScope().shape(spec as ChildSpec as ShapeSpec, binding);

    expect(make({ kind: 'polygon', points: 2 })).toThrow(
      /points cannot be 2. Use a whole number, 3 or more/,
    );
    expect(make({ kind: 'star', points: 4.5 })).toThrow(/points cannot be 4.5/);
    expect(make({ kind: 'zigzag', points: 1 })).toThrow(/2 or more/);
    expect(make({ kind: 'path' })).toThrow(/d is missing/);
    expect(make({ kind: 'path', d: 'circle' })).toThrow(/d cannot be 'circle'. Use an SVG path/);
    expect(make({ kind: 'polygon', points: 3, easing: { points: 'ease' } })).toThrow(
      /easing\.points names no property/,
    );
    expect(make({ kind: 'line', innerRadius: 0.5 })).toThrow(
      /innerRadius is not a field of a line/,
    );
  });

  it('survives JSON: a Burst mixing kinds round-trips and draws the same', () => {
    const spec: BurstSpec = {
      kind: 'burst',
      count: 6,
      radius: [0, 60],
      children: each([
        { kind: 'star', points: each([4, 5]), innerRadius: [0.3, 0.7] },
        { kind: 'zigzag', points: 5, amplitude: '6px' },
        { kind: 'path', d: 'M0,0 L100,100' },
      ]),
    };
    const make = (burstSpec: BurstSpec) => createScope().burst(burstSpec, { ...binding, seed: 5 });

    expect(make(JSON.parse(JSON.stringify(spec))).sample(0.4)).toEqual(make(spec).sample(0.4));
  });
});
