import { describe, expect, it } from 'vitest';
import * as core from './index.js';
import {
  type BurstSpec,
  backIn,
  createScope,
  type Driver,
  type DriverTarget,
  each,
  type InstanceBinding,
  type Renderer,
  rand,
} from './index.js';

const renderer: Renderer = { draw() {}, release() {} };
const binding: InstanceBinding = { renderer, origin: { x: 0, y: 0 }, seed: 1 };
const burst = (spec: Omit<BurstSpec, 'kind'>) =>
  createScope().burst({ kind: 'burst', ...spec }, binding);
/** Each Child's radius at `t`: with `radius: [0, 1]` over 1s, how far through it each Child is. */
const radii = (spec: Omit<BurstSpec, 'kind'>, t: number) =>
  burst(spec)
    .sample(t)
    .map((record) => record.radius);

describe('a delay', () => {
  it('offsets when a Shape starts, holding its first frame until then', () => {
    const shape = createScope().shape(
      { kind: 'circle', radius: [0, 10], duration: 1, delay: 0.5 },
      binding,
    );
    const radius = (t: number) => shape.sample(t)[0]?.radius;

    expect(shape.duration).toBe(1.5);
    expect(radius(0.25)).toBe(0);
    expect(radius(1)).toBe(5);
    expect(radius(2)).toBe(10);
  });

  it('holds the first frame of a Child that takes no time, until it starts', () => {
    const shape = createScope().shape(
      { kind: 'circle', radius: [0, 10], duration: 0, delay: 1 },
      binding,
    );

    expect(shape.sample(0.5)[0]?.radius).toBe(0);
    expect(shape.sample(1)[0]?.radius).toBe(10);
  });

  it('on a Child of a Burst holds its flight too', () => {
    const children = {
      kind: 'circle',
      radius: [0, 1],
      duration: 1,
      delay: each([0, 0.5]),
    } as const;
    const records = burst({ count: 2, radius: [0, 100], children }).sample(0.5);

    expect(records.map((record) => record.radius)).toEqual([0.5, 0]);
    expect(records.map((record) => Math.round(Math.hypot(record.x, record.y)))).toEqual([50, 0]);
  });
});

describe('a stagger', () => {
  const children = { kind: 'circle', radius: [0, 1], duration: 1 } as const;

  it('starts each Child that much after the one before', () => {
    const spec = { count: 3, radius: 0, stagger: 0.25, children };

    expect(radii(spec, 0.5)).toEqual([0.5, 0.25, 0]);
    expect(radii({ ...spec, stagger: '250ms' }, 0.5)).toEqual([0.5, 0.25, 0]);
    expect(burst(spec).duration).toBe(1.5);
  });

  it('spreads the same span along a curve', () => {
    // ease-in at 0.25, 0.5 and 0.75, as Chrome computes it, to the solver's 1e-6 tolerance against
    // Chrome. The span is 0.1 × 4.
    const eased = [0, 0.0934646510311063, 0.31535673426536154, 0.621861869174206, 1];
    const actual = radii(
      { count: 5, radius: 0, stagger: { each: 0.1, easing: 'ease-in' }, children },
      0.5,
    );

    for (const [i, y] of eased.entries()) expect(actual[i]).toBeCloseTo(0.5 - 0.4 * y, 6);
  });

  it('never starts a Child before its Burst, even on a curve that dips below 0', () => {
    const spec = { count: 5, radius: 0, stagger: { each: 0.1, easing: backIn }, children };
    const [first, second] = radii(spec, 0.5);

    expect(second).toBe(first);
    expect(burst(spec).duration).toBeCloseTo(1.4, 9);
  });

  it('throws each Child from the Origin when it starts', () => {
    const records = burst({ count: 2, radius: [0, 100], stagger: 0.5, children }).sample(0.5);

    expect(records.map((record) => Math.round(Math.hypot(record.x, record.y)))).toEqual([50, 0]);
  });
});

describe('derived duration', () => {
  it('is the latest end with every delay and stagger offset in it, however deep', () => {
    const spec = {
      delay: 0.2,
      count: 2,
      radius: 0,
      stagger: 0.1,
      children: {
        kind: 'burst',
        count: 2,
        radius: 0,
        stagger: 0.3,
        children: { kind: 'circle', duration: 1, delay: each([0, 0.4]) },
      },
    } as const;

    // Last Child: 0.2 delay + 0.1 stagger, then 0.3 stagger + 0.4 delay, then 1 running.
    expect(burst(spec).duration).toBeCloseTo(2, 9);
  });
});

describe('play()', () => {
  it('resolves when the last offset Child ends, not before', async () => {
    const targets = new Set<DriverTarget>();
    const driver: Driver = {
      play(target) {
        targets.add(target);
        return { stop: () => targets.delete(target) };
      },
    };
    const seek = (t: number) => {
      for (const target of targets) target.render(t);
    };
    const instance = createScope({ driver }).burst(
      { kind: 'burst', count: 3, stagger: 0.5, children: { kind: 'circle', delay: 0.25 } },
      binding,
    );
    let done = false;
    const played = instance.play().then(() => {
      done = true;
    });

    seek(1.5);
    await Promise.resolve();
    expect(done).toBe(false);

    seek(2.25);
    await played;
    expect(done).toBe(true);
  });
});

describe('delay and stagger in a Spec', () => {
  it('survive JSON, rand() and all', () => {
    const spec = {
      kind: 'burst',
      count: 4,
      delay: '100ms',
      stagger: { each: rand(0.05, 0.2), easing: [0.4, 0, 0.2, 1] },
      children: { kind: 'circle', radius: [0, 10], delay: rand(0, 0.3) },
    } as const;
    const original = createScope().burst(spec, binding);
    const copy = createScope().burst(JSON.parse(JSON.stringify(spec)), binding);

    expect(copy.duration).toBe(original.duration);
    expect(copy.sample(0.4)).toEqual(original.sample(0.4));
  });

  it.each([
    [
      'a negative delay',
      { kind: 'circle', delay: -1 },
      /delay cannot be -1. A delay cannot be negative/,
    ],
    ['a delay as Keyframes', { kind: 'circle', delay: [0, 1] }, /delay .*one value, not Keyframes/],
    [
      'a negative stagger',
      { kind: 'burst', stagger: '-1s', children: { kind: 'circle' } },
      /stagger .*negative/,
    ],
    [
      'a stagger with an unknown field',
      { kind: 'burst', stagger: { each: 0.1, amount: 1 }, children: { kind: 'circle' } },
      /stagger\.amount is not a field of a stagger/,
    ],
    [
      'a stagger with no each',
      { kind: 'burst', stagger: { easing: 'ease' }, children: { kind: 'circle' } },
      /stagger\.each is missing/,
    ],
    [
      'a stagger on a bad curve',
      { kind: 'burst', stagger: { each: 0.1, easing: 'nope' }, children: { kind: 'circle' } },
      /stagger\.easing cannot be 'nope'/,
    ],
    [
      'a delay deep in the tree',
      { kind: 'burst', children: { kind: 'circle', delay: 'soon' } },
      /children\.delay cannot be 'soon'/,
    ],
  ])('reject %s when the Instance is created', (_label, spec, error) => {
    expect(() => createScope().burst(spec as BurstSpec, binding)).toThrow(error);
  });

  it('is an option of a Burst: there is no Stagger primitive', () => {
    expect(Object.keys(core)).not.toContain('Stagger');
    // @ts-expect-error — a Shape does not stagger
    expect(() => createScope().shape({ kind: 'circle', stagger: 0.1 }, binding)).toThrow(
      /stagger is not a field of a circle/,
    );
  });
});
