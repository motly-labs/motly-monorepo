# 02: Tracer bullet — `gsap.registerPlugin(Motly)` and a burst from one element

**What to build:** The thinnest complete path through the adapter. A developer registers the plugin, calls `gsap.effects.burst(button, { spec })` or `tl.burst(button, { spec }, position)`, and gets an ordinary GSAP tween that paints the burst from the button's centre in an overlay. Scrubbing the tween's progress moves the burst; at either end the overlay is gone. Follows ADR-0018 (amended): one exported object `Motly`, a GSAP property plugin with `headless: true`, whose `register(core)` hook registers `burst` with `extendTimeline: true`; the tween animates a private proxy, and the plugin's `render(ratio)` moves the Instance's Playhead to `ratio` × its duration. Instances come from core's public `createScope({ driver })` with a Driver the adapter writes against the public Driver port. Spec: `.scratch/phase-2/spec.md`, "Registration", "The effect call", "Instances, Seeds and the Driver", "Overlay and lifecycle".

This ticket also lays down the test seam every later adapter ticket uses: Vitest in `happy-dom` (a dev dependency of `@motly/gsap` only), GSAP registered headless, time moved by `progress()` on a paused tween, and core's public `sample(t)` as the oracle.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Registering in Node succeeds and adds `gsap.effects.burst` and `tl.burst`; importing the package registers nothing.
- [x] Registration uses the GSAP core passed to `register`, never an imported copy; `gsap` stays a peer dependency, `>=3.13.0`.
- [x] `gsap.effects.burst(el, { spec })` returns a tween whose length is the Instance's computed duration (ADR-0016), with a linear mapping from progress to Playhead.
- [x] The Origin is the element's centre, read when the tween starts from 0 moving forward.
- [x] One overlay per tween: `position: fixed`, viewport-sized, `pointer-events: none`, painted by an SVG Renderer; mounted on the first draw strictly between the ends, released at progress 0 and 1, mounted again when scrubbed back in.
- [x] Tests: at progress `p` the painted SVG matches core's `sample(p × duration)` for the same Spec, Seed and Origin; the overlay is absent at 0 and 1 and present between.
- [x] `tl.burst(el, { spec }, '<')` places the tween by GSAP's position parameter.
- [x] The placeholder header comment in the adapter's entry is replaced.
- [x] A changeset for `@motly/gsap`.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.
