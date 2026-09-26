import { afterEach, describe, expect, it, vi } from 'vitest';
import { createScope, type DrawList, type Renderer } from './index.js';
import { manualDriver } from './testing/manual-driver.js';

/** A Renderer keeping a copy of every Draw list it is handed. */
function recording() {
  const drawn: DrawList[] = [];
  const renderer: Renderer = {
    draw: (_owner, list) => drawn.push(list.map((record) => ({ ...record }))),
    release: () => {},
  };
  return { renderer, drawn };
}

/** Pretend the viewer's `prefers-reduced-motion` is `reduce` (true) or not (false). */
function prefers(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
  }));
}

const origin = { x: 0, y: 0 };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('reduced motion', () => {
  it('draws the Resting frame once, starts no Driver, and resolves play() at once', async () => {
    const manual = manualDriver();
    const { renderer, drawn } = recording();
    const shape = createScope({ driver: manual.driver }).shape(
      { kind: 'circle', radius: [0, 100], duration: 2 },
      { renderer, origin, reducedMotion: 'always' },
    );

    await shape.play();
    manual.advance(1);

    expect(drawn).toHaveLength(1);
    expect(drawn[0]?.[0]?.radius).toBe(100);
  });

  it('shows the frame at restAt, so a Burst whose last frame is empty still shows its Children', async () => {
    const { renderer, drawn } = recording();
    const burst = createScope({ driver: manualDriver().driver }).burst(
      {
        kind: 'burst',
        count: 3,
        restAt: 0.5,
        children: { kind: 'circle', radius: [10, 0], duration: 1 },
      },
      { renderer, origin, reducedMotion: 'always' },
    );

    await burst.play();

    expect(drawn[0]?.map((record) => record.radius)).toEqual([5, 5, 5]);
  });

  it("follows the viewer's preference by default, read at play() rather than at creation", async () => {
    const manual = manualDriver();
    const { renderer, drawn } = recording();
    const shape = createScope({ driver: manual.driver }).shape(
      { kind: 'circle', radius: [0, 100], restAt: 0.25, duration: 1 },
      { renderer, origin },
    );

    prefers(true);
    await shape.play();
    expect(drawn.map((list) => list[0]?.radius)).toEqual([25]);

    prefers(false);
    shape.play();
    manual.advance(0.5);
    expect(drawn.map((list) => list[0]?.radius)).toEqual([25, 50]);
  });

  it('plays with motion where no preference can be read, and always with never', () => {
    const manual = manualDriver();
    const { renderer, drawn } = recording();
    const scope = createScope({ driver: manual.driver });
    const unread = scope.shape({ kind: 'circle', radius: [0, 100] }, { renderer, origin });
    unread.play();
    manual.advance(0.5);
    expect(drawn.map((list) => list[0]?.radius)).toEqual([50]);

    prefers(true);
    const never = scope.shape(
      { kind: 'circle', radius: [0, 100] },
      { renderer, origin, reducedMotion: 'never' },
    );
    never.play();
    manual.advance(0.25);
    expect(drawn.at(-1)?.[0]?.radius).toBe(25);
  });

  it('calls onStart, then onUpdate for the one draw, then onComplete', async () => {
    const { renderer } = recording();
    const calls: string[] = [];
    const shape = createScope({ driver: manualDriver().driver }).shape(
      { kind: 'circle', restAt: 0.5, duration: 2 },
      {
        renderer,
        origin,
        reducedMotion: 'always',
        onStart: () => calls.push('start'),
        onUpdate: (t) => calls.push(`update ${t}`),
        onComplete: () => calls.push('complete'),
      },
    );

    await shape.play();

    expect(calls).toEqual(['start', 'update 1', 'complete']);
  });

  it('never runs the Driver from resume() or reverse(): resume does nothing, reverse jumps to 0', () => {
    const manual = manualDriver();
    const { renderer, drawn } = recording();
    const shape = createScope({ driver: manual.driver }).shape(
      { kind: 'circle', radius: [0, 100], duration: 1 },
      { renderer, origin, reducedMotion: 'always' },
    );

    shape.seek(0.5);
    shape.resume();
    manual.advance(0.25);
    expect(drawn.map((list) => list[0]?.radius)).toEqual([50]);

    shape.reverse();
    manual.advance(0.25);
    expect(drawn.map((list) => list[0]?.radius)).toEqual([50, 0]);
  });

  it('holds a Timeline too: play() draws each Instance at its own Resting frame and resolves', async () => {
    const manual = manualDriver();
    const { renderer, drawn } = recording();
    const timeline = createScope({ driver: manual.driver }).timeline({ reducedMotion: 'always' });
    const first = timeline.shape(
      { kind: 'circle', radius: [0, 100], restAt: 0.5 },
      { renderer, origin },
    );
    const second = timeline.shape({ kind: 'circle', radius: [0, 40] }, { renderer, origin });

    const settled = Promise.all([first.play(), second.play(), timeline.play()]);
    manual.advance(1);
    await settled;

    expect(drawn.map((list) => list[0]?.radius)).toEqual([50, 40]);
  });

  it('checks restAt: a progress from 0 to 1', () => {
    const { renderer } = recording();
    expect(() =>
      createScope().shape({ kind: 'circle', restAt: 1.5 }, { renderer, origin }),
    ).toThrow(/restAt cannot be 1.5. Use a progress from 0 to 1/);
  });

  it("leaves an Instance on a Timeline to the Timeline's setting: drawn once, when the Timeline plays", async () => {
    const manual = manualDriver();
    const { renderer, drawn } = recording();
    prefers(true);
    const timeline = createScope({ driver: manual.driver }).timeline();
    const still = timeline.shape(
      { kind: 'circle', radius: [0, 100], restAt: 0.5 },
      { renderer, origin, reducedMotion: 'never' },
    );

    const played = still.play();
    expect(drawn).toHaveLength(0);
    await timeline.play();
    await played;
    expect(drawn.map((list) => list[0]?.radius)).toEqual([50]);

    const moving = createScope({ driver: manual.driver }).timeline({ reducedMotion: 'never' });
    const shape = moving.shape(
      { kind: 'circle', radius: [0, 100] },
      { renderer, origin, reducedMotion: 'always' },
    );
    const before = drawn.length;
    shape.play();
    expect(drawn).toHaveLength(before);
    moving.play();
    manual.advance(0.5);
    expect(drawn.at(-1)?.[0]?.radius).toBe(50);
  });

  it('leaves the Playhead on the Resting frame, so resuming with motion carries on from what is shown', () => {
    const manual = manualDriver();
    const { renderer, drawn } = recording();
    const shape = createScope({ driver: manual.driver }).shape(
      { kind: 'circle', radius: [0, 100], restAt: 0.5, duration: 1 },
      { renderer, origin },
    );

    prefers(true);
    shape.play();
    prefers(false);
    shape.resume();
    manual.advance(0.25);

    expect(drawn.map((list) => list[0]?.radius)).toEqual([50, 75]);
  });
});
