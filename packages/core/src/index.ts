/**
 * `@motly/core` — the renderer-agnostic engine.
 *
 * Phase 1 lands the domain model here: Shape, Burst, Swirl, Stagger, Timeline,
 * emitting a draw list that renderer adapters consume. See `product.md` §1.8
 * for the API synthesis this package has to implement, and §2.2 for the port
 * boundaries it must not cross.
 *
 * Invariant: this package has zero runtime dependencies and never touches the
 * DOM directly.
 */

export const VERSION = '0.0.0';
