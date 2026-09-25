import { describe, expect, it, vi } from 'vitest';
import { createScope, each, type InstanceBinding, type Renderer, rand } from './index.js';

const renderer: Renderer = { draw() {}, release() {} };
const at = (seed: number): InstanceBinding => ({ renderer, origin: { x: 0, y: 0 }, seed });

describe('the Descriptors', () => {
  it('are tagged plain objects, never eagerly evaluated', () => {
    expect(rand(1, 5)).toEqual({ __motly: 'rand', min: 1, max: 5 });
    expect(each(['cyan', 'yellow'])).toEqual({ __motly: 'each', values: ['cyan', 'yellow'] });
  });
});

describe('each()', () => {
  it('hands successive values to successive Children, repeating them in order', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 5,
        children: { kind: 'circle', fill: each(['cyan', 'yellow']), radius: each([1, [2, 4]]) },
      },
      at(1),
    );

    const frame = burst.sample(0.5);
    expect(frame.map((record) => record.fill)).toEqual([
      'cyan',
      'yellow',
      'cyan',
      'yellow',
      'cyan',
    ]);
    expect(frame.map((record) => record.radius)).toEqual([1, 3, 1, 3, 1]);
  });

  it('counts Children within their own Emitter when Bursts nest', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        radius: each([0, 10]),
        children: {
          kind: 'burst',
          count: 3,
          children: { kind: 'circle', radius: each([1, 2, 3]) },
        },
      },
      at(1),
    );

    expect(burst.sample(0).map((record) => record.radius)).toEqual([1, 2, 3, 1, 2, 3]);
  });
});

describe('rand() under a Seed', () => {
  const spread = {
    kind: 'burst',
    count: 20,
    radius: 0,
    children: { kind: 'circle', radius: rand(10, 20), angle: [0, rand(-180, 180)] },
  } as const;

  it('resolves per Child within its range, and the same Seed gives the same values', () => {
    const first = createScope().burst(spread, at(42)).sample(1);
    const radii = first.map((record) => record.radius);
    const again = createScope()
      .burst(spread, at(42))
      .sample(1)
      .map((record) => record.radius);

    for (const radius of radii) {
      expect(radius).toBeGreaterThanOrEqual(10);
      expect(radius).toBeLessThan(20);
    }
    expect(new Set(radii).size).toBe(20);
    expect(again).toEqual(radii);
  });

  it('resolves inside Keyframes, one draw per Keyframe', () => {
    const burst = createScope().burst(spread, at(42));

    expect(burst.sample(0).every((record) => record.angle === 0)).toBe(true);
    const ends = burst.sample(1).map((record) => record.angle);
    for (const angle of ends) {
      expect(angle).toBeGreaterThanOrEqual(-180);
      expect(angle).toBeLessThan(180);
    }
  });

  it('gives different values under a different Seed', () => {
    const one = createScope().burst(spread, at(1)).sample(1);
    const radiiOne = one.map((record) => record.radius);
    const radiiTwo = createScope()
      .burst(spread, at(2))
      .sample(1)
      .map((record) => record.radius);

    expect(radiiTwo).not.toEqual(radiiOne);
  });

  it('leaves the first 20 Children unchanged when count goes from 20 to 21', () => {
    const twenty = createScope()
      .burst(spread, at(7))
      .sample(1)
      .map(({ radius, angle }) => ({ radius, angle }));
    const twentyOne = createScope()
      .burst({ ...spread, count: 21 }, at(7))
      .sample(1)
      .map(({ radius, angle }) => ({ radius, angle }));

    expect(twentyOne.slice(0, 20)).toEqual(twenty);
  });

  it('draws the same numbers in any process, on any machine', () => {
    const frame = createScope()
      .shape({ kind: 'circle', radius: rand(0, 100), opacity: rand(0, 1) }, at(42))
      .sample(0)[0];

    expect([frame?.radius, frame?.opacity]).toEqual(PINNED_SEED_42);
  });

  it('never calls Math.random once a Seed is given', () => {
    const random = vi.spyOn(Math, 'random');
    try {
      createScope().burst(spread, at(3)).sample(0.5);
      expect(random).not.toHaveBeenCalled();
    } finally {
      random.mockRestore();
    }
  });

  it('picks a fresh Seed per Instance when none is given', () => {
    const binding = { renderer, origin: { x: 0, y: 0 } };
    const one = createScope()
      .burst(spread, binding)
      .sample(1)
      .map((record) => record.radius);
    const two = createScope()
      .burst(spread, binding)
      .sample(1)
      .map((record) => record.radius);

    expect(two).not.toEqual(one);
  });
});

describe('each() and rand() together', () => {
  it('resolves each Child’s rand() independently, even when Children share a value', () => {
    const radii = createScope()
      .burst(
        {
          kind: 'burst',
          count: 4,
          children: { kind: 'circle', radius: each([rand(0, 1), rand(100, 101)]) },
        },
        at(9),
      )
      .sample(0)
      .map((record) => record.radius);

    expect(radii[0]).toBeLessThan(1);
    expect(radii[1]).toBeGreaterThanOrEqual(100);
    expect(radii[2]).toBeLessThan(1);
    expect(radii[3]).toBeGreaterThanOrEqual(100);
    expect(radii[2]).not.toBe(radii[0]);
    expect(radii[3]).not.toBe(radii[1]);
  });

  it('survive a JSON round trip and rebuild an identical Draw list', () => {
    const spec = {
      kind: 'burst',
      count: 6,
      radius: [0, rand(40, 80)],
      children: {
        kind: 'circle',
        fill: each(['cyan', 'yellow', 'deeppink']),
        radius: each([rand(2, 4), [8, 0]]),
        duration: rand(0.5, 1.5),
      },
    } as const;
    const copy = JSON.parse(JSON.stringify(spec));

    const original = createScope().burst(spec, at(5));
    const rebuilt = createScope().burst(copy, at(5));

    expect(rebuilt.duration).toBe(original.duration);
    expect(rebuilt.sample(0.4)).toEqual(original.sample(0.4));
  });
});

describe('the Descriptor types', () => {
  it('accept a Descriptor only where the property takes that kind of value', () => {
    const ok = createScope().shape(
      { kind: 'circle', radius: each([rand(1, 2), [3, rand(4, 5)]]), fill: each(['red']) },
      at(1),
    );
    // @ts-expect-error — fill is a string, not a number
    const randFill = createScope().shape({ kind: 'circle', fill: rand(0, 1) }, at(1));
    // @ts-expect-error — each() needs at least one value
    const empty = each([]);

    expect([ok, randFill, empty]).toHaveLength(3);
  });
});

/**
 * Radius and opacity from `rand(0, 100)` and `rand(0, 1)` under Seed 42. If this changes, every
 * seeded burst anyone has saved changes with it: treat it as a breaking change, not a snapshot.
 */
const PINNED_SEED_42 = [48.40761481318623, 0.4850668825674802];
