# Review - `product.md`

> **Reviewed:** 2026-09-20
> **Target:** `product.md` (1500 lines) - Product Plan, Procedural Motion Graphics Library
> **Also read:** `mojs-exploration.md` (companion doc, cross-checked for conflicts)
> **Scope:** validity of the problem statement, internal consistency, technical feasibility, gaps.

---

## Verdict

**Problem statement holds up.** The gap is real: nothing modern occupies the space between a canned-animation player (Lottie) and a creative-coding framework (Pixi/Three). The "procedural motion graphics" framing is defensible and the five-primitive model is coherent.

**The plan attached to it does not hold up.** Scope contradicts the document's own reasoning, and a stack of internal numbers conflict with each other. The single biggest issue is structural, not factual - see below.

---

## 1. The biggest conflict - scope vs. the document's own premise

`product.md:88` rejects the mojs rewrite on effort grounds:

> "A full four-repo TypeScript rewrite is a 6-12 month solo effort."... "Effort-to-reward math on the naive rewrite is bad."

The plan then commits to, in six months solo part-time:

- tween engine + easing library + seeded RNG + draw-list layer
- SVG renderer **and** Canvas 2D renderer
- four adapters (GSAP, Motion, React, standalone)
- ~10 React components + shadcn-compatible registry
- `@motly/presets` package
- docs site + playground app + demos site
- 15 killer demos
- 85% core test coverage + Playwright visual regression
- five separate launch campaigns

**This is more scope than the option it rejected.** The rejection reasoning was never applied to the replacement.

`mojs-exploration.md:211` is more explicit, and is directly contradicted:

> "Timebox to 3 months for v1-alpha. If you're not shipping usable alpha by month 3, cut scope again or stop."

`product.md` ships its first public artifact at week 12 and 1.0 at week 24. The exploration doc's Option A ("just the burst library, ships in 2-3 months") was silently upgraded into a four-surface platform with no recorded rationale for the change.

**Fix:** either add a section stating why Option A was abandoned, or cut Phases 3-5 out of v1.

---

## 2. Internal conflicts

Each of these is two statements inside `product.md` that cannot both be true.

| # | Where | Conflict |
| --- | --- | --- |
| 2.1 | `§E.1` vs `§E.7` | rough.js listed as "~9k stars" in E.1, "~20k" in the E.7 table. Same document. (~20k is correct.) |
| 2.2 | `§5.5` vs `§5.3` + `Appendix C` | §5.5 metrics section says **"Ignore: total impressions."** Phase 4 success signal gates on "10k+ impressions"; kill criteria gate on "no GIF crossed 5k impressions." The metric is simultaneously ignored and load-bearing. |
| 2.3 | `§1.5` vs `§1.8.2#4` | Renderer is "chosen per-instance" (manual) in §1.5; "Canvas renderer becomes default above a child-count threshold" (automatic) in §1.8.2. Which one ships? |
| 2.4 | `§1.5` vs `§2.1` | v1 explicitly excludes a Vue adapter ("Won't have in v1"). The repo tree ships `examples/vue-nuxt/`. |
| 2.5 | `§1.5` vs `§1.8.4` | §1.5: "Every primitive works in every adapter (no adapter-only features in v1)." §1.8.4: `AnimatePresence`-style exit animations are "table stakes for the Phase 4 React components." That is a React-adapter-only feature. |
| 2.6 | `§1.8.3` vs `§2.1` / Phase 0 Day 3 | §1.8.3: "Ship a `@motly/utils` from day 1." The package appears in neither the repo tree nor the Phase 0 scaffold checklist. |
| 2.7 | `§2.6.1` vs `§2.6.3` | The first argument for using an org is namespace alignment: "`@motly/core` should map to `github.com/motly/core`." The chosen structure is a single monorepo, so `github.com/motly/core` never exists. Argument #1 is refuted by the structure the same section recommends. |
| 2.8 | `§2.6.2`, Pattern C | Self-refuting inside its own block: "Commercial services built by separate companies (Vercel builds on Next.js, but Next.js is owned by Vercel - **this is actually Pattern A**)." The example given for Pattern C is an example of Pattern A. |
| 2.9 | `§3.5` vs `Appendix A` | Budget assumes 15 hrs/week. The Appendix A cadence sums to 12-13 (2+2+2+4+2.5). 25 weeks × 13 ≈ **325 hrs, not 375**. |
| 2.10 | `Appendix A` vs `§3.5` | "Take one full week off every 6-8 weeks. Non-negotiable." Over 25 weeks that is 3-4 additional weeks, absent from the 25-week total. Real calendar ≈ **29 weeks**. |
| 2.11 | `Appendix A` vs `§4` Phase 1 | The weekly cadence allocates ~4-5 hrs/week to docs/demos/content. Phase 1 runs 8 weeks and "ships nothing publicly." ~40 hrs are budgeted to content that does not exist yet. |
| 2.12 | `§1.7` vs `§5.3` | Editor SaaS gate: **10k weekly downloads on `@motly/core`**. v1.0 30-day success target: **5k weekly downloads combined across all packages**. The gate sits at ~2× the plan's own definition of success - the SaaS can never trigger inside this plan's horizon. |
| 2.13 | `§1.8.1#4` | "Keeping randomness inside the property definition means the whole animation is a single serializable data structure" - the stated justification. It then recommends the **function form** `rand(-180, 180)` as the default ("TypeScript-friendly (recommended default)"). A function does not serialize. Only the string form delivers the benefit being used to justify the design. |
| 2.14 | `§1.2` vs `§1.5` / Phase 1 | "NOT building: a tweening engine to compete with GSAP." Phase 1 builds a property tween engine, an easing library, and a Timeline with play/pause/seek/reverse. You are building a tweening engine - only the marketing differs. The build cost is unchanged by the framing. |
| 2.15 | `§2.5` vs `§3.6` | §2.5 recommends registering the trademark. The money budget has no trademark line (EU word mark ≈ €850+) and no `.com` domain, despite Phase 0 Day 1 instructing you to check and claim `.com`. |

---

## 3. Technical problems

### 3.1 The GSAP wedge rests on an API GSAP does not have - **blocking**

`§1.1` and Phase 2 promise the adapter "Exposes `gsap.burst()`, `gsap.swirl()`".

`gsap.registerPlugin()` registers **property plugins** - keys consumed inside a tween's vars object. It does not add top-level methods to the `gsap` namespace. Named top-level effects come from `gsap.registerEffect()`, which produces `gsap.effects.burst()`.

The entire Phase 2 strategy - the wedge the whole distribution plan depends on - needs re-specifying against the real plugin API before any code is written.

### 3.2 Clock ownership is never decided - **blocking for Phase 1**

`§1.8.3` requires a single central ticker owned by core ("Perf, coordination, single source of truth"). But inside `gsap.timeline()`, GSAP must own the clock. Under Motion, Motion does. Standalone, core does.

Three possible ticker owners, no arbitration rule anywhere in the document. This is a core architecture decision that determines the shape of `setProgress()` and the adapter boundary. Retrofitting it is exactly the mistake §1.8.1#6 warns about.

### 3.3 WAAPI is in the problem statement but not in the product

The problem statement and `§0.7` both cite "no WAAPI backend" as a mojs deficiency, and name "WAAPI-backed performance" as the 2026 market baseline. The v1 renderers are SVG and Canvas 2D. There is no WAAPI anywhere in `§1.5`.

`§1.8.4` papers over this: "Your renderer split (SVG vs. Canvas per instance) is the direct equivalent" of Motion's hybrid engine. It is not equivalent - WAAPI moves animation off the main thread; a renderer split does not. Either drop the WAAPI complaint from the problem framing, or put it in the roadmap explicitly.

### 3.4 Perf targets fight the architecture

`§1.6` requires 60fps with 5,000 Canvas shapes. `§2.2` has core emit "a normalized draw list per frame."

5,000 shapes × 60fps = 300,000 object allocations per second crossing the port boundary. That is a GC problem, not a rendering problem. Hitting the stated target needs a pooled or typed-array draw list. The architecture section does not mention either.

### 3.5 15 kB core is optimistic as stated

Contents required by `§1.5`: tween engine, color parsing, unit-aware string parsing, bezier easing, spring-lite easing, SVG-path easing parser, seeded RNG, draw list, SVG renderer, Canvas renderer, Timeline, five primitives, reduced-motion detection, context/scope.

mojs core is ~50 kB min for less than this. The number is reachable only **per entry point after tree-shaking**. State it that way, or the first bundle report reads as a broken promise.

### 3.6 Reduced-motion has no defined fallback behavior

`§1.6` makes reduced-motion default-on, which is the right call. The document never specifies what a `Burst` actually **renders** under reduced motion - nothing, a static end state, or a single fade.

For a library whose entire output is decorative motion, "default on" without a fallback spec means the Phase 4 viral effects gallery silently blanks for a meaningful share of visitors. This needs a spec line before Phase 1.

### 3.7 `§1.8.1#1` comparison code is wrong

```ts
animate('.el', { radius: 50 }, { from: 20 });   // not Motion's API
```

Motion's shape is `animate(el, { radius: [20, 50] })`. Separately, `radius` is not an animatable property on a DOM element - the example is confused about its own subject.

This snippet is the centerpiece of the delta-syntax differentiator argument. It should be correct.

### 3.8 Phase 1 test scope is not achievable in 120 hours

85% core coverage **plus** Playwright visual regression for five canonical bursts, alongside the engine and two renderers. Visual-regression setup alone for an animation library (deterministic seeding, frame pinning, tolerance tuning, CI flake control) is ~15-20 hrs before a single assertion is written.

---

## 4. Analytical gaps

### 4.1 party.js is missing from the competitive analysis - **most substantive hole**

party.js appears exactly once, buried in `§E.1` as a study reference. It is modern, TypeScript-first, MIT-licensed, and particle/burst-shaped - the closest living competitor to the flagship primitive.

It is absent from the problem statement, absent from "Why this problem persists in 2026," and absent from the `§D.4` competitor landscape.

The claim *"There is no serious, modern JavaScript library for procedural motion graphics on the web"* has to survive party.js explicitly. The document never attempts it. If it cannot be defended, the positioning needs narrowing (e.g. to composition + curve-as-data, which party.js genuinely lacks).

### 4.2 The 33k mo.js users are a weaker audience than claimed

Two problems with audience #4:

1. **npm weekly downloads ≠ developers.** Heavy CI and transitive-dependency inflation. "33k developers still installing `@mojs/core` every week" overstates the human count by an unknown but large factor.
2. **`mojs-exploration.md`'s own finding is that mojs is stable, not broken.** A stable pinned dependency generates zero migration pressure. Nothing in the plan validates that these users want to move.

Compounding it: the migration guide lands in Phase 5 (weeks 19-24). The audience ranked most acute is addressed last.

### 4.3 "Why now" is 17 months stale

GSAP going free and Anime.js v4 are both April 2025. The document is dated September 2026. Framing 17-month-old events as "the right moment, not two years ago" is a stretch.

The genuinely current argument is the third one - the copy-paste-component channel reaching critical mass. Lead with that.

### 4.4 Name collision, flagged by the document's own appendix

`motly` collides with Apache Spark, Adobe Spark/Express, and Spark Mail. And `§D.9` links **CodePen's own "Spark" newsletter** (`https://codepen.io/motly/`) - a collision sitting inside the document's reference list, in the single most important distribution channel the plan names.

`§1.4` already marks the name as a placeholder, but `§2.5` recommends trademark registration. "Spark" is not registrable in software. Worth noting alongside the §1.4 requirements.

### 4.5 No IP hygiene note

The document has a full legal section (§2.5, §2.6) but never addresses:

- Porting from mojs (MIT - attribution required if code is adapted; ideas are free).
- "Read every line" of canvas-confetti (§E.5 Tier 1) - clean-room vs. derivation.

One sentence in §2.5 covers it. For a plan this legally thorough elsewhere, the omission stands out.

### 4.6 Unbudgeted apps

`apps/playground` - described in §2.1 as "live editor + share URL" - is scaffolded in Phase 0 Day 3 and then never appears in any phase deliverable or hour line. Same for `apps/demos` beyond Phase 1's "internal-only demo page that renders 5 things."

Either budget them or drop them from the Phase 0 scaffold.

---

## 5. Gates that do not gate

### 5.1 Phase 2 exit criterion is unusable

> "**Exit criterion:** at least one non-Mo human has installed and used it. Even one."

The same phase's success signal is 500+ weekly downloads and 100+ stars. The gate sits roughly three orders of magnitude below the signal - Phase 3 proceeds regardless of outcome. A gate that always passes is not a gate.

### 5.2 Kill criteria only fire on decline, never on flat failure

Kill threshold: under 200 weekly downloads after Phase 4 (~month 4.5).
Phase 2 success bar: 500+ weekly downloads at week 13.

Because the kill threshold is *below* an earlier success bar, it only triggers if the project actively declines. A launch that lands at 150 and stays there for three months reads as "not yet killed" the whole way.

---

## 6. What is solid - keep as-is

- **`§1.8` API synthesis.** The strongest section in the document. Specific, anchored to real source links, and the steal / don't-steal split is genuinely well-argued. `§1.8.1#2` (children as first-class composition) is correctly identified as the actual differentiator - no competitor has it.
- **`§1.2` NOT-building list.** Real scope discipline, names the right lanes, and each exclusion is correctly attributed to an incumbent that already owns it.
- **`§2.6` ownership structure.** Accurate to how Supabase, Cal.com, PostHog, and Plausible are actually structured. "Never AGPL a library - AGPL is a SaaS-defense weapon, not a library license" is correct and well put.
- **Appendices D and E.** High density, mostly correct links, genuinely usable as a study guide. `§E.7` ("one-primitive-done-well" proof cases) is the right evidence for the positioning.
- **Appendix C existing at all.** Most plans never write kill criteria. The thresholds need fixing (§5.2 above); the instinct is right.

---

## 7. Top five fixes, ranked

1. **Cut v1 to Phases 0-2.** Core + GSAP adapter + demos, shipped at month 3 - matching `mojs-exploration.md`'s own timebox. Phases 3-5 become post-v1, contingent on Phase 2 traction. This resolves conflict §1 and makes the hour budget honest.
2. **Re-spec the GSAP integration** against `registerEffect()` / `registerPlugin()` reality (§3.1), and decide who owns the ticker in each adapter (§3.2). Both are Phase 1 blockers.
3. **Add party.js to `§D.4` and defend the problem statement against it** (§4.1). If it cannot be defended, narrow the positioning to composition + curve-as-data.
4. **Reconcile the numbers:** hours (13 vs 15/wk), breaks (+3-4 weeks), rough.js stars, the impressions metric, and the SaaS gate vs. the success target.
5. **Spec reduced-motion fallback rendering** (§3.6). Blocks Phase 4 otherwise.

---

## Appendix - minor factual notes

Low-stakes, fix when convenient:

- `§0.2` / `mojs-exploration.md:16` - anime.js "~65k stars." Verify; the figure looks inflated (~50k is closer).
- `§2.6.4` - Sentry adopted the Fair Source License in **November 2023**, not "post-2024."
- `§E.4` - Rive's runtime is linked as Apache 2.0. Verify per-repo; the WASM runtime has historically been MIT.
- `§D.1` - the Flip source link points at a directory (`/tree/master/src`) while `§E.2` gives the correct file path (`/blob/master/src/Flip.js`). Use the E.2 form in both.
- `§E.2` - the Motion source path `packages/framer-motion/src/animation/animate/` is likely stale after the Motion repo restructure. Re-check before Phase 3.
- Phase 0 Day 1 - `npm access ls-packages @<name>` does not check scope availability. Use `npm view @<name>/core` or the registry web UI.
- `§0.5` - mojs player downloads given as "25 weekly"; `mojs-exploration.md:17` gives "97/month" (≈22/week). Harmless, but pick one unit.
