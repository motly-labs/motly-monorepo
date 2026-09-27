# 05: Targets and Seeds

**What to build:** Every way a developer names where a burst comes from. A selector or list gives one Instance per element, each with its own Seed, all driven by the one tween; a plain `{ x, y }` is an Origin in viewport CSS pixels, as `clientX`/`clientY` give. With `seed`, target `i` gets `seed + i`; without, one random Seed is drawn at the effect call and used the same way; Seeds stay fixed for the tween's life, across repeats, restarts and scrubbing. An Anchor's position is read at each start from 0 moving forward, not per frame. Targets that match nothing warn once, like GSAP's own "target not found", and return a tween of the Spec's duration that draws nothing. Spec: `.scratch/phase-2/spec.md`, "The effect call", "Instances, Seeds and the Driver".

**Blocked by:** 02

**Status:** resolved

- [x] Several Anchors give distinct bursts, each from its own element's centre.
- [x] The same `seed` gives the same bursts on a second run; no `seed` gives a different burst per call.
- [x] A burst is identical before and after a repeat, a restart and a scrub.
- [x] A point target paints from that point.
- [x] An element moved before a burst placed late in a timeline starts is read where it is by then.
- [x] An empty selector warns once and returns a tween of the Spec's duration that draws nothing.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

From ticket 02's review:

- Ticket 02 already draws one random Seed per tween at the effect call and gives Anchor `i` `seed + i`, so a remount draws the same burst. This ticket adds `vars.seed` and its tests.
- The tween's length comes from throwaway Instances built with a Renderer that draws nothing. That is also the answer for targets that match nothing, but it is a workaround for a missing core API (Invariant 6); raise it if a second adapter needs the same.
- Whether a `repeat` re-reads the Anchor: see ticket 03's comments.

Resolved: `vars.seed` is taken out of the tween vars and handed to the Drawing, which gives target `i` the Seed `seed + i`, or draws one random Seed per effect call without it. A target is an Anchor when its `nodeType` is an element's, and an Origin otherwise; testing `x` and `y` would read an `<img>`, which has numeric ones, as a point. The overlay goes in the first Anchor's document, or the page's when every target is a point. Targets that match nothing warn once per call and measure one throwaway Instance, so the tween still lasts the Spec. The Anchor rule is ticket 03's: read when the tween leaves its very start.

Left as they are:

- The warning cannot name the selector as GSAP's does: GSAP resolves it to an empty list before the effect is called.
- GSAP's `gsap.config({ nullTargetWarn: false })` does not silence it. Not asked for; add if a user wants it.
- A target that is neither an element nor `{ x, y }` is not checked at runtime; ticket 08's types exclude it.

