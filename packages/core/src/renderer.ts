import type { DrawList } from './draw-list.js';

/**
 * The port a Renderer implements. `owner` identifies the Instance a Draw list belongs to, so one
 * Renderer can paint many Instances. Data flows one way: a Renderer never returns anything to core.
 */
export interface Renderer {
  /** Paint `list` as the current frame of `owner`. */
  draw(owner: object, list: DrawList): void;
  /** Remove everything painted for `owner`. */
  release(owner: object): void;
}
