import { createRafDriver, type Driver } from './driver.js';
import { type Instance, type InstanceBinding, ShapeInstance } from './instance.js';
import type { ShapeKind, ShapeSpec } from './spec.js';

/** An explicitly created owner of a set of Instances. */
export interface Scope {
  /** Create a Shape Instance owned by this Scope. */
  shape<K extends ShapeKind>(spec: ShapeSpec<K>, binding: InstanceBinding): Instance;
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
  return {
    shape(spec, binding) {
      const instance: Instance = new ShapeInstance(spec, binding, driver, () =>
        instances.delete(instance),
      );
      instances.add(instance);
      return instance;
    },
    destroy() {
      for (const instance of [...instances]) instance.destroy();
    },
  };
}
