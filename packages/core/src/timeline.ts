import type { Driver, DriverTarget, Playback } from './driver.js';
import { type Instance, type InstanceBinding, SpecInstance } from './instance.js';
import type { BurstSpec, ChildSpec, ShapeKind, ShapeSpec } from './spec.js';
import { clamp } from './utils/index.js';

/**
 * Several Instances sequenced on one Playhead: play, pause, seek or reverse the Timeline and every
 * Instance on it follows. Reach for it to chain effects, or overlap them at set offsets, without
 * awaiting one to start the next. Create one with a Scope's `timeline()`.
 *
 * A Timeline is the Driver of the Instances it creates (ADR-0009): it maps its Playhead onto each
 * one's, and is itself played by its Scope's Driver. An Instance on it follows it only: its own
 * `play()`, `pause()`, `resume()`, `reverse()` and `seek()` do nothing, though `await
 * instance.play()` still resolves when the Timeline carries it past its end moving forward.
 * Before its start an Instance is held at its first frame, and after its end at its last, as a
 * delayed Child is. Its `onUpdate` fires on each of those draws; its `onStart` and `onComplete`
 * follow its own `play()`, so `onStart` fires on the Timeline's next draw of it, held or not.
 */
export interface Timeline {
  /** Seconds from the first frame to the last: the latest end of any Instance on it. */
  readonly duration: number;
  /**
   * Create a Shape Instance on this Timeline, starting `at` seconds into it. Leave `at` out to
   * play it after everything on the Timeline so far; pass it to overlap.
   */
  shape<K extends ShapeKind>(spec: ShapeSpec<K>, binding: InstanceBinding, at?: number): Instance;
  /**
   * Create a Burst Instance on this Timeline, starting `at` seconds into it. Leave `at` out to
   * play it after everything on the Timeline so far; pass it to overlap.
   */
  burst(spec: BurstSpec, binding: InstanceBinding, at?: number): Instance;
  /**
   * Play from the start. Resolves the first time the Playhead then reaches the end moving
   * forward, or on `destroy()`; never rejects.
   */
  play(): Promise<void>;
  /** Stop the Playhead where it is. Reach for it to hold the whole sequence at once. */
  pause(): void;
  /**
   * Carry on from where `pause()` left the Playhead, in the direction it was moving. Reach for it to
   * continue a held sequence rather than restart it with `play()`.
   */
  resume(): void;
  /**
   * Run the Playhead backward from where it is, stopping at 0. Reach for it to take a whole
   * sequence back out. Reaching 0 settles nothing.
   */
  reverse(): void;
  /**
   * Move the Playhead to `t` seconds, held within 0 and `duration`, and draw every Instance there
   * now. Reach for it to jump to a moment in the sequence, or scrub it in seconds.
   */
  seek(t: number): void;
  /**
   * `seek()` by progress: 0 is the first frame, 1 the last. Reach for it to scrub the sequence from
   * a slider or a scroll position.
   */
  setProgress(p: number): void;
  /**
   * Destroy every Instance on the Timeline, and stop it. Resolves a pending `play()`. Reach for it
   * when the sequence leaves the page; a Scope's `destroy()` does it for you.
   */
  destroy(): void;
}

/** One Instance's target, and where on the Timeline it starts. */
interface Placement {
  readonly target: DriverTarget;
  readonly at: number;
}

// What an Instance on a Timeline controls: nothing, for the Timeline decides its Playhead.
const idle = () => {};

/**
 * A Timeline played by `driver`. `onDestroy` is told when it is destroyed, so its Scope can let
 * go of it.
 */
export function createTimeline(driver: Driver, onDestroy?: () => void): Timeline {
  const placements: Placement[] = [];
  const instances = new Set<Instance>();
  let waiters: (() => void)[] = [];
  let destroyed = false;
  // The Playhead last drawn, to spot an Instance's end being passed moving forward.
  let drawn = Number.NEGATIVE_INFINITY;

  const end = () =>
    placements.reduce((latest, { at, target }) => Math.max(latest, at + target.duration), 0);

  const playback: Playback = driver.attach({
    get duration() {
      return end();
    },
    render(t) {
      for (const { target, at } of [...placements]) {
        target.render(clamp(t - at, 0, target.duration));
        const ends = at + target.duration;
        if (drawn < ends && t >= ends) target.finish();
      }
      drawn = t;
    },
    finish() {
      // Each Instance's end was passed on the way here, so this settles nothing more, unless the
      // Driver cannot run at all, as rAF on a server: then it settles them all.
      for (const { target } of [...placements]) target.finish();
      settle();
    },
  });

  function settle(): void {
    const settled = waiters;
    waiters = [];
    for (const resolve of settled) resolve();
  }

  function create(spec: ChildSpec, binding: InstanceBinding, at = end()): Instance {
    const placing: Driver = {
      attach(target) {
        const placement: Placement = { target, at };
        placements.push(placement);
        return {
          play: idle,
          pause: idle,
          resume: idle,
          reverse: idle,
          seek: idle,
          stop() {
            const index = placements.indexOf(placement);
            if (index !== -1) placements.splice(index, 1);
          },
        };
      },
    };
    const instance: Instance = new SpecInstance(spec, binding, placing, () =>
      instances.delete(instance),
    );
    instances.add(instance);
    return instance;
  }

  return {
    get duration() {
      return end();
    },
    // A ShapeSpec<K> is one of ShapeSpec's members; the compiler cannot see it through K.
    shape: (spec, binding, at) => create(spec as ShapeSpec, binding, at),
    burst: create,
    play() {
      if (destroyed) return Promise.resolve();
      const finished = new Promise<void>((resolve) => waiters.push(resolve));
      // A new run: every end ahead of the Playhead is still to be passed.
      drawn = Number.NEGATIVE_INFINITY;
      playback.play();
      return finished;
    },
    pause() {
      if (!destroyed) playback.pause();
    },
    resume() {
      if (!destroyed) playback.resume();
    },
    reverse() {
      if (!destroyed) playback.reverse();
    },
    seek(t) {
      if (!destroyed) playback.seek(t);
    },
    setProgress(p) {
      if (!destroyed) playback.seek(p * end());
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      for (const instance of [...instances]) instance.destroy();
      playback.stop();
      settle();
      onDestroy?.();
    },
  };
}
