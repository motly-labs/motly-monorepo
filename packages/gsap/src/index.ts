/**
 * `@motly/gsap` — motly's bursts as GSAP effects. Register the plugin with
 * `gsap.registerPlugin(Motly)`; importing this entry registers nothing (ADR-0018).
 */

export { VERSION } from '@motly/core';
export * from './descriptors-and-curves.js';
export type { RendererName } from './drawing.js';
export { type BurstVars, Motly, type MotlyVars, type ShapeVars } from './plugin.js';
