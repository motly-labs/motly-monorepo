import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createScope,
  type DrawList,
  type Driver,
  type InstanceBinding,
  type Renderer,
  rand,
} from './index.js';
import { manualDriver } from './testing/manual-driver.js';

/** A Renderer that keeps a copy of every Draw list, since the Instance reuses its records. */
function recordingRenderer() {
  const drawn: DrawList[] = [];
  const renderer: Renderer = {
    draw: (_owner, list) => drawn.push(structuredClone(list)),
    release: () => {},
  };
  return { renderer, drawn, last: () => drawn.at(-1)?.[0]?.radius };
}

/** The default Driver over stubbed frames: `advance(dt)` fires one frame `dt` seconds later. */
function rafHarness() {
  const queue = new Map<number, FrameRequestCallback>();
  let nextId = 1;
  let now = 1000;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    queue.set(nextId, callback);
    return nextId++;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => queue.delete(id));
  const frame = () => {
    const callbacks = [...queue.values()];
    queue.clear();
    for (const callback of callbacks) callback(now);
  };
  return {
    driver: undefined as Driver | undefined,
    advance(dt: number) {
      // A Playhead that has just started moving takes its first frame as its starting point.
      frame();
      now += dt * 1000;
      frame();
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const HARNESSES = [
  ['the rAF Driver', rafHarness],
  ['a custom Driver', manualDriver],
] as const;

describe.each(HARNESSES)('under %s', (_name, harness) => {
  function setup(binding: Partial<InstanceBinding> = {}) {
    const clock = harness();
    const recording = recordingRenderer();
    const scope =
      clock.driver === undefined ? createScope() : createScope({ driver: clock.driver });
    const shape = scope.shape(
      { kind: 'circle', radius: [0, 100], duration: 1 },
      { renderer: recording.renderer, origin: { x: 0, y: 0 }, ...binding },
    );
    return { shape, advance: (dt: number) => clock.advance(dt), ...recording };
  }

  it('pauses, leaving the Playhead where it is, and resumes from there', () => {
    const { shape, advance, last } = setup();
    shape.play();
    advance(0.25);
    expect(last()).toBeCloseTo(25, 9);

    shape.pause();
    advance(0.5);
    expect(last()).toBeCloseTo(25, 9);

    shape.resume();
    advance(0.25);
    expect(last()).toBeCloseTo(50, 9);
  });

  it('reverses from where the Playhead is, stopping at 0 without completing', async () => {
    const { shape, advance, last } = setup();
    let done = false;
    shape.play().then(() => {
      done = true;
    });
    advance(0.5);

    shape.reverse();
    advance(0.25);
    expect(last()).toBeCloseTo(25, 9);

    advance(1);
    expect(last()).toBe(0);
    advance(1);
    expect(last()).toBe(0);
    await Promise.resolve();
    expect(done).toBe(false);
  });

  it('seeks in seconds, drawing at once and carrying on playing or paused as it was', () => {
    const { shape, advance, last } = setup();
    shape.play();
    advance(0.1);
    shape.seek(0.6);
    expect(last()).toBeCloseTo(60, 9);
    advance(0.1);
    expect(last()).toBeCloseTo(70, 9);

    shape.pause();
    shape.seek(0.3);
    expect(last()).toBeCloseTo(30, 9);
    advance(0.5);
    expect(last()).toBeCloseTo(30, 9);

    shape.seek(5);
    expect(last()).toBe(100);
    shape.seek(-1);
    expect(last()).toBe(0);
  });

  it('settles play() the first time the Playhead reaches the end moving forward', async () => {
    const { shape, advance } = setup();
    const settled: string[] = [];
    shape.play().then(() => settled.push('played'));
    advance(0.5);
    await Promise.resolve();
    expect(settled).toEqual([]);

    advance(0.6);
    await Promise.resolve();
    expect(settled).toEqual(['played']);
  });

  it('settles play() on a seek to the end, even paused', async () => {
    const { shape, advance } = setup();
    const played = shape.play();
    advance(0.2);
    shape.pause();

    shape.setProgress(1);

    await expect(played).resolves.toBeUndefined();
  });

  it('settles play() on destroy() before the end, and never rejects', async () => {
    const { shape, advance } = setup();
    const played = shape.play();
    advance(0.2);

    shape.destroy();

    await expect(played).resolves.toBeUndefined();
  });

  it('draws with setProgress(p) what sample(p × duration) returns, without ever playing', () => {
    const clock = harness();
    const { renderer, drawn } = recordingRenderer();
    const scope =
      clock.driver === undefined ? createScope() : createScope({ driver: clock.driver });
    const burst = scope.burst(
      {
        kind: 'burst',
        count: 4,
        radius: [0, rand(20, 80)],
        stagger: 0.1,
        children: { kind: 'circle', radius: [rand(2, 8), 0], duration: rand(0.5, 1) },
      },
      { renderer, origin: { x: 10, y: 20 }, seed: 7 },
    );

    burst.setProgress(0.4);

    expect(drawn).toHaveLength(1);
    expect(drawn[0]).toEqual(structuredClone(burst.sample(0.4 * burst.duration)));
  });

  describe('callbacks', () => {
    function withEvents() {
      const events: string[] = [];
      const run = setup({
        onStart: () => events.push('start'),
        onUpdate: (t) => events.push(`update ${Math.round(t * 100) / 100}`),
        onComplete: () => events.push('complete'),
      });
      const count = (name: string) => events.filter((event) => event.startsWith(name)).length;
      return { ...run, events, count };
    }

    it('start on the first draw of a play(), update on every draw, complete at the end', () => {
      const { shape, advance, events, count } = withEvents();
      shape.play();
      expect(events).toEqual([]);

      advance(0.5);
      advance(0.6);

      expect(events[0]).toBe('start');
      expect(events[1]).toMatch(/^update/);
      expect(events.slice(-2)).toEqual(['update 1', 'complete']);
      expect([count('start'), count('complete')]).toEqual([1, 1]);
    });

    it('complete once per play(): scrubbing back over the end does not fire it again', () => {
      const { shape, advance, count } = withEvents();
      shape.play();
      advance(2);
      shape.seek(0.5);
      shape.seek(1);
      expect([count('start'), count('complete')]).toEqual([1, 1]);

      shape.play();
      advance(2);
      expect([count('start'), count('complete')]).toEqual([2, 2]);
    });

    it('stop the moment a callback destroys the Instance', () => {
      const events: string[] = [];
      const { shape, advance } = setup({
        onStart: () => {
          events.push('start');
          shape.destroy();
        },
        onUpdate: () => events.push('update'),
        onComplete: () => events.push('complete'),
      });
      shape.play();
      advance(2);

      expect(events).toEqual(['start']);
    });

    it('never complete on destroy(), nor on a seek to the end with no play() pending', () => {
      const { shape, advance, events, count } = withEvents();
      shape.setProgress(0.25);
      shape.setProgress(1);
      expect(events).toEqual(['update 0.25', 'update 1']);

      shape.play();
      advance(0.2);
      shape.destroy();
      expect(count('complete')).toBe(0);
    });
  });
});

describe('repeating', () => {
  it('is not something an Instance does: there is no repeat count', () => {
    const renderer: Renderer = { draw() {}, release() {} };
    const origin = { x: 0, y: 0 };
    // @ts-expect-error — no repeat on a binding; repeating belongs to a Driver (ADR-0016)
    const binding: InstanceBinding = { renderer, origin, repeat: 2 };
    expect(binding).toBeDefined();
    expect(() =>
      // @ts-expect-error — nor in a Spec
      createScope().shape({ kind: 'circle', repeat: 2 }, { renderer, origin }),
    ).toThrow(/repeat is not a field of a circle/);
  });
});
