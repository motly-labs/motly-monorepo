import { describe, expect, it } from 'vitest';
import {
  createScope,
  each,
  type InstanceBinding,
  type Renderer,
  rand,
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

describe('Keyframes', () => {
  it('spread N values evenly over the Child’s duration', () => {
    const spec = { duration: 2, radius: [0, 10, 40] } as const;

    expect([0, 0.5, 1, 1.5, 2].map((t) => first(spec, t).radius)).toEqual([0, 5, 10, 25, 40]);
  });

  it('hold the first value before the start and the last after the end', () => {
    const spec = { radius: [4, 8, 16] } as const;

    expect(first(spec, -1).radius).toBe(4);
    expect(first(spec, 5).radius).toBe(16);
  });

  it('with one value are that value throughout', () => {
    expect(first({ radius: [7] }, 0.5).radius).toBe(7);
  });

  it('draw one rand() per Keyframe', () => {
    const spec = { radius: [rand(0, 10), rand(20, 30), rand(40, 50)] } as const;
    const [start, middle, end] = [0, 0.5, 1].map((t) => first(spec, t).radius);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(start).toBeLessThan(10);
    expect(middle).toBeGreaterThanOrEqual(20);
    expect(middle).toBeLessThan(30);
    expect(end).toBeGreaterThanOrEqual(40);
    expect(end).toBeLessThan(50);
  });
});

describe('colors', () => {
  it('pass through exactly as written when constant', () => {
    const record = first({ fill: 'cornflowerblue', stroke: 'none' }, 0.5);

    expect(record.fill).toBe('cornflowerblue');
    expect(record.stroke).toBe('none');
  });

  it('interpolate between hex colors as rgba()', () => {
    const spec = { fill: ['#000', '#ffffff'] } as const;

    expect(first(spec, 0).fill).toBe('rgba(0, 0, 0, 1)');
    expect(first(spec, 0.5).fill).toBe('rgba(128, 128, 128, 1)');
    expect(first(spec, 1).fill).toBe('rgba(255, 255, 255, 1)');
  });

  it('interpolate named colors', () => {
    const spec = { stroke: ['red', 'blue'] } as const;

    expect(first(spec, 0).stroke).toBe('rgba(255, 0, 0, 1)');
    expect(first(spec, 0.5).stroke).toBe('rgba(128, 0, 128, 1)');
    expect(first(spec, 1).stroke).toBe('rgba(0, 0, 255, 1)');
  });

  it('interpolate rgb(), rgba() and hex with alpha, alpha included', () => {
    const spec = { fill: ['rgba(255, 0, 0, 0)', 'rgb(0 0 255)', '#00ff0080'] } as const;

    expect(first(spec, 0).fill).toBe('rgba(255, 0, 0, 0)');
    expect(first(spec, 0.25).fill).toBe('rgba(128, 0, 128, 0.5)');
    expect(first(spec, 0.5).fill).toBe('rgba(0, 0, 255, 1)');
    expect(first(spec, 1).fill).toBe('rgba(0, 255, 0, 0.502)');
  });

  it('accept transparent and any letter case', () => {
    expect(first({ fill: ['transparent', 'WHITE'] }, 0.5).fill).toBe('rgba(128, 128, 128, 0.5)');
  });

  it('distribute as Keyframes with each()', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        children: { kind: 'circle', fill: each([['red', 'blue'], 'gold']) },
      },
      binding,
    );

    expect(burst.sample(1).map((record) => record.fill)).toEqual(['rgba(0, 0, 255, 1)', 'gold']);
  });

  it('that cannot be parsed fail when the Instance is created', () => {
    expect(() => circle({ fill: ['none', 'red'] })).toThrow(/fill.*'none'/);
    expect(() => circle({ stroke: ['red', '#12345'] })).toThrow(/stroke.*'#12345'/);
    expect(() => circle({ fill: ['#12345'] })).toThrow(/fill.*'#12345'/);
    expect(() => circle({ fill: ['rgb(1, 2, )', 'red'] })).toThrow(/fill/);
    expect(() => circle({ fill: ['rgb(1,,2,3)', 'red'] })).toThrow(/fill/);
  });
});

describe('unit-bearing strings', () => {
  it('convert to the property’s own unit and interpolate', () => {
    const spec = { radius: ['0px', '40px'], angle: [0, '0.5turn'], strokeWidth: '2px' } as const;
    const record = first(spec, 0.5);

    expect(record.radius).toBe(20);
    expect(record.angle).toBe(90);
    expect(record.strokeWidth).toBe(2);
    expect(first({ angle: '1rad' }, 0).angle).toBeCloseTo(57.29578, 5);
    expect(first({ angle: '90deg' }, 0).angle).toBe(90);
  });

  it('set a duration in seconds or milliseconds', () => {
    expect(circle({ duration: '600ms' }).duration).toBe(0.6);
    expect(circle({ duration: '2s' }).duration).toBe(2);
  });

  it('that do not fit the property fail when the Instance is created, naming it', () => {
    const json = (spec: object) => JSON.parse(JSON.stringify({ kind: 'circle', ...spec }));

    expect(() => createScope().shape(json({ radius: ['10px', '1turn'] }), binding)).toThrow(
      /radius.*'1turn'/,
    );
    expect(() => createScope().shape(json({ radius: '2em' }), binding)).toThrow(/radius.*'2em'/);
    expect(() => createScope().shape(json({ scale: '2px' }), binding)).toThrow(/scale.*'2px'/);
    expect(() => createScope().shape(json({ duration: '10px' }), binding)).toThrow(/duration/);
    expect(() => createScope().shape(json({ radius: '10' }), binding)).toThrow(/radius.*'10'/);
  });

  it('that are empty or delta syntax fail when the Instance is created, pointing at arrays', () => {
    const json = (spec: object) => JSON.parse(JSON.stringify({ kind: 'circle', ...spec }));

    expect(() => createScope().shape(json({ radius: [] }), binding)).toThrow(/radius/);
    expect(() => createScope().shape(json({ fill: [] }), binding)).toThrow(/fill/);
    expect(() => createScope().shape(json({ radius: { 0: 50 } }), binding)).toThrow(
      /radius.*Keyframes are an array/,
    );
    expect(() => createScope().shape(json({ fill: { red: 'blue' } }), binding)).toThrow(
      /fill.*Keyframes are an array/,
    );
  });

  it('are checked by the compiler too', () => {
    // @ts-expect-error — a radius is a length, not an angle
    expect(() => circle({ radius: '1turn' })).toThrow();
    // @ts-expect-error — scale has no unit
    expect(() => circle({ scale: '2px' })).toThrow();
    // @ts-expect-error — a duration is a time
    expect(() => circle({ duration: '10px' })).toThrow();
    // @ts-expect-error — delta syntax is not a Spec value (ADR-0017)
    expect(() => circle({ radius: { 0: 50 } })).toThrow();
  });
});

describe('a Spec with colors, units and Keyframes', () => {
  it('survives JSON and builds an identical Instance', () => {
    const spec = {
      kind: 'burst',
      count: 3,
      radius: ['0px', '30px', '50px'],
      children: {
        kind: 'circle',
        duration: '800ms',
        angle: [0, rand(0, 1), '1turn'],
        fill: each([['#f00', 'cyan', 'rgba(0, 0, 0, 0.5)'], 'gold']),
      },
    } as const;
    const original = createScope().burst(spec, binding).sample(0.3);
    const copy = createScope()
      .burst(JSON.parse(JSON.stringify(spec)), binding)
      .sample(0.3);

    expect(copy).toEqual(original);
  });
});
