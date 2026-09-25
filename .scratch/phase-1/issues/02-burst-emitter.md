# 02: Burst — an Emitter placing N Children by angle and radius

Status: resolved
Blocked by: 01

**What to build:** A developer can describe a Burst — `count` Children thrown outward around the Origin — and play it like the Shape from 01. This is the flagship primitive and the first Emitter (ADR-0010). Children are recursive: a Child may itself be an Emitter.

- [x] A Scope creates a Burst Instance, and a bare `new Burst(…)` gets its own private Scope, as with Shape.
- [x] A Burst spawns `count` Children and places them evenly by angle around the Origin at a radius; the radius can animate, so Children travel outward.
- [x] A Child may be an Element or another Emitter, to any depth.
- [x] An Instance's duration is derived: the latest end across all its Children, recursively. There is no duration field on an Emitter (ADR-0016).
- [x] The Draw list has one record per Element. The record pool grows when the Element count grows and at no other time.
- [x] `apps/demos` shows a Burst.

## Comments

**Implementation notes (ticket 02 build).**

- **One Instance class for every Spec.** Shape and Burst are the same `SpecInstance` typed differently. A new `resolve()` flattens any Spec into its Elements once at creation, each carrying the chain of Emitter placements between it and the Origin; `sample(t)` walks that flat list. A Shape is the degenerate case: one Element, no placements. This is the start of the spec's Resolver module, not all of it: it resolves placements and durations, but each Element still points at the shared template Spec, and `sample()` reads properties and applies defaults from it every frame. Ticket 03 has to resolve concrete per-Child values here (it needs the Child index, which `walk()` has and currently drops) and change `sample()` to read them.
- **`kind: 'burst'` is required**, including at the top level of `scope.burst({ kind: 'burst', … })`. Redundant there, but it keeps every Spec self-describing: a stored Spec can be loaded without being told what it is, and the same object is valid as a Child.
- **`children` is one template**, spawned `count` times (mojs's `children:`). Per-Child variation arrives with `each`/`rand` in ticket 03.
- **Placement is clockwise from 12 o'clock** in the Renderer's y-down space, matching `angle`'s "degrees, clockwise". Children are positioned, not rotated to face outward; revisit with the Element kinds in ticket 10, where orientation starts to show.
- **A Burst's `radius` animates over the Burst's derived duration.** There is nothing else it could animate over (ADR-0016). A nested Burst composes by translation only: it is placed at its parent's Child position.
- **Defaults**: `count` 5, `radius` `[0, 50]`, from mojs. `children` has no default.
- **Every Child starts at 0.** Start offsets arrive with Stagger and delay in ticket 07, and it is more than a `walk()` change: `sample()` measures every Emitter's radius progress and every Element's progress from `t = 0`, so a delayed nested Burst would expand early. Ticket 07 must give resolved Emitters and Elements a start time and subtract it in `sample()`.
- **`count` is not validated.** A fractional `count` spawns `ceil(count)` Children at uneven spacing; a negative one spawns none.
- **The pool is sized once at creation.** Element count cannot change during an Instance's life yet, so "grows with Element count" is trivially satisfied; revisit if a Descriptor ever makes `count` vary.
- Verified in Chrome by painting sampled frames through `SVGRenderer`: 24 elements for an 8×3 nested Burst, positions match the tests' arithmetic, redraw reuses the elements, `destroy()` removes them. Live rAF playback could not be watched because the automation tab is hidden between calls, which pauses rAF.
