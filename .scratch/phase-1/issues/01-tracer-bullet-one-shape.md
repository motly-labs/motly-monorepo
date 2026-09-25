# 01: Tracer bullet — one Shape, drawn by SVGRenderer, played to completion

Status: resolved
Blocked by: None (can start immediately)

**What to build:** A developer can put a single animated circle on a page using `@motly/core` and `@motly/core/svg`, play it, `await` it, and destroy it. This is the narrowest complete path through the engine — Spec, Scope, Instance, Driver, `sample(t)`, Draw list, Renderer — and it fixes the contracts every later ticket builds on. Read `.scratch/phase-1/spec.md`, `CONTEXT.md` and ADRs 0009, 0011, 0013, 0014 first.

The browser clock was settled while ticketing: the default rAF Driver ships in the main entry and reads `requestAnimationFrame` from `globalThis` when `play()` is called, never at import. Invariant 1 is read as: window-level timing and media-query APIs are allowed in the default Driver; the DOM tree (`document`, elements) is not, anywhere outside the Renderer subpaths. The Driver interface is the port; an Instance never calls `requestAnimationFrame` itself.

- [x] `createScope()` returns a Scope; the Scope creates a Shape Instance. A bare `new Shape(…)` gets its own private Scope (ADR-0011).
- [x] `createScope({ driver })` accepts any Driver; with none given, the Scope creates one rAF Driver shared by all its Instances.
- [ ] The Renderer, Origin and Seed are bound at Instance creation and never appear in the Spec (ADR-0014).
- [x] The Spec type is discriminated on `kind`, with `'circle'` its only member, shaped so later kinds add members without restructuring (Invariant 9).
- [x] A numeric property written as a two-value array animates linearly from the first value to the second over the Child's duration (the two-value case of ADR-0008 Keyframes).
- [x] `sample(t)` is pure: the same Instance and `t` give the same Draw list whatever was sampled before, and no clock is read.
- [x] A Draw list record is `kind` + that kind's parameters + transform + style, never built geometry (ADR-0013). Records are reused across `sample` calls — the same record objects come back.
- [x] `play()` returns a Promise that resolves when the Playhead reaches the duration.
- [x] `destroy()` removes the elements the Renderer created for that Instance, cancels its frame callback, and resolves a pending `play()` Promise.
- [x] `@motly/core/svg` exports `SVGRenderer`, constructed with its container element. The main entry contains no DOM access.
- [x] The rAF Driver reads `requestAnimationFrame` only at `play()`, never at import; with none available, `play()` no-ops.
- [x] Importing `@motly/core` in a no-DOM environment does not throw.
- [x] `apps/demos` has a minimal page that draws and plays the circle in a browser.
- [x] Tests drive the public entry with a manual Driver and assert on the Draw list; none import an internal path.

## Comments

**Implementation notes (ticket 01 build).**

- **Seed deferred to ticket 03.** Nothing here resolves randomness, so a Seed would be an unused field. Ticket 03 restates "The Seed is bound at Instance creation" as its own criterion; adding it to the Instance binding then is not a breaking change.
- **Bare `new Shape(…)` gets its own Driver, not a Scope object.** A private Scope holding one Instance with no other handle is observably identical: own frame loop, released by the Instance's `destroy()`. Ticket 02's Burst follows the same pattern.
- **`scope.destroy()` added here** though not listed above: it is the point of ADR-0011 and no other ticket owns it.
- **Draw records are flat** (`kind`, parameters, transform fields and style fields on one object) rather than nested `transform`/`style` objects. Chosen for the pool: one object per Element per Instance. This is now the Renderer contract.
- **`DriverTarget.finish()`** was added to the Driver port so a Driver that cannot run (no `requestAnimationFrame`, e.g. on a server) ends playback without drawing. `play()` then resolves at once rather than hanging.
- **Completion is decided by the Instance** on any render at `t >= duration`. Correct while nothing plays backwards; ticket 08 must make it forward-only per ADR-0016.
- **Units are seconds**, matching the spec's "seek in seconds" and GSAP's `tween.time()`. `product.md` §1.8.5's example uses milliseconds.
- **`apps/demos` is plain HTML with an import map**, no bundler, replacing the README's "Vite app (Phase 5)" note. Vite can still come when Phase 5 funds a gallery.
- Verified by hand in Chrome: attributes match the Draw list, the element is reused across frames, `destroy()` removes only its own Instance's element.
