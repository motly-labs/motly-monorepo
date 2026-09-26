/** What a Driver advances: something with a duration that can be drawn at any Playhead. */
export interface DriverTarget {
  /** Seconds from the first frame to the last. */
  readonly duration: number;
  /** Sample at Playhead `t` seconds and paint the result. */
  render(t: number): void;
  /**
   * Settle whatever waits on the end. Call it when the Playhead reaches the end moving forward,
   * by playing or by a seek, or at once from `play()` if this Driver cannot run here at all.
   */
  finish(): void;
}

/**
 * One target attached to a Driver, and the controls for its Playhead. The Driver keeps the
 * Playhead; the target holds no clock (ADR-0009).
 */
export interface Playback {
  /** Move the Playhead to 0 and advance it forward. */
  play(): void;
  /** Stop advancing, leaving the Playhead where it is. */
  pause(): void;
  /** Advance again in the direction it last moved, from where it is. */
  resume(): void;
  /** Advance the Playhead backward, toward 0, from where it is. */
  reverse(): void;
  /**
   * Move the Playhead to `t` seconds, held within 0 and the duration, and draw there now. Leaves
   * it advancing or paused as it was.
   */
  seek(t: number): void;
  /** Detach the target for good. */
  stop(): void;
}

/**
 * The port for whatever advances the Playhead: core's rAF loop standalone, GSAP's ticker, or a
 * test. Implement one when something in your app already decides time and Instances should follow it.
 */
export interface Driver {
  /** Take charge of `target`'s Playhead, paused at 0 with nothing drawn yet. */
  attach(target: DriverTarget): Playback;
}

/** Where one attached target's Playhead is, and where it is going. */
interface Head {
  t: number;
  direction: 1 | -1;
  running: boolean;
  /** The timestamp of the last frame that moved it, or `undefined` before its first. */
  last: number | undefined;
}

/**
 * The default Driver: one `requestAnimationFrame` loop. It reads `requestAnimationFrame` from
 * `globalThis` when asked to play, never at import, so importing core on a server is safe.
 */
export function createRafDriver(): Driver {
  const heads = new Map<DriverTarget, Head>();
  let frame: number | undefined;

  const canRun = () => typeof globalThis.requestAnimationFrame === 'function';

  function schedule(): void {
    if (frame !== undefined || !canRun()) return;
    for (const head of heads.values()) {
      if (head.running) {
        frame = globalThis.requestAnimationFrame(tick);
        return;
      }
    }
  }

  function unschedule(): void {
    for (const head of heads.values()) if (head.running) return;
    if (frame !== undefined) globalThis.cancelAnimationFrame(frame);
    frame = undefined;
  }

  /**
   * Move `target`'s Playhead to `t` and draw it there. It stops advancing at the end it is heading
   * for, and finishes if `forward` took it to the end.
   */
  function move(target: DriverTarget, head: Head, t: number, forward: boolean): void {
    head.t = Math.min(Math.max(t, 0), target.duration);
    const end = head.direction === 1 ? target.duration : 0;
    if (head.running && head.t === end) head.running = false;
    target.render(head.t);
    if (forward && head.t >= target.duration) target.finish();
  }

  function tick(now: number): void {
    frame = undefined;
    for (const [target, head] of heads) {
      if (!head.running) continue;
      const elapsed = head.last === undefined ? 0 : (now - head.last) / 1000;
      head.last = now;
      move(target, head, head.t + head.direction * elapsed, head.direction === 1);
    }
    schedule();
  }

  return {
    attach(target) {
      const head: Head = { t: 0, direction: 1, running: false, last: undefined };
      heads.set(target, head);
      const run = (direction: 1 | -1) => {
        // Starting from still, the first frame is where timing starts; already running, it
        // carries on counting from the last frame.
        if (!head.running) head.last = undefined;
        head.direction = direction;
        head.running = true;
        schedule();
      };
      return {
        play() {
          head.t = 0;
          if (!canRun()) {
            target.finish();
            return;
          }
          run(1);
        },
        pause() {
          head.running = false;
          unschedule();
        },
        resume() {
          run(head.direction);
        },
        reverse() {
          run(-1);
        },
        seek(t) {
          const to = Math.min(Math.max(t, 0), target.duration);
          move(target, head, to, to > head.t);
          unschedule();
        },
        stop() {
          heads.delete(target);
          unschedule();
        },
      };
    },
  };
}
