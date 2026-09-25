import { afterEach, describe, expect, it, vi } from 'vitest';
import { createScope, type DrawList, type Renderer } from './index.js';

function recordingRenderer() {
  const drawn: DrawList[] = [];
  const renderer: Renderer = { draw: (_owner, list) => drawn.push(list), release: () => {} };
  return { renderer, drawn };
}

/** Stubs `requestAnimationFrame` so the test decides when each frame fires and at what time. */
function fakeFrames() {
  const queue = new Map<number, FrameRequestCallback>();
  let nextId = 1;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    queue.set(nextId, callback);
    return nextId++;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => queue.delete(id));
  return {
    /** Fire every queued callback with timestamp `now` in milliseconds. */
    frame(now: number) {
      const callbacks = [...queue.values()];
      queue.clear();
      for (const callback of callbacks) callback(now);
    },
    get pending() {
      return queue.size;
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the default Driver', () => {
  it('resolves play() without drawing where there is no requestAnimationFrame', async () => {
    expect(globalThis.requestAnimationFrame).toBeUndefined();
    const { renderer, drawn } = recordingRenderer();
    const shape = createScope().shape({ kind: 'circle' }, { renderer, origin: { x: 0, y: 0 } });

    await shape.play();

    expect(drawn).toEqual([]);
  });

  it('plays every Instance in a Scope on one frame loop, in seconds, and stops at the end', async () => {
    const frames = fakeFrames();
    const { renderer, drawn } = recordingRenderer();
    const scope = createScope();
    const first = scope.shape(
      { kind: 'circle', radius: [0, 100], duration: 1 },
      { renderer, origin: { x: 0, y: 0 } },
    );
    const second = scope.shape(
      { kind: 'circle', radius: [0, 10], duration: 1 },
      { renderer, origin: { x: 0, y: 0 } },
    );

    const played = Promise.all([first.play(), second.play()]);
    expect(frames.pending).toBe(1);

    frames.frame(1000);
    frames.frame(1500);
    expect(drawn.at(-2)?.[0]).toMatchObject({ radius: 50 });
    expect(drawn.at(-1)?.[0]).toMatchObject({ radius: 5 });

    frames.frame(2250);
    await played;
    expect(drawn.at(-2)?.[0]).toMatchObject({ radius: 100 });
    expect(frames.pending).toBe(0);
  });

  it('cancels the frame loop when the last playing Instance is destroyed', () => {
    const frames = fakeFrames();
    const { renderer } = recordingRenderer();
    const shape = createScope().shape({ kind: 'circle' }, { renderer, origin: { x: 0, y: 0 } });

    shape.play();
    frames.frame(1000);
    shape.destroy();

    expect(frames.pending).toBe(0);
  });
});
