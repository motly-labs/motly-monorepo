import { createRafDriver, type Driver } from './driver.js';
import { type Instance, type InstanceBinding, SpecInstance } from './instance.js';
import type { BurstSpec, ChildSpec, ShapeKind, ShapeSpec } from './spec.js';

/** An explicitly created owner of a set of Instances. */
export interface Scope {
  /** Create a Shape Instance owned by this Scope. */
  shape<K extends ShapeKind>(spec: ShapeSpec<K>, binding: InstanceBinding): Instance;
  /** Create a Burst Instance owned by this Scope. */
  burst(spec: BurstSpec, binding: InstanceBinding): Instance;
  /** Destroy every Instance this Scope created and is still holding. */
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
  const instances = new Set<Instance>();
  function create(spec: ChildSpec, binding: InstanceBinding): Instance {
    const instance: Instance = new SpecInstance(spec, binding, driver, () =>
      instances.delete(instance),
    );
    instances.add(instance);
    return instance;
  }
  return {
    shape: create,
    burst: create,
    destroy() {
      for (const instance of [...instances]) instance.destroy();
    },
  };
}
