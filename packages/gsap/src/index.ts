/**
 * `@motly/gsap` — the wedge (Phase 2).
 *
 * Registers motly's primitives as GSAP effects via `gsap.registerEffect()`, so
 * they are reachable as `gsap.effects.burst(...)` inside an existing GSAP
 * timeline. Note `gsap.registerPlugin()` registers *property* plugins consumed
 * inside a tween's vars — it does not create named top-level methods.
 *
 * Open question before any code here: ticker ownership (product.md §1.8.3). Inside
 * a GSAP host, GSAP owns the clock; core's driver has to be replaceable.
 */

export { VERSION } from '@motly/core';
