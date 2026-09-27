# 08: `shape` effect, typed entry points and unsupported vars

**What to build:** `gsap.effects.shape` and `tl.shape` draw a single Element as easily as a burst. The adapter augments GSAP's loosely typed effects map and timeline interfaces (Invariant 9) so all four entry points take typed vars: one `spec` key (`BurstSpec` for `burst`, `ShapeSpec<K>` for `shape`) plus `seed`, `container`, `renderer` and `reducedMotion`, with the rest being GSAP's tween vars. `keyframes`, `startAt`, `runBackwards` and `stagger` are excluded from the type and, at runtime, stripped with one `console.warn` per registration; the warned-once state lives in the `register()` closure, never at module level (Invariant 3). An invalid Spec fails with core's validation message. Spec: `.scratch/phase-2/spec.md`, "The effect call", "Types".

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] `gsap.effects.shape(el, { spec })` and `tl.shape(...)` paint one Element and behave like `burst` for time, cleanup and targets.
- [ ] Type tests: a wrong `kind` or a missing `spec` is rejected; the unsupported vars are rejected; GSAP's own vars are accepted.
- [ ] Unsupported vars warn once per registration and are ignored; a second registration warns again.
- [ ] An invalid Spec throws core's validation message.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

From ticket 02's review: GSAP's `_createPlugin` returns early when a plugin of the same name is already registered on that copy of GSAP, so `register()` does not run on a second `gsap.registerPlugin(Motly)`. "A second registration warns again" can only mean a second copy of GSAP; the test needs one (for example `vi.resetModules()` and a fresh import).
