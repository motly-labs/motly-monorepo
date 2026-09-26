import { describe, expect, it } from 'vitest';
import {
  type BurstSpec,
  type ChildSpec,
  createScope,
  type DrawList,
  each,
  quadIn,
  type Renderer,
  rand,
} from './index.js';

const renderer: Renderer = { draw() {}, release() {} };
const origin = { x: 0, y: 0 };

/** The x and y of every record, rounded, with -0 turned into 0 so `toEqual` does not tell them apart. */
function positions(list: DrawList): [number, number][] {
  return list.map((record) => [round(record.x), round(record.y)]);
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6 + 0;
}

describe('a Swirl', () => {
  it('bends the ray its Burst throws its Child along, turning it about the Origin by a sine', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 1,
        radius: [0, 100],
        children: {
          kind: 'swirl',
          size: 90,
          frequency: 0.25,
          child: { kind: 'circle', duration: 1 },
        },
      },
      { renderer, origin },
    );

    // A quarter wave: turned 90° × sin(2π × 0.25 × progress) clockwise from 12 o'clock.
    expect(positions(burst.sample(0))).toEqual([[0, 0]]);
    // sin(π/6) = 0.5, so 45° at a third of the way out.
    const third = 100 / 3 / Math.SQRT2;
    expect(positions(burst.sample(1 / 3))).toEqual([[round(third), round(-third)]]);
    expect(positions(burst.sample(1))).toEqual([[100, 0]]);
  });

  it('draws nothing itself: a Burst of Swirls draws one record per Child', () => {
    const burst = createScope().burst(
      { kind: 'burst', count: 3, children: { kind: 'swirl', child: { kind: 'circle' } } },
      { renderer, origin },
    );

    expect(burst.sample(0.5)).toHaveLength(3);
  });

  it('turns counterclockwise first with direction -1, and each([1, -1]) alternates', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        radius: [0, 100],
        children: {
          kind: 'swirl',
          size: '90deg',
          frequency: 0.25,
          direction: each([1, -1]),
          child: { kind: 'circle', duration: 1 },
        },
      },
      { renderer, origin },
    );

    // 12 o'clock turned clockwise, and 6 o'clock turned counterclockwise, both reach 3 o'clock.
    expect(positions(burst.sample(1))).toEqual([
      [100, 0],
      [100, 0],
    ]);
  });

  it("keeps its waves at the same places on the path whatever the Burst's easing", () => {
    const spec = (easing: BurstSpec['easing']): BurstSpec => ({
      kind: 'burst',
      count: 1,
      radius: [0, 100],
      ...(easing === undefined ? {} : { easing }),
      children: { kind: 'swirl', size: 60, child: { kind: 'circle', duration: 1 } },
    });
    const eased = createScope().burst(spec(quadIn), { renderer, origin });
    const linear = createScope().burst(spec(undefined), { renderer, origin });

    for (const t of [0.3, 0.6, 0.9]) {
      const [record] = eased.sample(t);
      const distance = Math.hypot(record?.x ?? 0, record?.y ?? 0);
      expect(positions(eased.sample(t))).toEqual(positions(linear.sample(distance / 100)));
    }
  });

  it('bends the path of a Burst it wraps, leaving that Burst’s own rays straight', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 1,
        radius: [0, 100],
        children: {
          kind: 'swirl',
          size: 90,
          frequency: 0.25,
          child: { kind: 'burst', count: 2, radius: 10, children: { kind: 'circle', duration: 1 } },
        },
      },
      { renderer, origin },
    );

    expect(positions(burst.sample(1))).toEqual([
      [100, -10],
      [100, 10],
    ]);
  });

  it('adds up with a Swirl nested inside it', () => {
    const swirl = (child: ChildSpec): ChildSpec => ({
      kind: 'swirl',
      size: 45,
      frequency: 0.25,
      child,
    });
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 1,
        radius: [0, 100],
        children: swirl(swirl({ kind: 'circle', duration: 1 })),
      },
      { renderer, origin },
    );

    expect(positions(burst.sample(1))).toEqual([[100, 0]]);
  });

  it('draws its rand() apart from a Swirl nested inside it', () => {
    const swirl = (child: ChildSpec): ChildSpec => ({
      kind: 'swirl',
      size: rand(0, 90),
      frequency: 0.25,
      child,
    });
    const make = (children: ChildSpec) =>
      createScope().burst(
        { kind: 'burst', count: 1, radius: [0, 100], children },
        { renderer, origin, seed: 3 },
      );
    const turn = (list: DrawList) => Math.atan2(list[0]?.x ?? 0, -(list[0]?.y ?? 0));
    const once = turn(make(swirl({ kind: 'circle', duration: 1 })).sample(1));
    const twice = turn(make(swirl(swirl({ kind: 'circle', duration: 1 }))).sample(1));

    expect(twice).not.toBeCloseTo(2 * once, 6);
  });

  it('survives JSON: a Spec with Swirls round-trips and draws the same', () => {
    const spec: BurstSpec = {
      kind: 'burst',
      count: 4,
      radius: [0, 80],
      children: {
        kind: 'swirl',
        size: rand(10, 60),
        frequency: each([0.5, 1.5]),
        direction: each([1, -1]),
        child: { kind: 'swirl', size: '0.1turn', child: { kind: 'circle', delay: rand(0, 0.2) } },
      },
    };
    const make = (burstSpec: BurstSpec) =>
      createScope().burst(burstSpec, { renderer, origin, seed: 11 });

    expect(make(JSON.parse(JSON.stringify(spec))).sample(0.6)).toEqual(make(spec).sample(0.6));
  });

  it("adds no time: the duration and the Child's delay pass through unchanged", () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        radius: [0, 100],
        children: { kind: 'swirl', child: { kind: 'circle', duration: 2, delay: 0.5 } },
      },
      { renderer, origin },
    );

    expect(burst.duration).toBe(2.5);
    expect(positions(burst.sample(0.5))).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  it('leaves every value its Child draws unchanged, each() and rand() included', () => {
    const circle: ChildSpec = {
      kind: 'circle',
      radius: rand(1, 10),
      fill: each(['red', 'blue', 'green']),
    };
    const make = (children: ChildSpec) =>
      createScope().burst({ kind: 'burst', count: 3, children }, { renderer, origin, seed: 7 });
    const plain = make(circle).sample(0.5);
    const swirled = make({ kind: 'swirl', child: circle }).sample(0.5);

    expect(swirled.map(({ radius, fill }) => ({ radius, fill }))).toEqual(
      plain.map(({ radius, fill }) => ({ radius, fill })),
    );
    expect(new Set(plain.map(({ fill }) => fill)).size).toBe(3);
  });

  it('is checked like any Spec: it needs a Child, and direction is 1 or -1', () => {
    const make = (children: unknown) => () =>
      createScope().burst({ kind: 'burst', children } as BurstSpec, { renderer, origin });

    expect(make({ kind: 'swirl' })).toThrow(/children\.child is missing/);
    expect(make({ kind: 'swirl', direction: 2, child: { kind: 'circle' } })).toThrow(
      /children\.direction cannot be 2/,
    );
    expect(make({ kind: 'swirl', radius: 2, child: { kind: 'circle' } })).toThrow(
      /children\.radius is not a field of a swirl/,
    );
  });
});
