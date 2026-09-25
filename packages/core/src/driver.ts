/** What a Driver advances: something with a duration that can be drawn at any Playhead. */
export interface DriverTarget {
  /** Seconds from the first frame to the last. */
  readonly duration: number;
  /** Sample at Playhead `t` seconds and paint the result. */
  render(t: number): void;
  /** End playback without drawing, for a Driver that cannot run in this environment. */
  finish(): void;
}

/** One target being advanced by a Driver. */
export interface Playback {
  /** Stop advancing the target. */
  stop(): void;
}

/**
 * The port for whatever advances the Playhead: core's rAF loop standalone, GSAP's ticker, or a
 * test. Implement one when something in your app already decides time and Instances should follow it.
 */
export interface Driver {
  /** Start advancing `target`'s Playhead from 0. */
  play(target: DriverTarget): Playback;
}

/**
 * The default Driver: one `requestAnimationFrame` loop. It reads `requestAnimationFrame` from
 * `globalThis` when asked to play, never at import, so importing core on a server is safe.
 */
export function createRafDriver(): Driver {
  // Each playing target, with the timestamp of its first frame once it has had one.
  const playing = new Map<DriverTarget, number | undefined>();
  let frame: number | undefined;

  function tick(now: number): void {
    frame = undefined;
    for (const [target, start] of playing) {
      const startedAt = start ?? now;
      if (start === undefined) playing.set(target, now);
      const t = Math.min((now - startedAt) / 1000, target.duration);
      if (t >= target.duration) playing.delete(target);
      target.render(t);
    }
    if (playing.size > 0) frame ??= globalThis.requestAnimationFrame(tick);
  }

  return {
    play(target) {
      if (typeof globalThis.requestAnimationFrame !== 'function') {
        target.finish();
        return { stop() {} };
      }
      playing.set(target, undefined);
      frame ??= globalThis.requestAnimationFrame(tick);
      return {
        stop() {
          playing.delete(target);
          if (playing.size === 0 && frame !== undefined) {
            globalThis.cancelAnimationFrame(frame);
            frame = undefined;
          }
        },
      };
    },
  };
}
