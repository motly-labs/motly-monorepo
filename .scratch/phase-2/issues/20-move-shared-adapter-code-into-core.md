# 20: Move the code a second adapter would copy into core

**What to build:** One place for the drawing rules any adapter needs, so the Motion adapter does not copy them from `@motly/gsap` the way `@motly/gsap` copied them from core. Invariant 6: "anything two adapters both need belongs in core". Found by the 2026-09-28 review of Phase 2 (`.scratch/phase-2/code-review-2026-09-28.md`, Standards 1 and 3, and the smell "same check in two places").

**Blocked by:** the phase that starts `@motly/motion` (post-v1, ADR-0007). With one adapter the copies cost little; the second adapter is what makes them wrong, and its needs decide the shape of the core API.

**Status:** needs-triage

The copies, as of `main` on 2026-09-30:

- **Container positioning.** `claimPosition` / `releasePosition` (`packages/gsap/src/drawing.ts:94-117`) make a static container relative and put its inline `position` back when the last adapter layer leaves. Core's `AutoRenderer.#position()` (`packages/core/src/auto/index.ts:86-91`) does the first half and never the second: standalone core leaves the container relative.
- **Layer styling.** `createLayer` (`drawing.ts:61-92`) repeats `cover()` (`auto/index.ts:95-103`): absolute, full size, no pointer events.
- **Reduced-motion drawing.** The adapter decides once per forward start with `isMotionReduced()` and seeks `restingPlayhead` (`drawing.ts:186-188`, `:212`), the rule core's Timeline already applies at its start.
- **Burst or shape.** `kind === 'burst' ? scope.burst(…) : scope.shape(…)` at `drawing.ts:237-238` and `testing/dom.ts:54`. A core `scope.create(spec, binding)` would replace both.

Also in the adapter's DOM work, per ADR-0014 and the Renderer entry in `CONTEXT.md` ("the only part of the library that touches the DOM"): it creates and styles its own svg, canvas and div layers. Decide whether that moves behind a core Renderer or the rule is restated.

- [ ] Each rule above is one exported core function or Scope method, with a doc comment saying when to reach for it, and a changeset.
- [ ] `@motly/gsap` uses them and keeps no copy; its tests pass unchanged.
- [ ] Core's AutoRenderer puts a container's position back when it is done with it, or the spec says why not.
