# Phase 1 — `@motly/core`, the engine

Status: ready-for-agent

## Problem Statement

A developer who wants a procedural burst on a web page today has three bad choices. GSAP, Motion and anime.js animate DOM that already exists, so the developer has to author twenty elements before anything can move. mojs generates them, but it is unmaintained, untyped, SVG-only, holds module-level state that makes two instances on one page interfere, and leaks DOM because cleanup is manual and per-object. Pixi and Three generate anything at all, at the cost of learning a creative-coding framework and shipping a renderer.

There is nothing in between: no library where the developer describes *what kind of motion* they want — twenty polygons, thrown outward, random angles, staggered — and gets back something typed, scrubbable, seedable, serializable, accessible and disposable.

`@motly/core` is that library, and none of it exists yet. `packages/core/src` holds a version constant and two numeric helpers.

## Solution

One package, `@motly/core`, containing the whole engine and both v1 Renderers, that a developer uses standalone with no framework, no build step beyond their own, and no runtime dependencies.

The developer writes a Spec: a plain JSON-serializable object describing an Emitter, its Children and their properties. Randomness and per-Child distribution appear in the Spec as tagged Descriptors, so the Spec survives `JSON.stringify` and a future editor can read and write it. They construct a Scope, ask it for an Instance bound to a Renderer, a Seed and an Origin, and call `play()`. A Driver advances the Playhead; the Instance samples itself at that Playhead into a Draw list; the Renderer paints it. `await` the Promise to know it finished. `scope.destroy()` releases every Instance, its Driver and its DOM at once.

Because sampling is a pure function of the Playhead (ADR-0009), the same Instance scrubs, reverses, seeks, snapshot-tests and runs inside GSAP's timeline in Phase 2 with no change to core.

The phase is done when `createScope().burst({ … }).play()` in a plain HTML file draws a burst in Safari, Chrome and Firefox.

## User Stories

### Describing motion

1. As a developer, I want to describe an Emitter and its Children as one plain object, so that I can author an effect without constructing any DOM myself.
2. As a developer, I want a `Shape` Element with a `kind` of circle, polygon, star, cross, line or zigzag, so that I can get recognisable geometry without drawing paths by hand.
3. As a developer, I want `Shape<'polygon'>` to require `points` and `Shape<'circle'>` to reject it, so that the compiler catches a malformed Spec before I run it.
4. As a developer, I want a `Burst` Emitter that spawns `count` Children and places them by angle and radius, so that I get the flagship effect from one declaration.
5. As a developer, I want a `Swirl` Modifier that wraps exactly one Child and bends its path, so that I can add motion character without a new drawable.
6. As a developer, I want to nest an Emitter inside a Modifier and a Modifier inside an Emitter, so that composition is not special-cased by depth.
7. As a developer, I want to write a property as an array and get Keyframes across that Child's duration, so that the syntax means what it means in GSAP and Motion (ADR-0008).
8. As a developer, I want `each([...])` to hand successive values to successive Children, so that distribution across an Emitter is explicit rather than inferred from an array (ADR-0008).
9. As a developer, I want `rand(min, max)` to produce a Descriptor rather than a number, so that the Spec stays serializable and the value resolves per Instance and per Child.
10. As a developer, I want `each` and `rand` to compose — random values distributed across Children — so that I do not hit a wall the first time I combine the two.
11. As a developer, I want to animate numbers, colors and unit-bearing strings with the same syntax, so that I do not have to remember which properties are special.
12. As a developer, I want a named easing, a cubic-bezier and an SVG path string to all be accepted as a curve, so that a curve I copy out of a design tool works unchanged.
13. As a developer, I want per-Child `delay` and per-Emitter `stagger`, with the Stagger itself shaped by an easing curve, so that I can make a burst land unevenly on purpose.
14. As a developer, I want `JSON.parse(JSON.stringify(spec))` to produce a Spec that builds an identical Instance, so that an effect can be stored, sent over a wire, or edited by a tool.

### Playing it

15. As a developer, I want `play()` to return a Promise that resolves once when the Playhead first reaches the end moving forward, so that `await` means what it looks like (ADR-0016).
16. As a developer, I want the duration derived from my Children rather than declared on the Emitter, so that changing a Child's duration cannot leave the parent's wrong.
17. As a developer, I want `pause()`, `resume()` and `reverse()`, so that an effect can respond to something other than its own start.
18. As a developer, I want `setProgress(p)` and a seek in seconds, so that I can scrub an effect from a slider, a scroll position or a test.
19. As a developer, I want scrubbing backwards over the end not to resolve `play()` a second time, so that a scrubbed effect does not fire completion repeatedly.
20. As a developer, I want `destroy()` mid-flight to resolve the pending Promise rather than reject it, so that an unmounted component cannot produce an unhandled rejection.
21. As a developer, I want lifecycle callbacks alongside the Promise, so that I can react to start, update and complete without awaiting.
22. As a developer, I want to supply my own Driver, so that the engine plays under a clock I already own — and so that Phase 2's GSAP tween needs no core change (Invariant 5).
23. As a developer, I want one rAF Driver per Scope rather than one per Instance, so that fifty simultaneous bursts share one frame loop (ADR-0011).
24. As a developer, I want a Timeline that maps its own Playhead onto several Instances, so that I can sequence effects without a second playback engine.

### Reproducibility

25. As a developer, I want `seed: 42` to reproduce an identical burst on every run and every machine, so that a demo, a bug report and a screenshot test all show the same thing.
26. As a developer, I want each Child to derive its own Seed from the Instance Seed and its index, so that raising `count` from 20 to 21 leaves the first twenty Children untouched.
27. As a developer, I want an omitted Seed to mean a fresh random one, so that reproducibility is opt-in and repeated clicks look different.

### Drawing

28. As a developer, I want to construct a Renderer with the element it paints into and never pass an element to core, so that the boundary between engine and DOM is obvious (ADR-0014).
29. As a developer, I want one Renderer to host many Instances at different Origins, so that a click-burst over a whole page adds no DOM per click.
30. As a developer, I want an `SVGRenderer` that keeps a live element per Element and updates attributes, so that I get mojs parity and inspectable DOM.
31. As a developer, I want a `CanvasRenderer` that hits 60fps with 5,000 Elements, so that the perf story past SVG's ceiling is real.
32. As a developer, I want `renderer: 'auto'` to choose once at creation from the Element count, so that I get a sensible default without a mid-animation teardown (ADR-0015).
33. As a developer, I want `destroy()` to remove every element, listener and frame callback the Instance created, so that a long-lived page does not accumulate them.
34. As a developer, I want to import `@motly/core` on a server without a crash, so that the package is usable in Next.js and Remix.

### Accessibility

35. As a viewer with `prefers-reduced-motion: reduce` set, I want a single static Resting frame instead of motion, so that the page is usable without being blank.
36. As a developer, I want `restAt` in the Spec to choose which frame that is, so that a burst whose true last frame is empty still shows something (ADR-0012).
37. As a developer, I want `reducedMotion: 'user' | 'always' | 'never'` on the Instance, so that I can force either behaviour in a demo or a test.
38. As a developer, I want reduced motion honoured by default with no configuration, so that the accessible path is the one I get by not thinking about it.

### Building on it

39. As a Preset author, I want every Preset buildable from the public API, so that shipping `@motly/presets` later needs no new core surface (Invariant 7).
40. As an adapter author, I want the Driver, the Renderer and the Scope all replaceable from outside, so that Phase 2's adapter stays thin (Invariant 6).
41. As a contributor, I want `sample(t)` to be callable directly with no clock, so that engine tests need neither timers nor a browser.
42. As a contributor, I want a visual regression harness with committed PNGs, so that a change in geometry fails CI instead of being noticed in a demo three weeks later.
43. As a developer, I want `Burst` plus `Shape` plus one Renderer to tree-shake under 15 kB min+gzip, so that the library is defensible against "just write it yourself".

## Implementation Decisions

### Packaging

- Everything in this phase ships inside `@motly/core`. No new package. ADR-0007 fixed v1 at two published packages.
- The engine is the barrel entry. `SVGRenderer` and `CanvasRenderer` are separate subpath entries, one per Renderer, following the `@motly/core/utils` precedent (ADR-0006). This keeps the barrel free of DOM code, makes SSR safety a property of the import graph rather than of the bundler, and keeps the §1.6 bundle budget (`Burst` + `Shape` + one Renderer) reachable.
- `product.md` §2.2 says "new renderer = new package". v1 does not follow it. Recorded here rather than as an ADR: revisit and write one if a third renderer or an external renderer author makes the packaging hard to change.
- Easings are individually importable. The bundle budget assumes only the ones used are paid for.

- Every Spec carries its `kind`, including at the top level: `createScope().burst({ kind: 'burst', … })`. Redundant there, but a stored Spec is then self-describing, and the same object is valid as a Child. Decided in ticket 02.

- A unit-bearing string converts to a number when the Instance is created: lengths take `px`, angles `deg`, `rad` or `turn`, durations `s` or `ms`. Draw records stay numbers. Units that need layout (`em`, `%`, `vw`) are refused, since core reads no layout. Decided with the user in ticket 04.

- In a Draw record, `fill` and `stroke` are CSS color strings: a constant exactly as the Spec wrote it, or `rgba(r, g, b, a)` while animating. Documented on `Style`; ticket 11's CanvasRenderer consumes it. Decided in ticket 04.

- A curve in a Spec is data: one of the five CSS easing keywords, or a cubic-bezier as four numbers. Named curves (`quadOut`, `backOut`, …) are exported constants holding their cubic-bezier (or, since ticket 06, a path string for elastic and bounce), so an unused one tree-shakes out and a stored Spec serializes to numbers. There is no string name table. `easing` on a Shape or Burst takes one curve or a map by property name with `default`. Decided with the user in ticket 05.

- The Driver port, decided with the user in ticket 08: `Driver.attach(target)` returns a Playback, paused at 0 with nothing drawn, with `play()` (from 0, forward), `pause()`, `resume()`, `reverse()`, `seek(t)` and `stop()`. The Driver keeps the Playhead and its direction, so it alone decides when the Playhead reached the end moving forward, and says so with `target.finish()`. An Instance mirrors the Playback one to one, plus `setProgress(p)` as `seek(p * duration)`, and attaches when it is created (on first use until ticket 14), so a never-played Instance can be scrubbed and a Timeline knows every Instance on it. Lifecycle callbacks `onStart`, `onUpdate(t)` and `onComplete` sit on the InstanceBinding, beside the Renderer and Origin, never in the Spec: start on the first draw of each `play()`, update on every draw, complete when pending `play()`s settle by the Playhead reaching the end moving forward (once for all of them, whichever way a seek found the Playhead running), and not on `destroy()`. Where the Driver cannot run at all, as rAF on a server, `play()` settles at once and complete fires with nothing drawn. Nothing fires after `destroy()`, even from inside a callback. Recorded here, not as an ADR: write one if the GSAP adapter in Phase 2 cannot implement this port without changing it.

- Timing, decided with the user in ticket 07. A Child starts at its Burst's start, plus its Stagger offset, plus its own `delay`. `stagger` is a time between successive Children, clockwise from 12 o'clock, or `{ each, easing }`: the same span, `each` × (`count` − 1), spread along a Curve, with offsets below 0 held at 0. No `from` or `grid` in v1. Before its start a Child is held at its first frame, so it is drawn; nothing is hidden and the Draw list is unchanged. A Burst's radius runs on each Child's clock from that Child's start, so a late Child is thrown from the Origin, over the longest time any of its Children runs.

- A curve can also be an SVG path string in mojs's 100×100 box, y down (`'M0,100 C…100,0'`). It must start at x 0 and end at x 100, never turn back in x, and use only M, L, H, V, C, S, Q and T (absolute or relative): a curve drawn in the wrong box fails at creation rather than silently flattening. y is free, so a path can overshoot or end where it started. Elastic and bounce ship as path-string constants. Decided with the user in ticket 06.

- A Swirl bends the ray the Burst around it throws its Child along, turning it about the ray's start by `direction` × `size` × sin(2π × `frequency` × progress), with `size` an angle, `frequency` in waves per throw and progress along the throw as the Burst's radius eases. It draws nothing, adds no time, and passes its Seed and index through. With no Burst around it, there is nothing to bend. Decided with the user in ticket 09.

- Element kinds, decided with the user in ticket 10: every kind is centred on its position and points at 12 o'clock at `angle` 0. `polygon` and `star` take `points` (required); a star's `innerRadius` is a fraction of `radius`; a `zigzag` takes `points` (required) and `amplitude` in px; a `path` takes `d`, drawn in a 100×100 box scaled to `radius`. `points` and `d` hold still. A cross, a line and a zigzag default to a stroke and no fill, field by field. A Burst mixes kinds through `children: each([...Child Specs])`. Renderers build geometry from the records through one shared tracer.

- CanvasRenderer, decided with the user in ticket 11: it keeps a copy of each Instance's last frame and repaints them all once per task. It sizes its backing store to the canvas's CSS size × `devicePixelRatio` and follows that size with a `ResizeObserver` that runs only while some Instance is drawing. A canvas sized only by its attributes is pinned inline at its size, since it would otherwise grow with its own backing store; one sized in CSS stays responsive. Origins are CSS pixels and do not move on a resize.

- AutoRenderer, decided with the user in ticket 12: `'auto'` is `AutoRenderer` from `@motly/core/auto`, built with a container element and passed as `renderer`. It picks SVGRenderer or CanvasRenderer on each Instance's first draw, from its Draw list's length, and paints into an `<svg>` layer over a `<canvas>` layer it creates inside the container, making a `static` container `relative`. The port is unchanged. Recorded in ADR-0015 with the measured threshold.

- Timeline, decided with the user in ticket 14: a Scope's `timeline()` returns a Timeline played by the Scope's Driver, and the Timeline's own `shape()` and `burst()` create Instances on it, `at` a start offset or, left out, after everything on it so far. The Timeline is those Instances' Driver: it maps its Playhead onto each one's, holding one at its first frame before its start and at its last after its end, and calls its `finish()` when its own Playhead passes that end moving forward. Its duration is the latest end on it. An Instance on a Timeline follows it only: its own playback controls do nothing, though `await instance.play()` resolves when the Timeline carries it past its end. `timeline.destroy()` destroys its Instances; `scope.destroy()` destroys its Timelines. No nesting of Timelines in v1.

- Reduced motion, decided with the user in ticket 13: `restAt` (0 to 1, default 1) sits on a Shape or Burst Spec and is read from the Spec an Instance is created from. `reducedMotion: 'user' | 'always' | 'never'` sits on the InstanceBinding and on a Timeline's options, defaulting to `'user'`, which reads `matchMedia` from `globalThis` at each `play()`, and treats a missing one as no preference. Under reduced motion `play()` draws the Resting frame once, as a play that went straight to its end: `onStart`, `onUpdate(restAt × duration)`, then `onComplete`, and resolves at once. `resume()` does nothing and `reverse()` jumps to the first frame, so no path runs a Driver; `seek()` and `setProgress()` still move the Playhead, being the viewer's own input. A Timeline under reduced motion draws each Instance once at its own Resting frame, and decides for every Instance on it, whatever their own bindings say. The Driver port does not carry the Resting frame; the GSAP adapter decides in Phase 2 whether it needs to.

- A Spec from JSON is validated in full when the Instance is created, so it gets the same guarantees as one the compiler checked. Validation is strict: an unknown field (`raduis`) is an error, not ignored. The cost is forward compatibility: a Spec saved with a field from a newer version fails on an older one. Decided with the user after ticket 05.

- The RNG algorithm and the Seed derivation scheme are a compatibility contract from the first release: changing either changes every seeded burst anyone has saved. `descriptors.test.ts` pins two values under Seed 42 to catch it. Decided in ticket 03; write an ADR if it ever has to change.

### Modules and their boundaries

- **Spec types** — the serializable description. Discriminated on `kind`, generic per Element kind (Invariant 9). No functions, no elements, no live objects.
- **Descriptors** — `rand` and `each`, each a tagged object (`{ __motly: 'rand' | 'each', … }`) with a resolver that takes a Seed and a Child index. New Descriptor kinds are added here and nowhere else.
- **Validation** — checks a whole Spec before it is resolved: every field of every Spec in the tree, every `each()` value whether or not a Child picks it, and the Child of a Burst with no Children. Every error message a bad Spec can produce lives here, naming the place (`children.fill[0]`). The parsers it shares with the Resolver (units, colors, curves) return `undefined` rather than throw.
- **Resolver** — walks a Spec and a Seed into a flattened, resolved tree of Children with concrete values, absolute start times and durations. Runs once per Instance, not per frame.
- **Tween** — interpolates one resolved property at a local progress. Numbers, colors, Keyframes. Pure. Unit-bearing strings and Keyframe colors are checked by Validation and converted by the Resolver at creation, not here, so a bad one fails before the first frame.
- **Easing** — curve to progress. Named curves, cubic-bezier, and an SVG path parser for the curve-as-data story. Pure, no state.
- **RNG** — a seeded, self-contained generator. Deterministic across platforms; must not use `Math.random` internally.
- **Instance** — binds a Spec to a Seed, a Renderer, an Origin and a Driver. Exposes `sample(t)`, playback delegation, `destroy()`. Holds no clock (ADR-0009).
- **Scope** — creates Instances, owns one Driver, releases everything on `destroy()` (ADR-0011). Created explicitly; there is no ambient context and no module-level state (Invariant 3).
- **Driver** — a small interface over play, pause, reverse and seek. Implementations in v1: a rAF Driver and a Timeline. A manual Driver falls out of the same interface and is what tests use.
- **Draw list** — a pooled, reused array of records. Each record is `kind`, that kind's parameters, a transform and a style; never built geometry (ADR-0013). The pool grows with Element count and is never reallocated per frame.
- **Renderers** — consume a Draw list and paint. The only DOM in the package. Data flows one way; a Renderer never writes back into core (Invariant 2).

### Contracts

- `sample(t)` is pure and total: the same Instance, Seed and `t` produce the same Draw list, in any order, with no prior call required.
- The Draw list handed to a Renderer is valid until the next `sample`. A Renderer that needs to retain something copies it.
- An Instance's duration is the latest end across its Children, computed recursively at creation (ADR-0016).
- An Instance has no repeat count in v1. Repetition is the Driver's.
- Origin is `{ x, y }` in the Renderer's coordinate space. Core does no hit-testing and reads no layout; converting a pointer position is the caller's job.
- `renderer: 'auto'` resolves once, on an Instance's first draw, and never switches. The threshold is 50 Elements, set in ticket 12 from a benchmark, replacing the 200-Element placeholder; the machine, the numbers and the reasons are recorded with it (ADR-0015).
- Under reduced motion an Instance renders `sample(restAt * duration)` exactly once and never starts a Driver.

### Ordering

- The tracer bullet is a single-Element `Shape` on `SVGRenderer`, played by the rAF Driver, sampled and drawn. Everything else hangs off that path.
- `SVGRenderer` before `CanvasRenderer`: easier to debug, and its output is inspectable while the Draw list contract is still settling.
- The Playwright harness is built in this phase, last, and is the ticket allowed to slip. The coverage target is not.

## Testing Decisions

### What a good test looks like here

A test drives the package's public entry and asserts on the Draw list. It does not import an internal path, does not reach into an Instance's fields, and does not assert on the resolved tree — the resolved tree is an implementation detail of `sample(t)`, and a test that asserts on it will fail the first time the pooling or flattening changes.

Concretely: build a Spec, create an Instance with a fixed Seed and a manual Driver, call `sample(t)` at chosen `t`, assert on the records. Time is an argument, so there are no timers, no fake clocks and no `await` on a frame.

### Seam 1 — `@motly/core`, in Vitest

This is where almost every test lives. Covered through it: Descriptor resolution, Seed stability under changing `count`, Keyframes, distribution, easing curves, unit and color interpolation, Stagger and delay offsets, derived duration, nesting, Promise resolution semantics, `destroy()` during playback, reduced-motion rest frame, `renderer: 'auto'` selection, and `JSON.stringify` round-tripping.

Test fixtures live under `packages/core/src/testing/` and import only the public entry, so a test importing one still drives nothing but the public API. The first is `manual-driver.ts`, a Driver written from the public port alone (ticket 08). `src/testing/` is not a build entry and does not ship.

Prior art: `packages/core/src/utils/index.test.ts` — colocated `*.test.ts`, `describe`/`it`, imports the module's own entry.

Specific things worth pinning:
- Determinism: the same Seed and `t` produce byte-identical records, and a Seed produces the same values in a fresh process.
- Seed stability: Children 0..19 are unchanged when `count` goes 20 to 21.
- Purity: sampling at 0.5, then 0.1, then 0.5 gives the same result both times at 0.5.
- Pooling: successive `sample` calls at the same Element count allocate no new records — assert on record identity, which is the only externally visible consequence of the pool.
- Serialization: a Spec containing `rand` and `each` round-trips and reproduces an identical Instance.

Coverage target is 85% on `@motly/core`, per `CLAUDE.md`. Renderers are DOM code and are not the reason to chase that number with fake DOM tests.

### Seam 2 — the pixel boundary, in Playwright

The Renderers are the only code that cannot be verified headless, and `CLAUDE.md` forbids tests that need a DOM in Vitest. They are tested by `toHaveScreenshot()` with committed PNGs against pages in `apps/demos` — five canonical bursts, each with a fixed Seed, pinned to a specific frame through a manual Driver rather than left to run.

No hosted service (ADR-0003). Budget ~15–20 hrs for seeding, frame pinning, tolerance and CI flake control before the first assertion lands. There is no prior art in the repo; this harness is the prior art for everything after it.

Both Renderers run the same five Specs, so an SVG/Canvas divergence shows up as a diff.

### Performance

Benchmarks are not assertions in CI. Two numbers are measured and written down during the phase: the SVG/Canvas crossover that replaces the 200-Element `auto` threshold, and the frame cost at 500 SVG and 5,000 Canvas Elements against the §1.6 targets. The bundle-size budget is checked per entry point, after tree-shaking, not on the barrel.

## Out of Scope

- `@motly/gsap` and everything else in Phase 2. This phase ships nothing publicly.
- The Motion adapter, React components and `@motly/presets` (ADR-0007). Presets are a consumer this phase designs against, not one it builds.
- WebGL, OffscreenCanvas, worker rendering.
- Spring physics, and anything else that integrates step by step. Ruled out by `sample(t)` being pure (ADR-0009).
- A repeat count on an Instance.
- Mid-flight Renderer switching (ADR-0015).
- Hit-testing, layout reading and pointer-coordinate conversion.
- The docs site, `apps/docs`, and any public README work. `apps/demos` is internal-only in this phase.
- The visual editor and anything serialization exists *for*, beyond keeping the Spec serializable.

## Further Notes

- Invariant 6 says anything two adapters both need belongs in core, and this phase has one adapter to design against. ADR-0007 already flags it: review core's surface against Motion's `animate()` before 1.0, not now.
- `.scratch/phase-2/issues/01-confirm-gsap-registration-api.md` is open and does not block this phase. It should be resolved before Phase 2 starts, not before this one ends.
- The 200-Element `auto` threshold is the one number in the ADRs written as a placeholder. Leaving it unmeasured at the end of this phase means shipping a guess as a default.
- `product.md` §4 budgets 8 weeks. Two items inside it are the usual overruns: the Playwright harness, which is explicitly budgeted, and the easing work, which is not — an SVG path parser and a bezier solver are more than an afternoon.
