import { describe, expect, it } from 'vitest';
import {
  Burst,
  type BurstSpec,
  createScope,
  type DrawList,
  each,
  type Renderer,
  rand,
} from './index.js';
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

describe('aiming a Burst', () => {
  const circles = (spec: Partial<BurstSpec>, count = 4): DrawList =>
    createScope()
      .burst(
        { kind: 'burst', count, radius: 100, children: { kind: 'circle' }, ...spec },
        { renderer, origin: { x: 0, y: 0 } },
      )
      .sample(0);

  it('turns its whole ring of rays clockwise by angle, first ray first', () => {
    expect(positions(circles({ angle: 90 }))).toEqual([
      [100, 0],
      [0, 100],
      [-100, 0],
      [0, -100],
    ]);
    expect(positions(circles({ angle: '0.5turn' }, 1))).toEqual([[0, 100]]);
  });

  it('keeps the full circle when spread is 360 or left out, whatever the count', () => {
    expect(positions(circles({ spread: 360 }))).toEqual(positions(circles({})));
  });

  it('fans the rays over an arc of spread degrees centred on angle, both edges included', () => {
    expect(positions(circles({ spread: 90 }, 3))).toEqual([
      [round(-100 * Math.SQRT1_2), round(-100 * Math.SQRT1_2)],
      [0, -100],
      [round(100 * Math.SQRT1_2), round(-100 * Math.SQRT1_2)],
    ]);
    expect(positions(circles({ angle: 90, spread: 180 }, 3))).toEqual([
      [0, -100],
      [100, 0],
      [0, 100],
    ]);
  });

  it('throws a single Child along angle, and every Child along one ray when spread is 0', () => {
    expect(positions(circles({ angle: 90, spread: 60 }, 1))).toEqual([[100, 0]]);
    expect(positions(circles({ angle: 180, spread: 0 }, 3))).toEqual([
      [0, 100],
      [0, 100],
      [0, 100],
    ]);
  });

  it('draws a random angle from the Seed, the same on every run', () => {
    const spec: BurstSpec = {
      kind: 'burst',
      count: 3,
      radius: 50,
      angle: rand(0, 360),
      children: { kind: 'circle' },
    };
    const draw = (seed: number) =>
      positions(
        createScope()
          .burst(spec, { renderer, origin: { x: 0, y: 0 }, seed })
          .sample(0),
      );

    expect(draw(7)).toEqual(draw(7));
    expect(draw(7)).not.toEqual(draw(8));
  });

  it('hands a different angle to each inner Burst with each()', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        radius: 0,
        children: {
          kind: 'burst',
          count: 1,
          radius: 10,
          angle: each([0, 90]),
          children: { kind: 'circle' },
        },
      },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(positions(burst.sample(0))).toEqual([
      [0, -10],
      [10, 0],
    ]);
  });
});

describe('orienting a Burst’s Children', () => {
  const angles = (list: DrawList) => list.map((record) => round(record.angle));

  it('leaves each Child at its own angle by default', () => {
    const burst = createScope().burst(
      { kind: 'burst', count: 4, radius: 50, children: { kind: 'line', angle: 10 } },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(angles(burst.sample(0))).toEqual([10, 10, 10, 10]);
  });

  it('turns each Child to face its ray with orient, its own angle added on top', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 4,
        radius: 50,
        orient: true,
        angle: 45,
        children: { kind: 'line', angle: [0, 30], duration: 1 },
      },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(angles(burst.sample(0))).toEqual([45, 135, 225, 315]);
    expect(angles(burst.sample(1))).toEqual([75, 165, 255, 345]);
  });

  it('turns an inner Burst’s rays with its ray, so a fan in a ring points outward', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        radius: 0,
        orient: true,
        children: {
          kind: 'burst',
          count: 1,
          radius: 10,
          orient: true,
          children: { kind: 'line' },
        },
      },
      { renderer, origin: { x: 0, y: 0 } },
    );
    const list = burst.sample(0);

    expect(positions(list)).toEqual([
      [0, -10],
      [0, 10],
    ]);
    expect(angles(list)).toEqual([0, 180]);
  });

  it('turns the Child a Swirl wraps to face the ray, not the Swirl’s curve', () => {
    const burst = createScope().burst(
      {
        kind: 'burst',
        count: 2,
        radius: [0, 100],
        orient: true,
        children: { kind: 'swirl', size: 40, child: { kind: 'line', duration: 1 } },
      },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(angles(burst.sample(0.5))).toEqual([0, 180]);
  });

  it('survives a JSON round trip unchanged', () => {
    const spec: BurstSpec = {
      kind: 'burst',
      count: 5,
      radius: [0, 80],
      angle: rand(-30, 30),
      spread: '0.25turn',
      orient: true,
      children: { kind: 'line', duration: 0.5 },
    };
    const sample = (value: BurstSpec) =>
      createScope()
        .burst(value, { renderer, origin: { x: 0, y: 0 }, seed: 3 })
        .sample(0.25);

    expect(sample(JSON.parse(JSON.stringify(spec)))).toEqual(sample(spec));
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
