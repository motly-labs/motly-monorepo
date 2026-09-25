import { describe, expect, it } from 'vitest';
import {
  backInOut,
  backOut,
  type Curve,
  createScope,
  each,
  expoIn,
  expoInOut,
  type InstanceBinding,
  quadOut,
  type Renderer,
  type ShapeSpec,
} from './index.js';

const renderer: Renderer = { draw() {}, release() {} };
const binding: InstanceBinding = { renderer, origin: { x: 0, y: 0 }, seed: 1 };
const circle = (spec: Omit<ShapeSpec<'circle'>, 'kind'>) =>
  createScope().shape({ kind: 'circle', ...spec }, binding);
const first = (spec: Omit<ShapeSpec<'circle'>, 'kind'>, t: number) => {
  const record = circle(spec).sample(t)[0];
  if (record === undefined) throw new Error('no record');
  return record;
};
/** The eased progress of `curve` at each of `xs`, read off a radius tweened 0 → 1. */
const eased = (curve: Curve, xs: readonly number[]) =>
  xs.map((x) => first({ radius: [0, 1], easing: curve }, x).radius);

const XS = [0.1, 0.25, 0.5, 0.75, 0.9];

/**
 * Chrome's own `cubic-bezier()` at `XS`, read from the Web Animations API
 * (`effect.getComputedTiming().progress`, duration 1e6 ms). The tolerance is 1e-6.
 */
const CHROME: readonly (readonly [Curve, readonly number[]])[] = [
  [
    'ease',
    [
      0.09479630571576989, 0.4085105913555371, 0.8024033910598437, 0.9604589783649767,
      0.9943164774961483,
    ],
  ],
  [
    'ease-in',
    [
      0.017026631752235472, 0.0934646510311063, 0.31535673426536154, 0.621861869174206,
      0.839427844517541,
    ],
  ],
  [
    'ease-out',
    [
      0.16057215548245898, 0.378138130825794, 0.6846432657346383, 0.9065353489688935,
      0.9829733682477645,
    ],
  ],
  [
    'ease-in-out',
    [0.019722453548276987, 0.129161931047288, 0.5, 0.8708380689527122, 0.9802775464517232],
  ],
  [
    [0.175, 0.885, 0.32, 1.275],
    [
      0.4482615811141011, 0.8466805122245409, 1.0675526850700414, 1.075874905974863,
      1.0369283110344774,
    ],
  ],
  [
    [0.68, -0.55, 0.265, 1.55],
    [
      -0.06629147596609188, -0.08280711019239485, 0.6066798972541555, 1.0891657755583135,
      1.0623731939374257,
    ],
  ],
  [
    [0.95, 0.05, 0.795, 0.035],
    [
      0.005283169260915699, 0.013884135669151986, 0.03719650937052523, 0.127613507225601,
      0.48746828850689095,
    ],
  ],
  [
    [1, 0, 0, 1],
    [0.003761673464540662, 0.029724605505949603, 0.5, 0.9702753944940504, 0.9962383265354594],
  ],
];

describe('a curve', () => {
  it('is linear when none is given', () => {
    expect(eased('linear', XS)).toEqual(XS);
    expect(XS.map((x) => first({ radius: [0, 1] }, x).radius)).toEqual(XS);
  });

  it.each(CHROME)('%j matches CSS cubic-bezier() within 1e-6', (curve, expected) => {
    const actual = eased(curve, XS);
    for (const [i, value] of expected.entries()) expect(actual[i]).toBeCloseTo(value, 6);
  });

  it('stays exact where the curve is vertical', () => {
    // [1, 0, 0, 1] is symmetric about (0.5, 0.5) and vertical there.
    const [below = 0, above = 0] = eased(expoInOut, [0.4999, 0.5001]);
    expect(below + above).toBeCloseTo(1, 9);
    // [0, 0.5, 0, 0.5] has x = t³ and y = t³ − 1.5t² + 1.5t: vertical at the start.
    const exact = (x: number) => x - 1.5 * x ** (2 / 3) + 1.5 * Math.cbrt(x);
    const xs = [1e-6, 0.001, 0.2, 0.5];
    for (const [i, y] of eased([0, 0.5, 0, 0.5], xs).entries()) {
      expect(y).toBeCloseTo(exact(xs[i] as number), 9);
    }
  });

  it('holds its ends exactly', () => {
    expect(eased(backInOut, [0, 1])).toEqual([0, 1]);
  });

  it('can be a named curve, which is its cubic-bezier as data', () => {
    expect(backOut).toEqual([0.175, 0.885, 0.32, 1.275]);
    expect(eased(backOut, XS)).toEqual(eased([0.175, 0.885, 0.32, 1.275], XS));
    expect(eased(expoIn, XS)).toEqual(eased([0.95, 0.05, 0.795, 0.035], XS));
  });

  it('that overshoots carries on past the last Keyframe', () => {
    const radius = first({ radius: [0, 10, 20], easing: backOut }, 0.5).radius;

    expect(radius).toBeCloseTo(21.35, 2);
  });

  it('eases colors too', () => {
    expect(first({ fill: ['#000', '#fff'], easing: [1, 0, 0, 1] }, 0.25).fill).toBe(
      'rgba(8, 8, 8, 1)',
    );
  });
});

describe('easing per property', () => {
  it('applies one curve to every property', () => {
    const record = first({ radius: [0, 1], opacity: [0, 1], easing: 'ease-out' }, 0.5);

    expect(record.radius).toBeCloseTo(0.6846432657346383, 6);
    expect(record.opacity).toBeCloseTo(0.6846432657346383, 6);
  });

  it('takes a map by property name, with a default for the rest', () => {
    const spec = { radius: [0, 1], opacity: [0, 1], scale: [0, 1] } as const;
    const mapped = first({ ...spec, easing: { default: 'ease-out', opacity: 'ease-in' } }, 0.5);
    const noDefault = first({ ...spec, easing: { opacity: 'ease-in' } }, 0.5);

    expect(mapped.radius).toBeCloseTo(0.6846432657346383, 6);
    expect(mapped.scale).toBeCloseTo(0.6846432657346383, 6);
    expect(mapped.opacity).toBeCloseTo(0.31535673426536154, 6);
    expect(noDefault.radius).toBe(0.5);
    expect(noDefault.opacity).toBeCloseTo(0.31535673426536154, 6);
  });

  it('distributes across Children with each()', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        radius: 0,
        children: { kind: 'circle', radius: [0, 1], easing: each(['ease-in', quadOut]) },
      },
      binding,
    );
    const [a, b] = burst.sample(0.5).map((record) => record.radius);

    expect(a).toBeCloseTo(0.31535673426536154, 6);
    expect(b).toBe(eased(quadOut, [0.5])[0]);
  });

  it('on a Burst eases its own radius, not its Children', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 1,
        radius: [0, 100],
        easing: 'ease-out',
        children: { kind: 'circle', radius: [0, 1] },
      },
      binding,
    );
    const record = burst.sample(0.5)[0];

    expect(record?.y).toBeCloseTo(-68.464327, 4);
    expect(record?.radius).toBe(0.5);
  });
});

describe('a curve in a Spec', () => {
  it('survives JSON', () => {
    const spec = {
      kind: 'burst',
      count: 2,
      radius: [0, 50],
      easing: backOut,
      children: {
        kind: 'circle',
        radius: [0, 10],
        opacity: [1, 0],
        easing: each([{ default: 'ease-in', opacity: [0.4, 0, 0.2, 1] }, 'ease']),
      },
    } as const;
    const original = createScope().burst(spec, binding).sample(0.4);
    const copy = createScope()
      .burst(JSON.parse(JSON.stringify(spec)), binding)
      .sample(0.4);

    expect(JSON.stringify(spec)).not.toContain('function');
    expect(copy).toEqual(original);
  });

  it('that is not a curve fails when the Instance is created, naming the property', () => {
    const json = (spec: object) => JSON.parse(JSON.stringify({ kind: 'circle', ...spec }));
    const create = (spec: object) => () => createScope().shape(json(spec), binding);

    expect(create({ easing: 'quad.out' })).toThrow(/easing.*'quad\.out'/);
    expect(create({ easing: [0.1, 0.2, 0.3] })).toThrow(/easing/);
    expect(create({ easing: [1.5, 0, 0, 1] })).toThrow(/easing/);
    expect(create({ easing: { opacity: 'nope' } })).toThrow(/easing\.opacity.*'nope'/);
  });

  it('is data to the compiler too', () => {
    // @ts-expect-error — a Spec never holds a function
    expect(() => circle({ easing: (t: number) => t })).toThrow();
    // @ts-expect-error — only the CSS keywords are strings; import named curves
    expect(() => circle({ easing: 'quad.out' })).toThrow();
    // @ts-expect-error — the map is keyed by this Element's properties
    expect(circle({ easing: { points: 'ease' } }).duration).toBe(1);
  });
});
