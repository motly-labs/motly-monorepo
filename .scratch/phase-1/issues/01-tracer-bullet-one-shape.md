# 01: Tracer bullet — one Shape, drawn by SVGRenderer, played to completion

Status: ready-for-agent
Blocked by: None (can start immediately)

**What to build:** A developer can put a single animated circle on a page using `@motly/core` and `@motly/core/svg`, play it, `await` it, and destroy it. This is the narrowest complete path through the engine — Spec, Scope, Instance, Driver, `sample(t)`, Draw list, Renderer — and it fixes the contracts every later ticket builds on. Read `.scratch/phase-1/spec.md`, `CONTEXT.md` and ADRs 0009, 0011, 0013, 0014 first.

The browser clock was settled while ticketing: the default rAF Driver ships in the main entry and reads `requestAnimationFrame` from `globalThis` when `play()` is called, never at import. Invariant 1 is read as: window-level timing and media-query APIs are allowed in the default Driver; the DOM tree (`document`, elements) is not, anywhere outside the Renderer subpaths. The Driver interface is the port; an Instance never calls `requestAnimationFrame` itself.

- [ ] `createScope()` returns a Scope; the Scope creates a Shape Instance. A bare `new Shape(…)` gets its own private Scope (ADR-0011).
- [ ] `createScope({ driver })` accepts any Driver; with none given, the Scope creates one rAF Driver shared by all its Instances.
- [ ] The Renderer, Origin and Seed are bound at Instance creation and never appear in the Spec (ADR-0014).
- [ ] The Spec type is discriminated on `kind`, with `'circle'` its only member, shaped so later kinds add members without restructuring (Invariant 9).
- [ ] A numeric property written as a two-value array animates linearly from the first value to the second over the Child's duration (the two-value case of ADR-0008 Keyframes).
- [ ] `sample(t)` is pure: the same Instance and `t` give the same Draw list whatever was sampled before, and no clock is read.
- [ ] A Draw list record is `kind` + that kind's parameters + transform + style, never built geometry (ADR-0013). Records are reused across `sample` calls — the same record objects come back.
- [ ] `play()` returns a Promise that resolves when the Playhead reaches the duration.
- [ ] `destroy()` removes the elements the Renderer created for that Instance, cancels its frame callback, and resolves a pending `play()` Promise.
- [ ] `@motly/core/svg` exports `SVGRenderer`, constructed with its container element. The main entry contains no DOM access.
- [ ] The rAF Driver reads `requestAnimationFrame` only at `play()`, never at import; with none available, `play()` no-ops.
- [ ] Importing `@motly/core` in a no-DOM environment does not throw.
- [ ] `apps/demos` has a minimal page that draws and plays the circle in a browser.
- [ ] Tests drive the public entry with a manual Driver and assert on the Draw list; none import an internal path.
