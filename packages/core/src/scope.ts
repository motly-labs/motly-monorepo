import { createRafDriver, type Driver } from './driver.js';
import { type Instance, type InstanceBinding, SpecInstance } from './instance.js';
import type { BurstSpec, ChildSpec, ShapeKind, ShapeSpec } from './spec.js';
import { createTimeline, type Timeline } from './timeline.js';

/** An explicitly created owner of a set of Instances. */
export interface Scope {
  /** Create a Shape Instance owned by this Scope. */
  shape<K extends ShapeKind>(spec: ShapeSpec<K>, binding: InstanceBinding): Instance;
  /** Create a Burst Instance owned by this Scope. */
  burst(spec: BurstSpec, binding: InstanceBinding): Instance;
  /**
   * Create a Timeline owned by this Scope and played by its Driver. Reach for it to sequence
   * several Instances on one Playhead; create them with the Timeline's own `shape()` and `burst()`.
   */
  timeline(): Timeline;
  /** Destroy every Instance and Timeline this Scope created and is still holding. */
  destroy(): void;
}

/** Options for `createScope()`. Pass `driver` to play under a host's timing instead of rAF. */
export interface ScopeOptions {
  /** What advances the Playhead of every Instance in the Scope. Defaults to a rAF loop. */
  driver?: Driver;
}

/** Create a Scope. Reach for one whenever several Instances should be released together. */
export function createScope(options: ScopeOptions = {}): Scope {
  const driver = options.driver ?? createRafDriver();
  const owned = new Set<Instance | Timeline>();
  function create(spec: ChildSpec, binding: InstanceBinding): Instance {
    const instance: Instance = new SpecInstance(spec, binding, driver, () =>
      owned.delete(instance),
    );
    owned.add(instance);
    return instance;
  }
  return {
    // A ShapeSpec<K> is one of ShapeSpec's members; the compiler cannot see it through K.
    shape: (spec, binding) => create(spec as ShapeSpec, binding),
    burst: create,
    timeline() {
      const timeline: Timeline = createTimeline(driver, () => owned.delete(timeline));
      owned.add(timeline);
      return timeline;
    },
    destroy() {
      for (const each of [...owned]) each.destroy();
    },
  };
}
