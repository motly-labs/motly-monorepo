import { describe, expect, it } from 'vitest';
import {
  createScope,
  type DrawList,
  type Driver,
  type DriverTarget,
  type Renderer,
  Shape,
  type ShapeSpec,
} from './index.js';

/** A Driver whose Playhead moves only when the test says so. */
function manualDriver() {
  const targets = new Set<DriverTarget>();
  const driver: Driver = {
    play(target) {
      targets.add(target);
      return { stop: () => targets.delete(target) };
    },
  };
  return {
    driver,
    seek(t: number) {
      for (const target of targets) target.render(t);
    },
    get playing() {
      return targets.size;
    },
  };
}

function recordingRenderer() {
  const drawn: DrawList[] = [];
  const released: object[] = [];
  const renderer: Renderer = {
    draw: (_owner, list) => drawn.push(list),
    release: (owner) => released.push(owner),
  };
  return { renderer, drawn, released };
}

describe('a circle Shape', () => {
  it('animates a two-value radius linearly over its duration', () => {
    const { renderer } = recordingRenderer();
    const shape = createScope().shape(
      { kind: 'circle', radius: [0, 100], duration: 2 },
      { renderer, origin: { x: 10, y: 20 } },
    );

    expect(shape.sample(0)[0]).toMatchObject({ kind: 'circle', radius: 0, x: 10, y: 20 });
    expect(shape.sample(1)[0]).toMatchObject({ radius: 50 });
    expect(shape.sample(2)[0]).toMatchObject({ radius: 100 });
  });

  it('describes each frame with a transform and a style, not geometry', () => {
    const { renderer } = recordingRenderer();
    const shape = createScope().shape(
      {
        kind: 'circle',
        radius: 30,
        angle: [0, 90],
        scale: [1, 3],
        opacity: [1, 0],
        fill: 'cyan',
        stroke: 'black',
        strokeWidth: [4, 0],
      },
      { renderer, origin: { x: 5, y: 6 } },
    );

    expect(shape.sample(0.5)[0]).toEqual({
      kind: 'circle',
      radius: 30,
      x: 5,
      y: 6,
      angle: 45,
      scale: 2,
      fill: 'cyan',
      stroke: 'black',
      strokeWidth: 2,
      opacity: 0.5,
    });
  });

  it('reuses the same records on every sample instead of allocating new ones', () => {
    const { renderer } = recordingRenderer();
    const shape = createScope().shape(
      { kind: 'circle', radius: [0, 100] },
      { renderer, origin: { x: 0, y: 0 } },
    );

    const first = shape.sample(0)[0];
    const second = shape.sample(0.5)[0];

    expect(second).toBe(first);
  });

  it('gives the same frame for the same Playhead whatever was sampled before', () => {
    const { renderer } = recordingRenderer();
    const shape = createScope().shape(
      { kind: 'circle', radius: [0, 100], duration: 1 },
      { renderer, origin: { x: 0, y: 0 } },
    );

    const before = { ...shape.sample(0.5)[0] };
    shape.sample(0.1);
    shape.sample(1);

    expect(shape.sample(0.5)[0]).toEqual(before);
  });

  it('holds the last frame after the end and the first frame before the start', () => {
    const { renderer } = recordingRenderer();
    const shape = createScope().shape(
      { kind: 'circle', radius: [0, 100], duration: 1 },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(shape.sample(-1)[0]).toMatchObject({ radius: 0 });
    expect(shape.sample(5)[0]).toMatchObject({ radius: 100 });
  });
});

describe('playing a Shape', () => {
  it('draws each frame the Driver asks for and resolves when the Playhead reaches the end', async () => {
    const manual = manualDriver();
    const { renderer, drawn } = recordingRenderer();
    const shape = createScope({ driver: manual.driver }).shape(
      { kind: 'circle', radius: [0, 100], duration: 1 },
      { renderer, origin: { x: 0, y: 0 } },
    );

    let finished = false;
    const played = shape.play().then(() => {
      finished = true;
    });

    manual.seek(0.5);
    await Promise.resolve();
    expect(drawn.at(-1)?.[0]).toMatchObject({ radius: 50 });
    expect(finished).toBe(false);

    manual.seek(1);
    await played;
    expect(drawn.at(-1)?.[0]).toMatchObject({ radius: 100 });
  });

  it('destroy() releases what was drawn, stops the Driver and resolves a pending play()', async () => {
    const manual = manualDriver();
    const { renderer, released } = recordingRenderer();
    const shape = createScope({ driver: manual.driver }).shape(
      { kind: 'circle', radius: [0, 100], duration: 1 },
      { renderer, origin: { x: 0, y: 0 } },
    );

    const played = shape.play();
    manual.seek(0.2);
    shape.destroy();

    await played;
    expect(released).toEqual([shape]);
    expect(manual.playing).toBe(0);
  });
});

describe('a Scope', () => {
  it('destroys every Instance it created in one call', async () => {
    const manual = manualDriver();
    const { renderer, released } = recordingRenderer();
    const scope = createScope({ driver: manual.driver });
    const first = scope.shape({ kind: 'circle' }, { renderer, origin: { x: 0, y: 0 } });
    const second = scope.shape({ kind: 'circle' }, { renderer, origin: { x: 50, y: 50 } });

    const played = Promise.all([first.play(), second.play()]);
    scope.destroy();

    await played;
    expect(released).toEqual([first, second]);
    expect(manual.playing).toBe(0);
  });
});

describe('a bare Shape', () => {
  it('plays and destroys on its own, without a Scope being created first', async () => {
    const { renderer, drawn, released } = recordingRenderer();
    const shape = new Shape(
      { kind: 'circle', radius: [0, 100] },
      { renderer, origin: { x: 1, y: 2 } },
    );

    expect(shape.sample(shape.duration)[0]).toMatchObject({ radius: 100, x: 1, y: 2 });
    await shape.play();
    shape.destroy();

    expect(drawn).toEqual([]);
    expect(released).toEqual([shape]);
  });
});

describe('the Shape Spec type', () => {
  it("accepts only known kinds and only that kind's parameters", () => {
    const circle: ShapeSpec<'circle'> = { kind: 'circle', radius: 10 };
    // @ts-expect-error — not a kind
    const unknownKind: ShapeSpec = { kind: 'square' };
    // @ts-expect-error — circles have no points
    const wrongParameter: ShapeSpec<'circle'> = { kind: 'circle', points: 5 };

    expect([circle, unknownKind, wrongParameter]).toHaveLength(3);
  });
});
