# Phase 2 exploration: `@motly/gsap` and the first public release

Status: resolved

Spec: `spec.md` beside this file.

Grilling session on Phase 2 (`product.md` §4, ADR-0007, ADR-0018). Rounds 1 to 3, the recheck and the re-drill are answered and
the frontier is empty; waiting on the user to confirm shared understanding before `/to-spec`. Each question carries the recommended answer and, once given, the user's
**Answer**. Settled answers move into the Phase 2 spec, and into an ADR only when all three ADR
tests pass.

## Facts found

- Phase 1 is resolved except ticket 16, whose check by hand in Safari, Chrome and Firefox is still
  open: Safari was not checked, Firefox is not installed.
- `@motly/core` and `@motly/gsap` return 404 on npm. The unscoped `motly` belongs to someone else.
  Whether the `@motly` org is claimed could not be told from outside.
- `product.md` §1.4: "Don't ship anything public until this is locked." The name `motly` has had
  no trademark or domain check.
- `CONTEXT.md` lists "effect" under _Avoid_ for Instance, Modifier and Preset, while GSAP's
  mechanism is `registerEffect`.
- `SwirlSpec` is a Modifier: it wraps one Child and draws nothing, so it cannot play on its own.
- `DECISIONS.md`, which Phase 2's exit criterion writes into, does not exist.
- `packages/gsap/src/index.ts` only re-exports `VERSION`. The packages ship ESM and CJS, no IIFE.
- `apps/docs` is a placeholder with a README and a `package.json`.
- `release.yml` is manual (`workflow_dispatch`) until the first publish. Its header lists what must
  happen before switching it to push: mark the placeholder packages private, add `registry-url`
  to setup-node, allow Actions to create pull requests.
- 15 changesets are pending in `.changeset/`.
- `motly.dev` is registered (GoDaddy nameservers); whether by the author is unknown.
- GSAP tween vars and motly Specs share names with different meanings: `duration`, `delay`,
  `stagger`. A tween's default `ease` is `power1.out`, which would warp the Playhead unless the
  adapter sets `ease: 'none'`.
- `SVGRenderer` takes an `<svg>` the caller owns; `Renderer` is `draw(owner, list)` and
  `release(owner)`. An overlay the adapter owns means the adapter creates that `<svg>` or canvas.
- The Resting frame's Playhead lives on `InstanceTarget`, which core does not export. Q4's answer
  needs the adapter to reach it through the public API (Invariant 7): read `restAt` from the Spec
  it holds, or core exports something. For the spec to settle.
- `CONTEXT.md` lists "anchor" under Origin's _Avoid_, but Q2 introduces an element distinct from
  the Origin point.

## Round 1

### Q1: Name before first publish

After v0.1.0 the name is fixed: npm scope, `gsap.registerPlugin(Motly)`, CodePen URLs, forum
posts and the docs domain all carry it.

- (a) Keep `motly`: claim the `@motly` npm org and a domain now, run a trademark search.
- (b) Rename before Phase 2 starts: a repo-wide rename first.
- (c) Publish under a neutral scope and rename by 1.0: every early adopter pays a migration.

Recommended: (a) if the search and domain come back clean, otherwise (b) before any adapter code.
Never (c). This gates the publish, not the adapter work.

**Answer (Q1):** keep `motly`. Claim the `@motly` npm org and a domain, run a trademark search; rename before adapter code if either fails.

### Q2: What `targets` means

ADR-0018 left it open. GSAP passes the first argument of `gsap.effects.burst(targets, vars)`
through `toArray()`.

- (a) Anchor: the element the burst comes from. The adapter derives the Origin from its bounding
  box and paints into an overlay it owns (fixed SVG or canvas).
- (b) Container: the element painted into. The Renderer mounts inside it; the Origin comes in
  `vars` as coordinates.
- (c) Anchor by default, with an optional `vars.container` to paint into a given element.

Recommended: (c). Anchor matches GSAP's "animate this element" model and the click-burst use case;
the container covers bursts that must scroll with an element or be clipped in a card.

**Answer (Q2):** anchor by default, optional `vars.container`.

### Q3: Which GSAP effects, and what to call them

`product.md` promises `gsap.effects.burst()` and `gsap.effects.swirl()`, but a Swirl has nothing to
show on its own. Separately, "effect" is an avoided word in the glossary.

Recommended: register `burst` and `shape`; Swirl is reached only through a Burst's `children`. Add
"GSAP effect" to `CONTEXT.md` as GSAP's term for a named function registered with `registerEffect`,
never used for a motly concept. Record the deviation from `product.md` in the spec, not an ADR:
it is cheap to reverse.

**Answer (Q3):** `burst` and `shape`. "GSAP effect" added to `CONTEXT.md`. Deviation from `product.md` recorded in the Phase 2 spec.

### Q4: Reduced motion inside a GSAP timeline

Standalone, reduced motion draws the Resting frame and resolves `play()` at once (ADR-0012). Inside
`tl.burst(...)` the tween takes up time on the host's timeline.

- (a) Keep the tween's full duration and draw the Resting frame throughout.
- (b) Make the tween zero-length, so later steps come earlier.
- (c) Defer to the host's `gsap.matchMedia()` and do nothing special.

Recommended: (a). The host's sequencing stays the same whatever the viewer's setting, and
Invariant 10 holds. A `reducedMotion` override in `vars` stays available, as on `InstanceBinding`.

**Answer (Q4):** full duration, Resting frame throughout.

### Q5: How CodePen demos load the library

Many GSAP users on CodePen load plugins with `<script>` tags that set a global.

- (a) ESM only, imported from esm.sh or jsDelivr `+esm`.
- (b) Also ship an IIFE build of `@motly/gsap`, with core bundled in, exposing `window.Motly`.

Recommended: (b). One more tsdown output, and it matches how the audience already loads GSAP
plugins. Core's IIFE can wait.

**Answer (Q5):** add the IIFE build, `window.Motly`.

### Q6: Does ticket 16 gate the release?

Recommended: it gates the npm publish, not the start of Phase 2. Close it in week 1.

**Answer (Q6):** gates the npm publish only.

### Q7: Docs site or READMEs

Phase 2 lists a full Starlight site. `apps/docs` is empty and the phase is timeboxed at 4 weeks.

- (a) Full site, as planned.
- (b) v0.1.0 ships with READMEs plus the 5 CodePens; the site follows as 0.1.x.
- (c) Minimal site: getting-started and the GSAP guide, reference generated from doc comments.

Recommended: (b). The launch posts are driven by the pens, and a site is not needed to judge the
4-week signal. A recorded deviation from `product.md`.

**Answer (Q7):** READMEs plus the 5 pens; the site follows as 0.1.x.

### Q8: The success signal and what failure means

`product.md`: at 4 weeks, 100+ stars, 500+ weekly downloads on `@motly/gsap`, 3+ issues from
people other than the author, recorded in `DECISIONS.md`. ADR-0007: Phases 3–5 go ahead only if
Phase 2 lands.

Recommended: keep the three numbers and define the outcomes before launch. All three met: go to
Phase 3. One or two: a written review. None: stop post-v1 work. Record the result in the Phase 2
spec or ticket instead of creating `DECISIONS.md`.

**Answer (Q8):** tiered outcome, recorded in the Phase 2 spec or ticket; no `DECISIONS.md`.

### Q9: Is the launch work in the spec?

Forum post, Twitter/Bluesky thread, awesome-list submissions, the mojs Discussions question.

Recommended: yes, as `ready-for-human` tickets with a checklist each, since the exit criterion
depends on them. The spec itself stays about engineering.

## Round 2

Answered.

**Answer (Q9):** `ready-for-human` tickets, one per launch task, with a checklist.

### R1: A name for the element a burst comes from

Q2 makes a DOM element the thing the Origin is read from. The glossary rules out "anchor" and
"target" for the Origin, but this is an element, not a point.

Recommended: **Anchor**, "the element an Instance's Origin is read from, at its centre". Remove
"anchor" from Origin's _Avoid_ list; keep "target" avoided, as GSAP uses it loosely.

**Answer (R1):** Anchor. Added to `CONTEXT.md`; "anchor" dropped from Origin's _Avoid_.

### R2: When the Anchor is measured

- (a) Once, when the GSAP effect is called.
- (b) Each time the tween starts from 0 moving forward.
- (c) Every frame, so the burst follows a moving element.

Recommended: (b). A timeline may reach the tween long after it was built, and the element may have
moved or scrolled by then; following every frame is a layout read per frame for a rare need.

**Answer (R2):** each forward start.

### R3: What stays on screen at the ends

The tween may be fire-and-forget (a click burst, dropped by GSAP after it completes) or live in a
timeline that is scrubbed back and forth.

- (a) Mount the overlay on the first draw between the ends; release it whenever the Playhead
  reaches 0 or the duration, and on `gsap.context()` revert. A later draw mounts it again.
- (b) Keep the last frame until the tween is killed or its context reverted.
- (c) (a) by default, with an option to keep the last frame.

Recommended: (a). No leak for fire-and-forget bursts, scrubbing still works, and bursts end faded
anyway. An effect whose last frame should stay is the case (c) would add, and nothing asks for it
yet.

**Answer (R3):** release at either end and on context revert; remount on a later draw. With P1
the drawing runs through a property plugin, so reverts reach it at ratio 0; kills reach it
through `onInterrupt`.

### R4: The shape of `vars`

`duration`, `delay` and `stagger` mean different things to GSAP and to a Spec.

- (a) Nested: `{ spec, seed?, container?, renderer?, reducedMotion?, ...tweenVars }`. The Spec is
  passed whole, as exported from an editor.
- (b) Flat: Spec fields and binding fields at the top, GSAP's tween vars through the returned tween
  only.

Recommended: (a). No name clashes, the Spec stays JSON as Invariant 4 wants, and the tween vars
GSAP users expect (`onComplete`, `repeat`, `yoyo`, `paused`) work unchanged. The adapter forces
`ease: 'none'` unless one is given, and `duration` is always the Instance's.

**Answer (R4):** nested `spec`. Top-level `duration` is revised by V2.

### R5: Several targets

`gsap.effects.burst('.btn', ...)` may match several elements.

- (a) One tween; one Instance per element, Seeds `seed + index`; no `stagger` in v0.1.0.
- (b) A timeline of one tween per element, with GSAP's `stagger`.

Recommended: (a). ADR-0018 says one tween; staggered bursts are a loop or timeline positions away.

**Answer (R5):** one tween, no stagger, Seeds `seed + index`. Confirmed by V3.

### R6: The five CodePens

`product.md` §5.3 names Heart burst, Confetti, Firework, Sparkle click, Ripple. The canonical five
in `apps/demos` are Confetti, Bloom, Ripple, Swirl, Fireworks.

Recommended: the `product.md` five, each showing one GSAP thing core alone does not (timeline
sequencing, ScrollTrigger scrub, click, `tl.burst` position, reverse). Pen sources live in the repo
under `apps/demos/pens/` so they build against the workspace, and are pasted into CodePen at launch.

**Answer (R6):** the `product.md` five, sources in `apps/demos/pens/`. The Sparkle click pen
needs point targets (N2).

### R7: How the adapter is tested

The handoff fixes two seams and says not to add a third without asking.

Recommended: unit tests in Node with GSAP registered `headless`, a recording Renderer, and a
seeked tween, asserting the Draw list at tween times: seam 1 through the adapter. No Playwright
snapshots of the pens; they are checked by hand at launch. Coverage target does not apply
(`CLAUDE.md`).

**Answer (R7):** Node unit tests only. Revised by N8: happy-dom for the DOM part.

### R8: Release notes for 0.1.0

15 Phase 1 changesets are pending, each a line in core's first CHANGELOG.

Recommended: replace them with one "Initial release" changeset per package, since nobody has
used the earlier states. Mark `motion`, `react` and `presets` private before the first run, as
`release.yml` already requires.

**Answer (R8):** one "Initial release" changeset per package; placeholders marked private.

### R9: `motly.dev`

Registered, owner unknown. Is it yours? If not, which domain does Q1's claim target?

**Answer (R9):** not the author's; see R9a.

## Round 3

### R9a: Does a taken `motly.dev` trigger Q1's rename?

The unscoped npm `motly` and `motly.dev` are both someone else's. RDAP shows no registration for
`motlyjs.dev`, `getmotly.dev`, `usemotly.dev`, `motlyjs.com` or `motly.io` (`.io` RDAP coverage is
unreliable; confirm at a registrar).

**Answer:** no. Keep `motly`, claim `motlyjs.dev`. The `@motly` scope is what users type. The
trademark search still stands.

### R10: Does `@motly/gsap` re-export core's Spec helpers?

**Answer:** yes. `rand`, `each` and the curves are importable from `@motly/gsap` and reachable as
`window.Motly.rand` in the IIFE, where `Motly` is the plugin object itself (N5). Core stays a
dependency.

### R11: Default Renderer when `vars.renderer` is omitted

**Answer:** `auto` (ADR-0015). Correction to how it was asked: core has no default Renderer,
`InstanceBinding.renderer` is required. The adapter chooses one because it owns the overlay.

## Left for the spec

Implementation questions with no decision for the user, to settle while writing the spec:

- The names of the core exports N3 adds (`isMotionReduced`, the Resting frame's Playhead on
  Instance) and the core changeset for them.
- The private property-plugin key (P1) and how the proxy carries the Instances.
- How an empty-targets tween learns the Spec's duration without a Renderer (N9).
- In container mode, the Origin in the container's coordinates.
- `headless: true` on the plugin for Node tests and SSR imports, and the lowest `gsap` peer version
  that supports it and `registerEffect`'s `extendTimeline`.
- Interface augmentation typing `gsap.effects.burst`, `gsap.effects.shape`, `tl.burst` and
  `tl.shape` with the nested `vars` (Invariant 9).
- `ease: 'none'` unless given; a given `duration` stretches time (V2).

## Recheck: GSAP vocabulary and cleanup

Read from gsap 3.15.0's `gsap-core.js`. `@gsap/react` is not installed; `useGSAP` is a
`gsap.context()` reverted on unmount, so the Context source is what it does.

### Facts

- Every `vars` key outside GSAP's reserved list (`gsap-core.js:3824`: callbacks, `duration`,
  `ease`, `delay`, `repeat`, `yoyo`, `paused`, `stagger`, `keyframes`, `startAt`, `scrollTrigger`,
  …) is animated as a property of the tween's targets.
- A Context records each tween created while it is current. `revert()` renders each at
  `totalTime(-0.01)` with `suppressEvents: true`, so no `onUpdate`, then `kill()`s it.
- `kill()` calls `onInterrupt` when the tween's progress is below 1 (`:991`). So `onInterrupt` is
  the one hook both kill and revert reach mid-flight.
- `tl.kill()` interrupts the timeline only, not its children: a Child tween hears nothing.
- `gsap.core.context(obj)` puts `obj` in the current Context, whose revert then calls
  `obj.revert()`. It covers revert, not kill.

### The vocabulary rule

Top-level `vars` keys always mean what GSAP means; motly words appear only inside `spec`.

- `delay`: top level delays the whole tween; `spec.delay` offsets each Child.
- `ease` warps the Playhead (`'none'` unless given); `spec.easing` gives each property its Curve.
- `onStart`, `onUpdate`, `onComplete`, `onInterrupt`: GSAP's, called as GSAP calls them (no `t`
  argument, `this` is the tween), not `InstanceBinding`'s. The adapter runs its own `onUpdate`
  and `onInterrupt` first, then the user's.
- `destroy()` does not exist for a GSAP user, who never holds an Instance. The verbs are GSAP's
  `kill` and `revert`; `gsap.context()` and `useGSAP` play the part a Scope plays standalone.

### V1: The tween's target

**Answer:** a private proxy object. The Anchor is read, never animated, and stray keys are
harmless. Cost: `gsap.killTweensOf(anchor)` and `getTweensOf(anchor)` do not see the burst.

### V2: Top-level `duration`

**Answer:** stretches time. The tween lasts `duration`; the Playhead is progress × the Instance's
duration, a Driver mapping time as a Timeline does. Without it, the tween lasts the Instance's
duration.

### V3: Top-level `stagger`

**Answer:** keep R5: dropped with a warning (V7). Staggered bursts are a loop or timeline
positions away.

### V4: What `kill()` mid-flight does to what is drawn

**Answer:** kill and revert both release the overlay, through `onInterrupt`. This departs from
GSAP's freeze-on-kill on purpose: the overlay is the adapter's, and a user could never remove a
frozen burst.

### V5: `tl.kill()` on a parent timeline

**Answer:** accept and document; no ticker watchdog. Corrected by the re-drill: `tl.revert()` was
listed as a cleanup and does not reach a child's callbacks. With P1 it does clean up; `tl.kill()`
remains the one gap.

### V6: The Seed across repeats, restarts and scrubbing

**Answer:** fixed for the tween's life. With `seed` omitted, one random Seed is drawn at the
effect call. GSAP's `repeatRefresh` could later mean a new Seed per repeat; not in v0.1.0.

### V7: `keyframes`, `startAt`, `runBackwards`, `stagger`

**Answer:** excluded from the `vars` type (Invariant 9); at runtime, one `console.warn` and
stripped before the tween is built. "Once" is per registration, held in the `register()` closure:
a module-level flag would break Invariant 3.

## Re-drill: validating every answer

Each answer above checked against core's source, the ADRs, gsap 3.15.0 and 3.13.0, and a probe run
in Node (`gsap.registerPlugin` headless, a property plugin plus `onUpdate` and `onInterrupt` on one
tween, then each of `tween.kill()`, `tween.revert()`, `tl.kill()`, `tl.revert()`, `ctx.revert()`
mid-flight).

### Held

- `registerEffect`, `extendTimeline`, `tl.burst(targets, vars, position)` (`gsap-core.js:4200`).
- `headless` exists in gsap 3.13.0 and 3.15.0; the `>=3.13.0` peer range holds.
- The 15 pending core changesets are all `minor`: core goes 0.0.0 → 0.1.0. `@motly/gsap` needs its
  own.
- Seeds `seed + index` (R5): core hashes Seeds (`rng.ts` `mix`), so neighbouring Seeds give
  unrelated bursts.
- GSAP types `effects` and the timeline index loosely; augmentation is possible.
- `onInterrupt` is reached by `tween.kill()`, `tween.revert()` and a context's revert.
- Core validates Specs at runtime, so `gsap.effects.burst(el, { spec: { kind: 'circle' } })` fails
  there.
- ScrollTrigger in 3.15.0 has no fallback to the tween's targets for `trigger`, so the proxy (V1)
  costs nothing there.

### Probe results

| Mid-flight call | Plugin `render` | `onUpdate` | `onInterrupt` |
| --- | --- | --- | --- |
| `tween.kill()` | no | no | yes |
| `tween.revert()` | ratio 0 | no | yes |
| `tl.kill()` | no | no | no |
| `tl.revert()` | ratio 0 | no | no |
| `ctx.revert()` | ratio 0 | at 0 | yes |

### P1: `tl.revert()` left a burst drawn

**Answer:** draw through an internal property plugin on the proxy. Its `render(ratio)` sees every
render, suppressed ones included, so R3's release at 0 covers `tl.revert()`; `ease` and a stretched
`duration` apply through `ratio` with no extra code, and the user's `onUpdate` is left alone.
`onInterrupt` still covers `kill()`. The plugin's key works undocumented in any tween. ADR-0018
amended in place (N10).

### N1: Overlay geometry

Renderers clip at their container, `AutoRenderer` needs a sized container, and core has no extent
API: the "sized to the Instance's extent" note was not buildable.

**Answer:** one `position: fixed`, viewport-sized, `pointer-events: none` overlay per tween, shared
by its Instances, mounted and released per R3. The Origin is the Anchor's viewport centre at each
forward start (R2 holds). A page scrolled mid-burst leaves the burst in place; scroll-bound bursts,
as in the ScrollTrigger pen, use `container`.

### N2: Bursts at a point

**Answer:** a plain `{ x, y }` in `targets` is an Origin in viewport CSS pixels, as from `clientX`
and `clientY`. Targets are Anchors or Origins.

### N3: Reduced motion through the public API

Core exports neither `isMotionReduced` nor the Resting frame's Playhead (`InstanceTarget.rest`).

**Answer:** extend core's public API: export `isMotionReduced`, put the Resting frame's Playhead on
Instance. Invariants 6 and 7. Needs a core changeset.

### N5: The IIFE global

**Answer:** `window.Motly` is the plugin object, carrying `rand`, `each` and the curves as
properties; the same object is the ESM `Motly` export, and the helpers are also named exports.

### N6: Self-registration

**Answer:** the IIFE registers itself when `window.gsap` exists, as GSAP's own script-tag plugins
do. The ESM build never does (`sideEffects: false`, Invariant 3).

### N8: Testing the DOM part

**Answer:** `happy-dom` as a dev dependency of `@motly/gsap`: the Draw-list path runs in plain Node,
the overlay, Anchor and point path under happy-dom, chosen per test file. Still seam 1.

### N9: Targets that match nothing

**Answer:** a `console.warn`, as GSAP warns for a missing target, and a tween of the Spec's duration
that draws nothing, so timeline positions do not shift.

### N10: Recording the contradictions with ADR-0018

**Answer:** ADR-0018 amended in place: it was a day old with no code on it. It now records the
proxy target and the property-plugin drawing path, with drawing from `onUpdate` and tweening the
targets as rejected options. V2 and the targets shape stay in the spec.

## Deviations from `product.md` to record in the spec

- `swirl` is not a GSAP effect (Q3).
- No docs site in v0.1.0 (Q7).
- No `DECISIONS.md`; the signal outcome goes in the Phase 2 spec or ticket (Q8).
- The `targets` shape differs from the `gsap.effects.burst(origin, vars)` first assumed (Q2, R4).

No new ADR: ADR-0018 was amended (N10) and now records V1 and P1. Every other answer is cheap to
reverse under 0.x. V4 is the closest remaining call: surprising to a GSAP user and breaking if
changed after 0.1.0, so the spec states it plainly and the README says it once. Trigger for an
ADR: a `vars`, targets or cleanup change needed after 0.1.0 that would break users.
