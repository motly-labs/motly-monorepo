import type { Driver, DriverTarget } from '../index.js';

/**
 * A Driver whose Playheads move only when a test says so: `advance(dt)` runs every advancing
 * Playhead on by `dt` seconds, and `seek(t)` moves every attached one to `t`. Written against the
 * public Driver port alone, it is also the proof that a custom Driver can do what the rAF one does.
 */
export function manualDriver() {
  const heads = new Map<DriverTarget, { t: number; direction: 1 | -1; running: boolean }>();

  function move(target: DriverTarget, t: number, forward: boolean): void {
    const head = heads.get(target);
    if (head === undefined) return;
    head.t = Math.min(Math.max(t, 0), target.duration);
    if (head.running && head.t === (head.direction === 1 ? target.duration : 0)) {
      head.running = false;
    }
    target.render(head.t);
    if (forward && head.t >= target.duration) target.finish();
  }

  const driver: Driver = {
    attach(target) {
      const head = { t: 0, direction: 1 as 1 | -1, running: false };
      heads.set(target, head);
      return {
        play() {
          head.t = 0;
          head.direction = 1;
          head.running = true;
        },
        pause() {
          head.running = false;
        },
        resume() {
          head.running = true;
        },
        reverse() {
          head.direction = -1;
          head.running = true;
        },
        seek(t) {
          const to = Math.min(Math.max(t, 0), target.duration);
          move(target, to, to > head.t);
        },
        stop() {
          heads.delete(target);
        },
      };
    },
  };

  return {
    driver,
    /** Run every advancing Playhead on by `dt` seconds, in its direction, and draw it. */
    advance(dt: number) {
      for (const [target, head] of heads) {
        if (head.running) move(target, head.t + head.direction * dt, head.direction === 1);
      }
    },
    /** Move every attached Playhead to `t` seconds, as a host clock would, and draw it. */
    seek(t: number) {
      for (const [target, head] of heads) {
        const to = Math.min(Math.max(t, 0), target.duration);
        move(target, to, to > head.t);
      }
    },
    /** How many targets are attached: 0 once every Instance is destroyed. */
    get attached() {
      return heads.size;
    },
  };
}
