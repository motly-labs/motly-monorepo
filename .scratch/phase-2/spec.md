# Phase 2 — `@motly/gsap` and the first public release

Status: ready-for-agent

## Problem Statement

A developer who already builds motion with GSAP, and wants a procedural burst inside it, has no good option. GSAP animates elements that already exist, so a burst of twenty shapes means authoring twenty elements and twenty tweens by hand. mojs generates them, but it is unmaintained, has its own clock, and cannot sit in a GSAP timeline, be scrubbed by ScrollTrigger or be reverted by `useGSAP` when a React component unmounts.

`@motly/core` now generates bursts, is seedable, scrubbable and reduced-motion aware, but it is standalone and unpublished. A GSAP developer cannot reach it from `gsap.timeline()`, cannot install it from npm, and has no demo or README to learn it from. Nothing about motly is public.

## Solution

A GSAP plugin, `@motly/gsap`, published with `@motly/core` as v0.1.0. After `gsap.registerPlugin(Motly)`, a developer writes `gsap.effects.burst(button, { spec })` or `tl.burst(button, { spec }, '<')` and gets an ordinary GSAP tween: it sits in timelines, scrubs, reverses, repeats, stretches with `duration`, warps with `ease`, is driven by ScrollTrigger and is cleaned up by `gsap.context()` and `useGSAP`. The burst is drawn in an overlay the plugin owns, from the element's centre or from a point such as a click; it can be painted into a container instead. The developer describes the burst as a JSON Spec and never touches the DOM it draws.

The release ships an IIFE build that self-registers on a CodePen page, five CodePen demos, READMEs for both packages, a docs site with a Spec reference and live examples, and a launch whose result is measured four weeks later against a success signal set before launch. The launch posts wait for the docs site.

## User Stories

### Registering

1. As a GSAP developer, I want to register motly with `gsap.registerPlugin(Motly)`, so that it reads like every other GSAP plugin I use.
2. As a GSAP developer, I want registration to use the copy of GSAP I registered it with, so that a second copy of GSAP in my bundle cannot split the effects from my timelines.
3. As a CodePen user, I want a script tag that makes `Motly` a global and registers it when `gsap` is already on the page, so that a pen works with two script tags and no build step.
4. As a CodePen user, I want `Motly.rand` and `Motly.each` on the same global, so that I can write a Spec with randomness without a second script.
5. As a developer using a bundler, I want importing `@motly/gsap` to register nothing by itself, so that unused imports tree-shake away and nothing runs at import.
6. As a developer rendering on the server, I want importing and registering the plugin in Node to succeed, so that SSR does not crash on a page that uses bursts.
7. As a developer, I want `rand`, `each` and the easing curves importable from `@motly/gsap`, so that I install one package to use motly with GSAP.

### Calling the effects

8. As a GSAP developer, I want `gsap.effects.burst(target, { spec })`, so that I can fire a burst the way I fire any registered GSAP effect.
9. As a GSAP developer, I want `tl.burst(target, { spec }, position)` on every timeline, so that a burst is placed in a sequence with GSAP's own position parameter.
10. As a GSAP developer, I want `gsap.effects.shape` and `tl.shape` for a single Element, so that a ring or a single star is as easy as a burst.
11. As a GSAP developer, I want the effect to return an ordinary tween, so that `play`, `pause`, `reverse`, `seek`, `progress`, `timeScale`, `kill` and `revert` all work as I expect.
12. As a developer with a Spec exported from an editor, I want to pass it whole as `spec`, so that I never re-shape JSON to fit the plugin.
13. As a GSAP developer, I want every top-level key of `vars` to mean what it means in GSAP, so that `delay`, `ease`, `duration`, `repeat`, `yoyo`, `paused` and the callbacks behave as they do in every other tween.
14. As a GSAP developer, I want `spec.delay` and `spec.easing` to keep motly's meaning inside the Spec, so that a Spec behaves the same standalone and under GSAP.
15. As a GSAP developer, I want a top-level `delay` to hold back the whole burst, so that I can offset it like any tween.
16. As a GSAP developer, I want a top-level `duration` to stretch or squeeze the whole burst, so that I can fit it to a beat in my timeline without editing the Spec.
17. As a GSAP developer, I want the burst to run at its own pace when I give no `ease`, so that GSAP's default `power1.out` does not quietly warp a Spec designed with its own curves.
18. As a GSAP developer, I want a top-level `ease` to warp the burst's time when I give one, so that I can slow a burst into its end like any other tween.
19. As a GSAP developer, I want `repeat` and `yoyo` to work, so that a pulsing ring is one call.
20. As a GSAP developer, I want my `onStart`, `onUpdate`, `onComplete` and `onInterrupt` called exactly as GSAP calls them, so that my existing callback code works unchanged.
21. As a GSAP developer, I want `scrollTrigger` in `vars` to work, so that I can scrub a burst with scrolling.
22. As a GSAP developer, I want `vars` keys that make no sense for a burst (`keyframes`, `startAt`, `runBackwards`, `stagger`) to warn me and be ignored, so that a mistake is visible without breaking my page.
23. As a GSAP developer, I want that warning once per registration rather than on every click, so that my console stays readable.
24. As a TypeScript user, I want `gsap.effects.burst`, `gsap.effects.shape`, `tl.burst` and `tl.shape` typed with the Spec and the plugin's options, so that my editor autocompletes the Spec and rejects a wrong `kind`.
25. As a TypeScript user, I want the unsupported vars excluded from the type, so that I see the mistake before I run it.
26. As a JavaScript user, I want an invalid Spec to fail with core's validation message, so that I learn which field is wrong.

### Where the burst appears

27. As a GSAP developer, I want to pass an element and have the burst come from its centre, so that "burst from this button" is one argument.
28. As a GSAP developer, I want to pass a selector matching several elements and get one burst from each, so that every matching icon bursts at once.
29. As a GSAP developer, I want each element's burst to differ from its neighbours', so that a row of icons does not show the same burst copied.
30. As a developer handling a click, I want to pass `{ x: e.clientX, y: e.clientY }` and have the burst come from that point, so that the burst appears where the user clicked.
31. As a developer, I want the element's position read when the burst starts, not when I built the timeline, so that a burst placed late in a timeline still comes from where the element is by then.
32. As a developer, I want the burst drawn above my page without catching clicks, so that bursting never blocks the button it came from.
33. As a developer, I want to pass `container` to paint the burst inside a given element, so that a burst scrolls with its section or is clipped by its card.
34. As a developer scrubbing a burst with ScrollTrigger, I want container mode to keep the burst attached to the content as the page scrolls, so that the burst does not float free of what it belongs to.
35. As a developer, I want the plugin to choose SVG or canvas by the burst's size unless I say which, so that small bursts are inspectable and large ones stay fast.
36. As a developer whose selector matches nothing, I want a warning like GSAP's own "target not found" and a tween of the burst's length that draws nothing, so that the mistake is visible and the rest of my timeline keeps its timing.

### Determinism

37. As a developer, I want to pass `seed` and get the same burst every run, so that a design review sees exactly what I saw.
38. As a developer, I want a fresh random burst per call when I pass no `seed`, so that repeated clicks do not all look alike.
39. As a developer, I want the burst to stay the same across repeats, restarts and scrubbing within one tween, so that scrubbing back and forth never changes what is drawn.

### Cleanup

40. As a developer firing bursts on click, I want each burst's drawing removed when it ends, so that a page clicked a thousand times holds no leftover DOM.
41. As a developer scrubbing a timeline, I want a finished burst to reappear when I scrub back into it, so that scrubbing is reversible.
42. As a React developer using `useGSAP`, I want every burst created in it cleared when my component unmounts, so that bursts never outlive their component.
43. As a developer, I want `tween.kill()` mid-burst to clear the burst, so that particles are never left frozen on screen with no way for me to remove them.
44. As a developer, I want `tween.revert()`, `tl.revert()` and a context's `revert()` mid-burst to clear it, so that reverting returns the page to how it was before the burst.
45. As a developer, I want the README to tell me plainly that `tl.kill()` on a parent timeline leaves a mid-flight burst drawn, and what to call instead, so that I am not surprised by the one case the plugin cannot see.

### Reduced motion

46. As a viewer who prefers reduced motion, I want a burst to show its still Resting frame instead of moving, so that decorative motion does not affect me.
47. As a developer, I want a reduced-motion burst to keep its place and length in my timeline, so that everything sequenced after it starts at the same time for every viewer.
48. As a developer, I want the viewer's preference read each time a burst starts, so that changing the OS setting takes effect without a reload.
49. As a developer, I want `reducedMotion` in `vars` to force either behaviour, so that I can show both in a demo or a test.

### Learning and adopting

50. As a GSAP developer arriving from the forum, I want five CodePens that each show something only a GSAP plugin can do, so that I see the point in a minute.
51. As a developer, I want a README for `@motly/gsap` with a copy-paste install, a first burst and the cleanup rules, so that I can start without a docs site.
52. As a developer, I want a README for `@motly/core`, so that I can use motly standalone.
53. As a developer, I want both packages at v0.1.0 on npm with a readable first changelog entry, so that the release history starts clean.
54. As a mojs user, I want a question asked where I already am about what would make me move, so that the project learns whether I am an audience.
61. As a developer arriving from a launch post, I want a docs site that takes me from install to a first burst with either package, so that I can try motly without reading its source.
62. As a developer, I want every Spec field documented with a live example beside its code, so that I can see what a field does before I use it.
63. As a developer, I want an examples page with the five pens and small examples of one idea each, so that I can copy a working starting point.

### Maintaining

55. As the maintainer, I want the name, npm org, domain and trademark checked before anything is published, so that the name every early adopter learns is one I can keep.
56. As the maintainer, I want the npm publish gated on the Phase 1 browser check, so that the first public release is known to work in Safari, Chrome and Firefox.
57. As the maintainer, I want the success signal and what each outcome means written down before launch, so that the 4-week result decides the next phase instead of being argued after.
58. As the maintainer, I want the unpublished placeholder packages marked private, so that the release workflow cannot publish an empty `@motly/motion`.
59. As the maintainer, I want publishing to happen only through the release workflow, so that every published version has provenance.
60. As an agent implementing a ticket, I want the adapter's behaviour pinned by tests through GSAP's own public API, so that a refactor that breaks a GSAP user breaks a test.

## Implementation Decisions

Decisions come from the Phase 2 grilling, recorded question by question in the exploration notes beside this spec. ADR-0018 (amended) governs registration and drawing; ADR-0009, 0012, 0015 and 0016 apply unchanged.

### Registration (ADR-0018)

- `@motly/gsap` exports one object, `Motly`. It is a GSAP property plugin, and its `register(core)` hook calls `core.registerEffect()` for `burst` and `shape`, both with `extendTimeline: true`. It sets `headless: true`, so it registers in Node. Nothing else is registered: `swirl` is not an effect, because a Swirl is a Modifier with nothing to draw alone; it is reached through a Burst's `children`.
- The property plugin is internal. Its key works in any tween, undocumented and outside the API.
- `rand`, `each` and the curves are named exports. Only the script build's global `Motly` also carries them as properties, since a page with script tags has no imports. The `Motly` the package exports does not: spreading them into it would keep every curve in any bundle that registers the plugin, against "every export must be droppable" (ticket 09).
- `gsap` stays a peer dependency, `>=3.13.0`. `headless` exists from 3.13.0 at the latest.

### The effect call

- `gsap.effects.burst(targets, vars)`, `gsap.effects.shape(targets, vars)`, and `tl.burst` / `tl.shape` with GSAP's `position` as a third argument.
- **Targets** are Anchors or Origins. An element (or selector, or list) is an Anchor: the Origin is its centre. A plain `{ x, y }` is an Origin in viewport CSS pixels, as `clientX`/`clientY` give. With `container`, both are converted into the container's coordinates.
- **Vars** has one motly key holding the Spec and four binding keys; every other key is GSAP's tween vars, with GSAP's meaning:

  ```ts
  // Shape of the decision, not final names beyond `spec`.
  interface BurstVars extends TweenVarsWithoutUnsupported {
    spec: BurstSpec;             // ShapeSpec<K> for the shape effect
    seed?: number;
    container?: HTMLElement | string;
    renderer?: 'svg' | 'canvas' | 'auto'; // default 'auto'
    reducedMotion?: ReducedMotion;        // default 'user'
  }
  ```

- The vocabulary rule: top-level keys mean what GSAP means; motly's words appear only inside `spec`. So `delay` delays the whole tween and `spec.delay` offsets Children; `ease` warps the Playhead and `spec.easing` gives each property its Curve; the callbacks are GSAP's, called as GSAP calls them.
- `ease` is `'none'` unless given. `duration`, when given, is the tween's length and stretches time; otherwise the tween lasts the Instance's computed duration (ADR-0016).
- `keyframes`, `startAt`, `runBackwards` and `stagger` are excluded from the type and, at runtime, stripped with one `console.warn` per registration. The warned-once state lives in the `register()` closure, never at module level (Invariant 3).
- Targets that match nothing: one `console.warn`, and a tween of the Spec's duration that draws nothing. A `container` selector that matches nothing does the same (ticket 06).

### Instances, Seeds and the Driver

- One Instance per target, all driven by the one tween. The adapter creates them through core's public `createScope()` with its default rAF Driver: the adapter only seeks Instances, and that Driver draws a seek at once without starting a frame loop. An adapter Driver that only moved when seeked was removed after the 2026-09-28 review, as a copy of core's (Invariant 6).
- Seeds: with `seed` given, target `i` gets `seed + i`; without, one random Seed is drawn at the effect call and used the same way. Seeds are fixed for the tween's life, across repeats, restarts and scrubbing.
- The tween animates a private proxy object, never the targets. The property plugin's `render(ratio)` moves every Instance's Playhead to `ratio` × its duration. Because `ratio` already carries `ease`, `duration`, `repeat` and `yoyo`, none of them needs code of its own.

### Overlay and lifecycle

- Anchor and point mode paint into one overlay per tween: `position: fixed`, the size of the viewport, `pointer-events: none`, shared by the tween's Instances, with a Renderer chosen by `renderer`.
- Container mode paints into the given element under core's Renderer rules: it must have a size, and a static container is made relative while a burst is drawn in it. Its inline `position` is put back once the last adapter layer in it is released, so reverting returns the page to how it was (user story 44). `container` is an `HTMLElement`, not any `Element`: the layer is appended to it and its `style.position` may be set.
- The overlay mounts on the first draw strictly between the ends, and is released when the Playhead reaches 0 or the end, and on interrupt. A later draw between the ends mounts it again.
- The Anchor's position is read at each start from 0 moving forward, not per frame. A page scrolled mid-burst leaves an overlay burst where it started.
- Cleanup follows from where GSAP reaches the tween: revert of any kind renders the plugin at ratio 0, which releases; `kill()` mid-flight reaches `onInterrupt`, which the adapter chains before the user's own and uses to release. `tl.kill()` on a parent timeline reaches neither and leaves a mid-flight burst drawn; this is documented, not worked around.
- The user's `onUpdate` is left untouched; only `onInterrupt` is wrapped.

### Reduced motion (ADR-0012)

- Under reduced motion the tween keeps its full duration and every draw shows the Resting frame. The preference is read at each forward start from 0. `vars.reducedMotion` overrides it.
- A repeat is not a start: a burst with `repeat: -1` keeps the preference it started with until it is restarted or reverted, as core's Timeline decides once at its start. User story 48 holds from the next start.
- Core gains two public exports so the adapter uses no internals (Invariants 6 and 7): `isMotionReduced(setting)`, and the Resting frame's Playhead in seconds as a read-only property of Instance, named so it cannot be confused with the Spec's `restAt` progress. Both ship in core with a changeset.

### Types (Invariant 9)

- The adapter augments GSAP's loosely typed effects map and timeline interfaces so the four entry points take the typed vars above. `burst` takes a `BurstSpec`, `shape` a `ShapeSpec<K>`.
- `BurstVars`, `ShapeVars`, `MotlyVars` and `RendererName` are exported, for vars built apart from the call (ticket 08).

### Builds and packaging

- `@motly/gsap` builds ESM, CJS and an IIFE. The IIFE bundles core, assigns `Motly` to the global, and registers itself when a global `gsap` exists, as GSAP's own script-tag plugins do. The ESM and CJS builds have no side effects. No IIFE for core in this phase.
- `@motly/motion`, `@motly/react` and `@motly/presets` are marked private.
- The fifteen pending Phase 1 changesets are replaced by one "Initial release" changeset for core; `@motly/gsap` gets its own. Both publish as 0.1.0.
- Core's `VERSION` export is removed (ticket 12): it was a hard-coded `'0.0.0'` the version bump would not change, and nothing used it.
- Publishing only through the release workflow, after the prerequisites its header lists: placeholders private, Actions allowed to open pull requests.
- The workflow publishes by npm trusted publishing (OIDC), with no stored token and no `registry-url` on setup-node. Each package names this repo and `release.yml` as its trusted publisher, with the "npm publish" permission. Under OIDC pnpm attaches provenance without `--provenance`, which `changeset publish` cannot pass; the workflow fails a run whose published version lacks it. The first publish used a token, since a trusted publisher needs the package to exist (ticket 14).

### Release gates

- The name stays `motly`. Before publishing: the `@motly` npm org claimed, `motlyjs.dev` registered (`motly.dev` belongs to someone else), a trademark search done.
- Phase 1 ticket 16 (the check by hand in Safari, Chrome and Firefox) gates the npm publish, not the start of this phase. 0.1.0 was published before that check ran (ticket 14); it stays open on Phase 1 ticket 16.

### Demos and docs

- Five CodePens: Heart burst, Confetti, Firework, Sparkle click, Ripple. Each shows one thing core alone does not: timeline sequencing, scrubbing with ScrollTrigger, bursting at a click point, placement with `tl.burst`'s position, reversing. Their sources live in `apps/demos` and build against the workspace; they are pasted into CodePen at launch. The ScrollTrigger pen uses container mode; Sparkle click uses point targets.
- READMEs for `@motly/core` and `@motly/gsap`: install, a first burst, the vocabulary rule, the cleanup rules including the `tl.kill()` case, reduced motion.
- A docs site in `apps/docs`, on Astro Starlight (ADR-0002), private like every app. It is deployed from `main` to GitHub Pages by a workflow, until `motlyjs.dev` is registered (ticket 13). It ships no npm release: it is live before the launch posts, and v0.1.0 is already on npm.
- Its pages: getting started for `@motly/gsap` and for `@motly/core`, grown from the READMEs; a Spec reference covering every field of every Element kind, Emitter and Modifier, and the values they take (Keyframes, Descriptors, colors, units, Curves), and time (delay, Stagger, Timeline, Playback, reduced motion); an examples page with the five pens and small examples of one idea each.
- Every live example is one source file that the page both shows and runs, so the code on the page is the code that ran. Examples import the workspace packages, so the site documents what `main` builds; a feature can appear on the site before its release reaches npm.

### Launch and the signal

- Launch tasks are `ready-for-human` tickets with a checklist each: GSAP forum post, Twitter and Bluesky thread, `awesome-gsap` and `awesome-web-animation` submissions, the mojs Discussions question.
- The GSAP forum post, the thread and the `awesome-web-animation` submission link to the docs site, and wait until it is live.
- The signal, measured four weeks after the GSAP forum post, the first launch post: 100+ GitHub stars, 500+ weekly downloads of `@motly/gsap`, 3+ issues opened by someone other than the author. All three met: Phase 3 goes ahead. One or two: a written review decides. None: post-v1 work stops. The result is recorded in this spec's ticket, not a `DECISIONS.md`.

## Testing Decisions

### What a good test looks like here

A test drives the package through the public API a user would call and asserts on what a user would see. For the adapter that is GSAP's own API — `gsap.registerPlugin`, `gsap.effects.*`, `tl.*`, and the returned tween's `progress`, `kill` and `revert`, and `gsap.context().revert()` — with assertions on the painted SVG. A test never imports an adapter internal, never inspects the proxy or the plugin, and never asserts on how the overlay is built beyond whether it is in the document and what it shows.

Time is moved by `tween.progress(p)` or `tl.progress(p)` on a paused tween, never by the ticker, so there are no timers and no waiting.

### Seam 1, extended to the adapter

One seam, the one Phase 1 already uses, reached through each package's public entry:

- **Core additions** — `isMotionReduced` and the Resting frame's Playhead — are tested through core's public entry with the manual Driver, as the rest of core is. They count toward core's 85% coverage.
- **`@motly/gsap`** is tested through GSAP's public API, with GSAP registered headless, in Vitest's `happy-dom` environment, added as a dev dependency of `@motly/gsap` only. The oracle is core's public `sample(t)` for the same Spec, Seed and Origin: what the adapter paints at a given progress must match what core samples at the matching Playhead. Tests pin `renderer: 'svg'` or small Element counts, since happy-dom has no canvas.

This does not conflict with the rule that the engine is testable without a browser: the adapter is the package that owns DOM, so a DOM in its tests means the code is in the right package. The coverage target does not apply to adapters.

Specific behaviour worth pinning:

- Registration in Node succeeds and adds `gsap.effects.burst`, `gsap.effects.shape`, `tl.burst` and `tl.shape`.
- At progress `p`, the painted burst matches core's sample at `p` × duration; with `duration` given, the mapping stretches; with `ease` given, it warps; with neither, it is linear.
- The overlay is absent at progress 0 and 1, present between, and present again after scrubbing back in.
- Each row of the probe table in the exploration notes, as a test: `tween.kill()`, `tween.revert()`, `tl.revert()` and `gsap.context().revert()` mid-flight each leave nothing drawn; `tl.kill()` mid-flight leaves the burst drawn (pinning the documented gap, so a GSAP change that closes it is noticed).
- Several Anchors give distinct bursts; the same `seed` gives the same bursts on a second run; a burst is identical before and after a repeat.
- A point target and an Anchor produce Origins where expected; container mode paints inside the container.
- Reduced motion (forced through `vars.reducedMotion`) paints the Resting frame at every progress and keeps the tween's duration.
- An empty selector warns once and returns a tween of the Spec's duration.
- Unsupported vars warn once per registration and are ignored; a second registration warns again.
- The user's `onUpdate` and `onInterrupt` are called as GSAP calls them.

Prior art: core's colocated `*.test.ts` files and its manual Driver fixture for the core additions; the GSAP probe script recorded in the exploration notes for driving kill and revert headless.

### Seam 2 is unchanged

Playwright snapshots stay on the canonical bursts in `apps/demos`. The five pens are not snapshotted; they are checked by hand at launch in Safari, Chrome and Firefox.

## Out of Scope

- A custom domain for the docs site before `motlyjs.dev` is registered.
- An API reference generated from the type declarations.
- A `swirl` effect.
- GSAP's `stagger` across targets; staggered bursts are a loop or timeline positions away.
- A new Seed per repeat (GSAP's `repeatRefresh`).
- Cleaning up after `tl.kill()` on a parent timeline, and any ticker watchdog for it.
- Following a moving or scrolling Anchor every frame.
- A core API for a burst's extent, and overlays sized to it.
- The property plugin as a public API.
- An IIFE build of `@motly/core`.
- Accepting a Renderer instance in `vars`.
- Playwright snapshots of the pens.
- `@motly/motion`, `@motly/react`, `@motly/presets` (ADR-0007), and the review of core's API against Motion's `animate()`.
- Hacker News, Product Hunt and CSS-Tricks, which `product.md` saves for 1.0.

## Further Notes

- Deviations from `product.md` §4 Phase 2, recorded here as the plan asks: no `swirl` effect; the docs site after v0.1.0 rather than with it; no `DECISIONS.md`; the effect takes `targets` and a nested `spec` rather than `burst(origin, vars)`; a property plugin is used internally.
- ADR-0018 was amended in place during the grilling, before any code relied on it, to record the proxy target and the property-plugin drawing path.
- The glossary gained **Anchor** and **GSAP effect**. "Effect" alone stays avoided for motly concepts.
- Invariant 6 still has one adapter to test against. The two core additions are shaped by what GSAP needed; a Motion adapter should reuse them rather than grow its own.
- `product.md` budgets four weeks. The likely overruns are the overlay and cleanup edge cases, which the probe mapped but did not build, and the release prerequisites (name checks, npm org, workflow switch), which are small but serial and partly outside the repo.
- The success-signal thresholds are the plan's own; they were not re-derived from comparable launches.
- 2026-09-30: the docs site moved ahead of the launch posts, and the signal's four weeks now count from the GSAP forum post instead of from publish. Q7 had the site follow as 0.1.x because "a site is not needed to judge the 4-week signal". By the time the launch was ready, the READMEs documented a first burst and little else of the Spec. A developer who cannot learn the Spec does not star, install or file issues, so a missed signal would have measured the docs, not the demand. 0.1.0 reached npm on 2026-09-28 with no launch post, so counting from publish would also have spent part of the window on no launch at all.
