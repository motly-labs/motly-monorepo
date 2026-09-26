import { describe, expect, it } from 'vitest';
import { Burst, type BurstSpec, createScope, type DrawList, type Renderer } from './index.js';
import { manualDriver } from './testing/manual-driver.js';

const renderer: Renderer = { draw() {}, release() {} };

/**
 * The x and y of every record, rounded so floating-point noise from sin and cos compares equal,
 * with -0 turned into 0 so `toEqual` does not tell them apart.
 */
function positions(list: DrawList): [number, number][] {
  return list.map((record) => [round(record.x), round(record.y)]);
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6 + 0;
}

describe('a Burst', () => {
  it('places count Children evenly by angle, clockwise from 12 o’clock, at an animated radius', () => {
    const burst = createScope().burst(
      { kind: 'burst', count: 4, radius: [0, 100], children: { kind: 'circle', duration: 2 } },
      { renderer, origin: { x: 10, y: 20 } },
    );

    expect(positions(burst.sample(0))).toEqual([
      [10, 20],
      [10, 20],
      [10, 20],
      [10, 20],
    ]);
    expect(positions(burst.sample(1))).toEqual([
      [10, -30],
      [60, 20],
      [10, 70],
      [-40, 20],
    ]);
    expect(positions(burst.sample(2))).toEqual([
      [10, -80],
      [110, 20],
      [10, 120],
      [-90, 20],
    ]);
  });

  it("animates each Child's own properties over the Child's own duration", () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 3,
        radius: 40,
        children: { kind: 'circle', radius: [20, 0], opacity: [1, 0], duration: 1 },
      },
      { renderer, origin: { x: 0, y: 0 } },
    );

    const half = burst.sample(0.5);
    expect(half).toHaveLength(3);
    for (const record of half) expect(record).toMatchObject({ radius: 10, opacity: 0.5 });
  });

  it('nests a Burst as a Child to any depth, each placing its Children around its own position', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        radius: 100,
        children: {
          kind: 'burst',
          count: 2,
          radius: 10,
          children: { kind: 'burst', count: 1, radius: 1, children: { kind: 'circle' } },
        },
      },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(positions(burst.sample(0))).toEqual([
      [0, -111],
      [0, -91],
      [0, 89],
      [0, 109],
    ]);
  });

  it('lasts as long as its longest Child, recursively, and animates its radius over that', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 1,
        radius: [0, 100],
        children: {
          kind: 'burst',
          count: 1,
          radius: 0,
          children: { kind: 'circle', duration: 4 },
        },
      },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(burst.duration).toBe(4);
    expect(positions(burst.sample(1))).toEqual([[0, -25]]);
  });

  it('draws one record per Element and reuses the same records on every sample', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 3,
        children: { kind: 'burst', count: 4, children: { kind: 'circle' } },
      },
      { renderer, origin: { x: 0, y: 0 } },
    );

    const first = [...burst.sample(0)];
    const second = [...burst.sample(0.7)];

    expect(first).toHaveLength(12);
    expect(new Set(first).size).toBe(12);
    second.forEach((record, index) => {
      expect(record).toBe(first[index]);
    });
  });

  it('gives the same frame for the same Playhead whatever was sampled before', () => {
    const burst = createScope().burst(
      { kind: 'burst', count: 5, radius: [0, 80], children: { kind: 'circle', radius: [9, 0] } },
      { renderer, origin: { x: 3, y: 4 } },
    );

    const before = burst.sample(0.5).map((record) => ({ ...record }));
    burst.sample(0.1);
    burst.sample(1);

    expect(burst.sample(0.5)).toEqual(before);
  });

  it('draws nothing and ends at once when it has no Children', () => {
    const burst = createScope().burst(
      { kind: 'burst', count: 0, children: { kind: 'circle' } },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(burst.duration).toBe(0);
    expect(burst.sample(0)).toEqual([]);
  });

  it('survives a JSON round trip unchanged', () => {
    const spec: BurstSpec = {
      kind: 'burst',
      count: 6,
      radius: [0, 60],
      children: { kind: 'burst', count: 2, children: { kind: 'circle', radius: [4, 0] } },
    };
    const binding = { renderer, origin: { x: 0, y: 0 } };
    const original = createScope().burst(spec, binding).sample(0.3);
    const copy = createScope()
      .burst(JSON.parse(JSON.stringify(spec)), binding)
      .sample(0.3);

    expect(copy).toEqual(original);
  });
});

describe('playing a Burst', () => {
  it('resolves play() when the Playhead reaches the derived duration', async () => {
    const manual = manualDriver();
    const burst = createScope({ driver: manual.driver }).burst(
      { kind: 'burst', count: 2, children: { kind: 'circle', duration: 3 } },
      { renderer, origin: { x: 0, y: 0 } },
    );

    let finished = false;
    const played = burst.play().then(() => {
      finished = true;
    });

    manual.seek(1);
    await Promise.resolve();
    expect(finished).toBe(false);

    manual.seek(3);
    await played;
  });

  it('is destroyed with the Scope that created it', async () => {
    const manual = manualDriver();
    const released: object[] = [];
    const scope = createScope({ driver: manual.driver });
    const burst = scope.burst(
      { kind: 'burst', children: { kind: 'circle' } },
      { renderer: { draw() {}, release: (owner) => released.push(owner) }, origin: { x: 0, y: 0 } },
    );

    const played = burst.play();
    scope.destroy();

    await played;
    expect(released).toEqual([burst]);
  });

  it('plays and destroys on its own as a bare Burst, without a Scope', async () => {
    const released: object[] = [];
    const burst = new Burst(
      { kind: 'burst', count: 3, radius: [0, 10], children: { kind: 'circle' } },
      { renderer: { draw() {}, release: (owner) => released.push(owner) }, origin: { x: 0, y: 0 } },
    );

    expect(burst.sample(burst.duration)).toHaveLength(3);
    await burst.play();
    burst.destroy();

    expect(released).toEqual([burst]);
  });
});

describe('the Burst Spec type', () => {
  it('has no duration of its own and accepts only Elements and Emitters as Children', () => {
    const nested: BurstSpec = {
      kind: 'burst',
      children: { kind: 'burst', children: { kind: 'circle', radius: 3 } },
    };
    // @ts-expect-error — an Emitter's duration is derived, never declared
    const withDuration: BurstSpec = { kind: 'burst', duration: 1, children: { kind: 'circle' } };
    // @ts-expect-error — not a Child kind
    const unknownChild: BurstSpec = { kind: 'burst', children: { kind: 'square' } };
    // @ts-expect-error — a circle Child still has no points
    const wrongParameter: BurstSpec = { kind: 'burst', children: { kind: 'circle', points: 5 } };

    expect([nested, withDuration, unknownChild, wrongParameter]).toHaveLength(4);
  });
});
