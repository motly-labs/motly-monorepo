import { describe, expect, it } from 'vitest';
import { createScope, type DrawRecord, type Renderer } from './index.js';
import { manualDriver } from './testing/manual-driver.js';

/** A Renderer keeping the last record each owner drew, and who it released. */
function lastDrawn() {
  const last = new Map<object, DrawRecord>();
  const released: object[] = [];
  const renderer: Renderer = {
    draw: (owner, list) => {
      if (list[0] !== undefined) last.set(owner, { ...list[0] });
      else last.delete(owner);
    },
    release: (owner) => released.push(owner),
  };
  return { renderer, last, released };
}

const circle = (duration: number) => ({
  kind: 'circle' as const,
  radius: [0, 100] as [number, number],
  duration,
});

describe('a Timeline', () => {
  it('places Instances at start offsets and draws each at its own Playhead', () => {
    const manual = manualDriver();
    const { renderer, last } = lastDrawn();
    const timeline = createScope({ driver: manual.driver }).timeline();
    const first = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } }, 0);
    const second = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } }, 0.5);

    timeline.seek(0.75);

    expect(last.get(first)?.radius).toBe(75);
    expect(last.get(second)?.radius).toBe(25);
  });

  it('appends an Instance after the current end when no offset is given, and derives its duration', () => {
    const manual = manualDriver();
    const { renderer, last } = lastDrawn();
    const timeline = createScope({ driver: manual.driver }).timeline();
    const first = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });
    const second = timeline.burst(
      { kind: 'burst', count: 1, radius: 0, children: circle(2) },
      { renderer, origin: { x: 0, y: 0 } },
    );

    expect(timeline.duration).toBe(3);
    timeline.seek(2);
    // The first has ended and holds its last frame; the second is a second into its two.
    expect(last.get(first)?.radius).toBe(100);
    expect(last.get(second)?.radius).toBe(50);
  });

  it('plays, pauses, resumes and reverses every Instance on it together', () => {
    const manual = manualDriver();
    const { renderer, last } = lastDrawn();
    const timeline = createScope({ driver: manual.driver }).timeline();
    const first = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } }, 0);
    const second = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } }, 0.5);
    const radii = () => [last.get(first)?.radius, last.get(second)?.radius];

    timeline.play();
    manual.advance(0.75);
    expect(radii()).toEqual([75, 25]);
    timeline.pause();
    manual.advance(0.5);
    expect(radii()).toEqual([75, 25]);
    timeline.resume();
    manual.advance(0.25);
    expect(radii()).toEqual([100, 50]);
    timeline.reverse();
    manual.advance(0.5);
    expect(radii()).toEqual([50, 0]);
  });

  it('holds an Instance at its first frame before its start, and at its last after its end', () => {
    const manual = manualDriver();
    const { renderer, last } = lastDrawn();
    const timeline = createScope({ driver: manual.driver }).timeline();
    const early = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } }, 0);
    const late = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } }, 2);

    timeline.seek(1.5);

    expect(last.get(early)?.radius).toBe(100);
    expect(last.get(late)?.radius).toBe(0);
  });

  it("resolves play() at its end, and an Instance's own play() when the Timeline passes its end", async () => {
    const manual = manualDriver();
    const { renderer } = lastDrawn();
    const timeline = createScope({ driver: manual.driver }).timeline();
    const first = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });
    timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });
    const settled: string[] = [];

    first.play().then(() => settled.push('first'));
    timeline.play().then(() => settled.push('timeline'));
    manual.advance(1.5);
    await Promise.resolve();
    expect(settled).toEqual(['first']);
    manual.advance(0.5);
    await Promise.resolve();
    expect(settled).toEqual(['first', 'timeline']);
  });

  it("leaves time to the Timeline: an Instance's own controls do nothing", () => {
    const manual = manualDriver();
    const { renderer, last } = lastDrawn();
    const timeline = createScope({ driver: manual.driver }).timeline();
    const shape = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });

    timeline.seek(0.5);
    shape.seek(0.9);
    shape.setProgress(0.1);
    shape.reverse();
    manual.advance(0.2);

    expect(last.get(shape)?.radius).toBe(50);
  });

  it('releases its Instances on destroy(), and its Scope releases it, resolving a pending play()', async () => {
    const manual = manualDriver();
    const { renderer, released } = lastDrawn();
    const scope = createScope({ driver: manual.driver });
    const timeline = scope.timeline();
    const first = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });
    const second = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });
    const other = scope.timeline();
    const third = other.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });

    const played = timeline.play();
    manual.advance(0.5);
    timeline.destroy();
    await played;
    expect(released).toEqual([first, second]);

    scope.destroy();
    expect(released).toEqual([first, second, third]);
    expect(manual.attached).toBe(0);
  });

  it('takes an Instance destroyed on its own off the Timeline, shortening it', () => {
    const manual = manualDriver();
    const { renderer } = lastDrawn();
    const timeline = createScope({ driver: manual.driver }).timeline();
    timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });
    const last = timeline.shape(circle(2), { renderer, origin: { x: 0, y: 0 } });

    last.destroy();

    expect(timeline.duration).toBe(1);
  });

  it('resolves play() once however its Playhead is scrubbed over the end, and again on a replay', async () => {
    const manual = manualDriver();
    const { renderer } = lastDrawn();
    const timeline = createScope({ driver: manual.driver }).timeline();
    const shape = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });
    let completed = 0;
    const count = () => completed++;

    shape.play().then(count);
    timeline.play().then(count);
    for (const t of [1, 0.5, 1, 0, 1]) timeline.seek(t);
    await Promise.resolve();
    expect(completed).toBe(2);

    timeline.play().then(count);
    manual.advance(1);
    await Promise.resolve();
    expect(completed).toBe(3);
  });

  it("settles its Instances' play() with its own where the Driver cannot run, as on a server", async () => {
    const { renderer } = lastDrawn();
    const timeline = createScope().timeline();
    const shape = timeline.shape(circle(1), { renderer, origin: { x: 0, y: 0 } });

    const instance = shape.play();
    await timeline.play();
    await instance;
  });
});
