# 08: `shape` effect, typed entry points and unsupported vars

**What to build:** `gsap.effects.shape` and `tl.shape` draw a single Element as easily as a burst. The adapter augments GSAP's loosely typed effects map and timeline interfaces (Invariant 9) so all four entry points take typed vars: one `spec` key (`BurstSpec` for `burst`, `ShapeSpec<K>` for `shape`) plus `seed`, `container`, `renderer` and `reducedMotion`, with the rest being GSAP's tween vars. `keyframes`, `startAt`, `runBackwards` and `stagger` are excluded from the type and, at runtime, stripped with one `console.warn` per registration; the warned-once state lives in the `register()` closure, never at module level (Invariant 3). An invalid Spec fails with core's validation message. Spec: `.scratch/phase-2/spec.md`, "The effect call", "Types".

**Blocked by:** 02

**Status:** resolved

- [x] `gsap.effects.shape(el, { spec })` and `tl.shape(...)` paint one Element and behave like `burst` for time, cleanup and targets.
- [x] Type tests: a wrong `kind` or a missing `spec` is rejected; the unsupported vars are rejected; GSAP's own vars are accepted.
- [x] Unsupported vars warn once per registration and are ignored; a second registration warns again.
- [x] An invalid Spec throws core's validation message.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

From ticket 02's review: GSAP's `_createPlugin` returns early when a plugin of the same name is already registered on that copy of GSAP, so `register()` does not run on a second `gsap.registerPlugin(Motly)`. "A second registration warns again" can only mean a second copy of GSAP; the test needs one (for example `vi.resetModules()` and a fresh import).

Resolved: `burst` and `shape` are registered by one loop over one code path; the Drawing calls `scope.burst()` or `scope.shape()` by the Spec's `kind`. `MotlyVars` holds the four binding keys and GSAP's `TweenVars`, with `keyframes`, `startAt`, `runBackwards` and `stagger` narrowed to `never`; `BurstVars` and `ShapeVars<K>` add the `spec`. A `declare global` block merges `burst` and `shape` into GSAP's `gsap.EffectsMap` and `gsap.core.Timeline`, and survives into `dist/index.d.mts`, which imports `gsap`, so a consumer who imports `@motly/gsap` and `gsap` gets the types. The plugin file imports GSAP's type as `GSAPInstance`, since `gsap` there names the global namespace it augments. The strip runs in a function made per `register()`, which holds the warned flag; it wraps the registered effect, so `tl.burst` and `tl.shape` are stripped too. The second-registration test registers the same statically imported `Motly` on a fresh copy of GSAP, so a flag at module level fails it (checked by moving it there). Core validates when the effect measures the Spec, so an invalid Spec already threw core's message; tests pin it for both effects. Type tests are `@ts-expect-error` lines checked by `tsc`, as in core.

Beyond the ticket: `BurstVars`, `ShapeVars`, `MotlyVars` and `RendererName` are exported, so vars built apart from the call can be typed.

Left as they are:

- The type tests cannot tell whether `K` is inferred from `spec.kind`: with `K` left at `ShapeKind`, the union still rejects `points` on a circle. A probe against the built types saw `K` inferred as `'star'`.
- Invariant 6: the Drawing and the test oracle each choose `scope.burst()` or `scope.shape()` by `kind`, which core's Scope does privately. A Scope method taking either Spec would remove both.
- The warning names all four keys, whichever was given.

