# Product Plan — Procedural Motion Graphics Library

> **Working codename:** `motly` (placeholder — see §1.4)
> **One-liner:** Procedural motion graphics for the web. Compose bursts, swirls, and shape animations with a declarative API — After Effects thinking, in code you'd write for React.
> **Prepared for:** Mo
> **Date:** September 2026
> **Reviewed:** 2026-09-20 — corrections applied inline; full findings in `product-review.md`. One open decision remains, flagged at the top of §4.

---

## Problem statement

### The core problem

**There is no serious, modern JavaScript library for *composable* procedural motion graphics on the web.**

Every well-maintained animation library in 2026 — GSAP, Motion, anime.js — is built to animate *things that already exist*: DOM elements, React components, existing SVG nodes. They are excellent at tweening properties on shapes the developer or designer has already drawn.

None of them handles the other half of motion design: **procedurally generating the shapes themselves and animating their parameters as a composition** — the way After Effects, Cavalry, or a game engine's particle system thinks about motion. If you want a radial burst of 40 generated polygons, each with its own tweened radius, color, angle, and easing offset, none of the incumbents help you. You end up either hand-rolling it in Canvas, reaching for `canvas-confetti` (toy-level, no composition), or wrestling with `tsParticles` (huge, config-driven, not composable).

The one library that *did* solve this — **mo.js** — had the right ideas ten years ago (delta-syntax, children composition, curve-as-data, procedural shape generation) but stopped moving in 2019. It has no TypeScript support, no reduced-motion API, no tree-shakeable ESM, no framework bindings, and a governance model where two caretakers do dependency bumps on free time. The ~33k weekly `@mojs/core` npm downloads sit on abandoned infrastructure with no upgrade path. **Discount that number before planning against it:** weekly downloads are inflated by CI and transitive installs, and `mojs-exploration.md` found the library *stable*, not broken — a stable pinned dependency creates no migration pressure. Treat this as a latent audience to validate (cheaply, in Phase 2), not a queue of waiting customers.

### Who feels this problem

Ranked by acuteness of the pain:

1. **Creative developers** doing agency, campaign, and awwwards-adjacent work — they need expressive burst/particle/shape effects on brand microsites and interactive campaigns, and the current answer is "build it from scratch in Canvas every time."
2. **Motion designers moving into code** — the After Effects → Lottie → "wanting real runtime control" trajectory. Lottie plays canned exports; nothing bridges them from AE thinking to parametric, state-driven web animation.
3. **Product engineers adding delight moments** — the heart-burst on the like button, the confetti on checkout, the sparkle on achievement unlock. Currently they install a single-purpose micro-library per effect and end up with five separate animation dependencies.
4. **mo.js's remaining users** — on an unmaintained library with nowhere to migrate that preserves the mental model. Ranked here on *actionability*, not on download count: the audience is unvalidated and under no pressure to move.
5. **Design-engineering teams at product companies** who want a coherent motion language across their app — currently either build in-house or accept a patchwork of GSAP + Framer Motion + confetti + custom Canvas.

### Why this problem persists in 2026

Three structural reasons:

- **The incumbents are locked into the wrong mental model.** GSAP and Motion are optimized for UI animation (buttons, layouts, page transitions) — that's where the market rewards them. Adding procedural motion graphics would fracture their positioning and confuse their audience. They *won't* build it.
- **The last library that had the model (mo.js) got stuck in maintenance.** Original creator stepped back in 2019, no succession plan, no TypeScript rewrite, no willingness from the caretakers to expand scope. It cannot recover from where it is without a full architectural rewrite that nobody is funded to do.
- **The alternatives are wrong-shape.** Lottie plays canned files (no runtime composition). Rive is editor-locked (proprietary format, vendor risk). Theatre.js is a devtool for keyframing existing scenes (not a primitives library). PixiJS and Three.js are creative-coding frameworks (too low-level; you rebuild the abstraction every time). tsParticles is config-driven and monolithic. **party.js is the closest living counter-example** — modern, TypeScript-first, MIT, actively maintained — but it is a *particle emitter*, not a composition system: no children-template instantiation, no curve-as-data, no `setProgress()` scrubbing, no timeline. It owns the confetti slot well and stops there. There is a gap between "canned animation player" and "creative-coding framework" that nothing modern occupies.

### Why now

Three market shifts make this a reasonable moment. Be honest about the timing: two of them landed in April 2025, seventeen months before this document, so they are *context*, not urgency. The third is the live one.

- **April 2025: GSAP went 100% free** after the Webflow acquisition. The paid-license moat that used to protect a solo animation library from having to compete on features is gone. Positioning is now the only defense — and positioning as a *different problem space* (procedural motion graphics, not UI animation) is the strongest available.
- **April 2025: Anime.js v4 shipped its full rewrite** as ESM + TypeScript. This is the new baseline for what "modern animation library" means. Anything shipped in 2026 that doesn't clear this bar is dead on arrival.
- **(The actual "why now".) The copy-paste-component wave (shadcn, Aceternity, Magic UI, React Bits) hit critical mass in 2025.** There is now an established distribution channel — the registry-driven, `npx add`-installed component pattern — for exactly the kind of pre-composed motion effects a procedural library ships as presets. Two years ago this channel didn't exist.

### What good looks like

A developer opens their terminal and:

```bash
npm install @motly/core @motly/gsap
```

Inside 30 seconds they have a GSAP-composed timeline with a procedurally generated burst effect. Same developer, six months later, wants a pre-built "confetti on checkout success" React component:

```bash
npx shadcn add @motly/confetti
```

Both flows share the same underlying engine, the same mental model, and the same reduced-motion accessibility guarantees. The library respects their existing choice of animation ecosystem (GSAP, Motion, or standalone) rather than demanding they migrate to a new one. A designer on the team can, later, open a visual editor at `editor.motly.dev`, tweak the burst's timing curve visually, and export it back as code the developer can paste in.

**None of this is possible today with any single library.** That is the gap this project exists to fill.

### The problem in one sentence

> **Web developers who want to compose procedural motion graphics — bursts, swirls, generated shapes with declarative parametric animation — have no modern, TypeScript-native, framework-agnostic library that fits alongside their existing GSAP or Motion setup and scales from a single copy-paste component to a full custom effect.**

Everything below is the plan to be that library.

---

## 0. How this plan came together

This section is the origin story — how we got from the initial question to this executable plan. Future-you will want it. So will any collaborator. So will you six months in when you're second-guessing a decision and want to remember why it was made this way.

### 0.1 The starting question

The exploration began with a straightforward pitch: **"mo.js has great ideas but has been in maintenance mode for years. Should I rewrite it in TypeScript, finish the pending features, and modernize all four repos (core, player, timeline editor, curve editor)?"**

The initial instinct was to treat this as a portfolio-scale technical project — port a beloved-but-dormant library to modern TS, ship it, become the maintainer. Clean scope, clear win.

### 0.2 What the honest research turned up

Documented in the companion `mojs-exploration.md`. The short version:

- **mojs is not dead but not moving.** The original creator (Oleg Solomka / LegoMushroom) stepped back in 2019; two caretaker maintainers (Xavier Foucrier, Sandstedt) keep dependencies patched on free time. No sponsors, no roadmap.
- **The competitive landscape has moved on.** GSAP went 100% free in April 2025 after the Webflow acquisition — the paid-license moat is gone. Motion (formerly Framer Motion) rebranded and expanded beyond React, benchmarks 2.5–6× faster than GSAP on modern value-type animations, and is TypeScript-first. Anime.js v4 shipped a full rewrite in 2024–2025, ~65k stars vs mojs's ~18.7k (**verify both before quoting publicly** — the anime.js figure looks inflated).
- **A full four-repo TypeScript rewrite is a 6–12 month solo effort.** Even after all that, you'd still be missing ScrollTrigger-equivalent, WebGL rendering, WAAPI backend, spring physics, and framework bindings — the things that would actually make anyone pick it over the incumbents in 2026.
- **Effort-to-reward math on the naive rewrite is bad.** It optimizes for the wrong success metric ("compete with GSAP downloads") in a market where three well-funded TypeScript-native competitors already own the mindshare.

### 0.3 The pivot — position differently, don't compete head-on

The next round of thinking was about whether the game was really zero-sum, and whether there was a gap the incumbents don't serve. There is:

- **No first-class particle/burst system in GSAP, Motion, or anime.js.** They animate properties on things that already exist. None of them *procedurally generates* the shapes you're animating.
- **No procedural shape generation.** mojs's `Shape` and `Burst` make the geometry and animate its parameters. Different mental model — motion-graphics thinking (After Effects) vs UI-animation thinking (CSS transitions).
- **No visual editor for the ecosystem.** GSAP has GSDevTools (basic). Motion has nothing. anime.js has nothing. The mojs-curve-editor / mojs-timeline-editor concept is genuinely underserved.
- **Delta-syntax and children-composition** — mojs's declarative `{ radius: { 20: 50 }, children: { ... } }` shape doesn't exist in any competitor. It reads like a spec, not a script.

**Positioning landed here:** *"Procedural motion graphics for the web. Compose bursts, swirls, and shape animations with a declarative API — After Effects thinking, in code you'd write for React."* Not competing with GSAP for the UI-animation slot; occupying the empty gap between Lottie (canned player) and Three.js (creative-coding framework).

### 0.4 The compound — distribution strategy alongside positioning

Standalone positioning solves *why anyone should care*. It doesn't solve *how they discover it*. The next layer was distribution:

- **Ship as a GSAP plugin first.** GSAP has formal `registerPlugin()` and `registerEffect()` APIs and an active plugin ecosystem (see Phase 2 — they do different things, and the one we need is `registerEffect()`). Piggyback on their install base instead of fighting it. Wedge, not competitor.
- **Then Motion adapter.** Cheap to add once the core exists; covers the other half of the modern animation market.
- **Then React copy-paste components.** Ride the shadcn / Aceternity / Magic UI wave. Get on screens virally.
- **Standalone last, once the ecosystem knows the name.** By that phase, the "procedural motion graphics" framing lands with an audience that already uses your primitives, not from a cold start.

The plugin framing and the After Effects framing turned out to be the same product with two front doors. Same core engine, four distribution surfaces (GSAP plugin, Motion plugin, React components, standalone) — hexagonal architecture in the OSS-library shape you already use at NN.

### 0.5 Scope decisions that closed the design space

Several sub-questions came up along the way; each got a deliberate answer that shaped the final plan:

- **anime.js adapter?** No — anime.js v4 has no formal plugin API. A dedicated package would do nothing a compatibility docs page couldn't do better. Documented, not built.
- **All four mojs repos?** No — rewrite core only. Player has ~22 weekly downloads, curve-editor ~5 (`mojs-exploration.md` quotes the same figures monthly: 97 and 21). Deprecate them. The visual editor gets rebuilt later as a separate SaaS if `@motly/core` clears 10k weekly downloads.
- **Personal profile or GitHub org?** Org, from day 1. Multi-package products belong to their own namespace. Migration later is painful; setup now is 5 minutes.
- **OSS + SaaS legal structure?** Pattern A (single GitHub org, MIT libraries public, SaaS repo private and proprietary). Matches Supabase, Cal.com, PostHog, Plausible. Migrate to Pattern B (two orgs) only if the SaaS clears meaningful revenue.
- **API shape?** Steal delta-syntax + children-composition + curve-as-data from mojs; steal Promises + `context()` + central ticker + `utils` from GSAP; steal TypeScript-first + hybrid engine + reduced-motion + `AnimatePresence` from Motion. Full synthesis in §1.8.

### 0.6 What this document is

Everything below is the executable plan that came out of the above. It answers:

- **§1** — what to build, down to the API contract (§1.8).
- **§2** — how to structure it (monorepo, hexagonal, org, licensing, OSS/SaaS split).
- **§3** — what you need (skills, tools, time budget, money budget).
- **§4** — when to do what (six phases; Phase 0 broken down day-by-day).
- **§5** — how to release each phase (channels, cadence, launch scripts).
- **Appendices A–E** — cadence discipline, decision log format, kill criteria, external references, per-feature inspiration library.

The companion document `mojs-exploration.md` is the honest assessment that ruled out the naive rewrite. This one is the plan that replaced it.

### 0.7 One-paragraph elevator pitch

> There is a gap in the modern web animation ecosystem: no serious library handles *procedural motion graphics* — burst effects, particle systems, generated shapes with declarative composition — the way After Effects thinks about motion. GSAP, Motion, and anime.js all animate existing DOM; none of them generate it. mo.js had the right ideas ten years ago but stopped moving in 2019, leaves TypeScript users unserved, and has been passed by a market that now expects tree-shakeable ESM, a real performance story, and framework-native ergonomics. **`motly`** rebuilds those ideas — delta-syntax, children composition, curve-as-data, procedural shape generation — as a modern TypeScript-first library with a hexagonal core and four distribution surfaces: a GSAP plugin, a Motion adapter, a React copy-paste-components package, and a standalone library. Six-month solo build, phased releases starting with the GSAP plugin as the wedge, standalone framing as the destination, and a visual editor SaaS as the eventual commercial extension.

That's the whole thing in a paragraph. Everything below is the detail.

---

## 1. Product / Plugin / SaaS — idea & requirements

### 1.1 What we are building

A **single core motion-graphics engine** with **four distribution surfaces**:

| Surface | Package | Audience | Distribution |
|---|---|---|---|
| GSAP plugin | `@motly/gsap` | GSAP users (largest install base) | GSAP forum, GreenSock ecosystem |
| Motion adapter | `@motly/motion` | Motion (ex-Framer Motion) users | Motion docs, React ecosystem |
| React components | `@motly/react` | Copy-paste-component crowd | shadcn-style registry, Twitter/X |
| Standalone library | `@motly/core` | Creative devs, motion designers, agencies | Docs site, CodePen, awwwards |

All four are **the same engine, different adapters**. The engine is where the work lives; the adapters are 200–500 lines each.

### 1.2 What we are NOT building

Hard scope discipline. If it's on this list, we don't build it — even if it feels close.

- ❌ A *general-purpose* tweening engine competing with GSAP's surface (`.to()`, `.from()`, arbitrary DOM/CSS targets). Be honest with yourself: Phase 1 does build a tween engine — bounded to our own primitives' properties. The saving is in surface area and edge cases, not in the core work.
- ❌ A scroll-linked animation system (that's ScrollTrigger's job).
- ❌ Layout / FLIP animations (Motion does this).
- ❌ A page-transition router.
- ❌ A generic UI-animation library (Motion / GSAP already own that lane).
- ❌ A game engine or full creative-coding framework (Pixi / Three own that lane).
- ❌ A player GUI in production runtime (nobody wants this — that's what devtools are for).
- ❌ A canned-animation player (that's Lottie).
- ❌ Character animation / rigging (that's Rive).

### 1.3 What we ARE building — the primitives

The engine ships **five composable primitives**. Everything the library does is a composition of these.

1. **`Shape`** — a procedurally-generated shape (circle, polygon, star, cross, zigzag, custom path). Every visual property is tweenable (radius, stroke, fill, opacity, angle, scale).
2. **`Burst`** — a radial explosion of N children (each child is a `Shape` or nested `Burst`). Distribute by angle, radius, stagger, easing. This is the flagship primitive.
3. **`Swirl`** — motion along a sinusoidal / spiral / custom path. Wraps any child.
4. **`Stagger`** — timing distribution across N children with easing curves (not just linear delay).
5. **`Timeline`** — sequence and compose the above. Minimal API — enough to compose primitives, not enough to compete with `gsap.timeline()`.

**Everything else is a preset** — `HeartBurst`, `Confetti`, `Sparkle`, `Firework`, `RippleClick` are just parameterized `Burst`+`Shape` combinations. Presets are what people install for; primitives are what devs compose with.

### 1.4 Naming

Codename `motly` for now. Requirements for the real name:

- Reads well as `gsap.burst()` and `<Burst />` and `motly.timeline()`.
- Not derivative of mojs (don't call it `mojs-next` — burn the name, start fresh).
- Speaks motion-graphics vocabulary (`motly`, `flux`, `emit`, `motif`, `plume`, `kinet`, `pulse`, `flare`).
- npm availability check (all four packages under the same scope).
- Trademark viability. **`motly` fails this** — Apache Spark, Adobe Spark/Express, Spark Mail, and CodePen's own "Spark" newsletter (§D.9), which sits inside the single most important distribution channel in this plan. Codename only; do not ship it.
- Domain availability (.dev preferred).

**Decision to make in week 1.** Don't ship anything public until this is locked.

### 1.5 Functional requirements (v1)

**Must have:**
- Strict TypeScript, ESM-first, fully tree-shakeable.
- SVG renderer (parity with mojs) + Canvas 2D renderer (new). Explicit per-instance choice, auto-defaulting to Canvas above a child-count threshold (§1.8.2 #4).
- `prefers-reduced-motion` honored by default, with escape hatch. **"Honored" means: render the animation's final resting state once, statically — not nothing.** A burst resolving to zero opacity renders nothing; one resolving to a visible shape renders that shape. Spec this per primitive in Phase 1 — left undefined, it silently blanks the Phase 4 effects gallery for a meaningful share of visitors.
- Promise-based completion (`await burst.play()`), plus event callbacks.
- `.destroy()` that actually cleans up DOM + listeners (mojs's #144).
- SSR-safe: importable in Next.js/Remix without crashing; no-ops during SSR.
- Zero runtime dependencies in `@motly/core`.
- Every primitive works in every adapter. Adapter-idiomatic *wrappers* may add surface (React exit animations, §1.8.4) — but no primitive is adapter-exclusive.

**Should have:**
- Deterministic seeded randomness (`seed: 42` reproduces the exact same burst).
- Timeline that composes primitives (play, pause, seek, reverse).
- Preset library (~10 ready-to-use effects) shipped separately as `@motly/presets`.

**Won't have in v1 (roadmap for later):**
- WebGL renderer (v2).
- OffscreenCanvas / worker rendering (v2).
- Visual editor (separate product — see §1.7).
- Spring physics (Motion does this well; not our niche).
- Vue / Svelte adapters (post-v1, based on demand).

### 1.6 Non-functional requirements

- **Bundle size:** `@motly/core` under 15 kB min+gzip **per realistic entry point after tree-shaking** (e.g. `Burst` + `Shape` + one renderer) — not for the full barrel import. Adapters under 3 kB each. For scale: mojs core is ~50 kB min for a smaller feature set. The budget is only reachable because renderers and easings are independently shakeable.
- **Performance:** 60fps with 500 animated SVG shapes; 60fps with 5,000 Canvas shapes.
- **Browser support:** Evergreen only. No IE, no legacy Safari heroics. Modern JS ecosystem is post-IE.
- **Accessibility:** Reduced-motion is default-on, not opt-in.
- **Docs:** Every public API has a runnable example inline. Docs site is the marketing site.
- **Test coverage:** Core engine ≥ 85%, adapters ≥ 70%.

### 1.7 SaaS extension (optional, later)

A separate product, not part of v1: **a visual editor** (curve editor + timeline scrubber) that outputs code for GSAP, Motion, or `@motly/core`. This is the mojs-curve-editor / mojs-timeline-editor idea, done modern, as its own web app.

Business model options: free OSS with sponsor tier, or freemium SaaS (~€9/mo pro for team libraries and export presets). Decide after v1 traction data.

**Structural note:** the SaaS lives as a private, proprietary-licensed repo inside the same GitHub org as the OSS packages (Pattern A in §2.6). Its **embeddable JS runtime** (`@motly/editor-runtime`) stays MIT — that package is a library, not the product. This split is deliberate and matches how Supabase, PostHog, Cal.com, and Plausible are structured. Full reasoning, license options (proprietary vs. AGPL vs. BSL vs. FSL), and NL-specific legal-entity guidance are in §2.6.

**Do not start this until `@motly/core` has 10k+ weekly npm downloads.** It's a product; it needs an audience to sell to.

Note the distance, deliberately: §5.3's 30-day post-v1 success signal is 5k weekly downloads *combined across all packages*. This gate sits at roughly twice the plan's own definition of success — which makes the editor a year-two decision, not a Phase 6 one. Don't let it drift onto the v1 roadmap.

### 1.8 API design synthesis — what to steal from mojs, GSAP, and Motion

This section is the concrete API blueprint. Before writing a line of `@motly/core` (Phase 1), read this whole section. It answers "what does my API actually look like?" — the question you'll otherwise waste weeks re-deciding while coding. Each idea below is anchored in a specific real-library reference so future-you can go read the source when a design decision comes up.

#### 1.8.1 Seven things mojs got right — steal these

**1. Delta-syntax for property definitions.**
```ts
// mojs — declarative, single object, from→to inline
new Shape({ radius: { 20: 50 }, fill: { '#f00': '#0ff' } });

// GSAP — requires fromTo(), and the element must already exist
gsap.fromTo('circle', { attr: { r: 20 } }, { attr: { r: 50 } });

// Motion — same, both endpoints in an array
animate('circle', { r: [20, 50] });
```
The mojs form reads like a spec, not a script. This is the core of the "After Effects thinking" mental model. **Steal it. Make it your primary API.** Support GSAP-style `.fromTo()` as an alternative for compatibility, but the mojs shape is your differentiator.
*Reference:* https://github.com/mojs/mojs/blob/master/src/tween/tween.babel.js

**2. Children as first-class composition.**
```ts
new Burst({
  count: 20,
  radius: { 0: 100 },
  children: {                       // define once, applied to all N
    shape: 'polygon',
    radius: { 20: 0 },
    fill: ['cyan', 'yellow', 'deeppink'],
    angle: { 0: rand(-180, 180) }
  }
});
```
Neither GSAP nor Motion has anything like `children:` where you define a template once and it instantiates N children with per-child randomization. GSAP staggers across *existing* DOM elements; Motion does the same. mojs *generates* the children as part of the animation definition — fundamentally different, and much better for procedural motion graphics. **This is arguably mojs's single best idea.** Combined with delta-syntax, it's the whole procedural positioning.
*Reference:* https://github.com/mojs/mojs/blob/master/src/components/burst.babel.js

**3. Array-based value distribution.**
```ts
fill: ['cyan', 'yellow', 'deeppink']  // 20 children get these 3 colors, cycled
```
Subtle but powerful: an array in a property slot means "distribute across children." GSAP requires an explicit `gsap.utils.wrap(['cyan','yellow','deeppink'])`; mojs infers it. Less magic than it sounds — just an array check at construction. **Steal it.**
*Reference:* https://mojs.github.io/api/burst/

**4. Randomness as an inline expression.**
```ts
angle: rand(-180, 180)          // returns a tagged RandomSpec, NOT a raw number
angle: 'rand(-180, 180)'        // string form, for hand-written JSON
```
Keeping randomness inside the property definition means the whole animation *can be* a single serializable data structure — which matters *enormously* for the visual editor SaaS (§1.7). **This only holds if `rand()` returns a tagged descriptor (`{ __spark: 'rand', min, max }`) rather than evaluating to a number at call time.** A plain helper that returns a number is not serializable and silently breaks the editor story — the exact thing this idea is being justified by. Both forms must round-trip through `JSON.stringify`. GSAP's `gsap.utils.random()` evaluates eagerly and lives outside the definition, so it breaks this. **Steal it, expose both forms, make both serializable.**
*Reference:* https://mojs.github.io/api/tween/randomness.html

**5. Curve-as-data.**
```ts
easing: 'M0,100 C21.3,72.5 51.4,50.5 100,0'   // an SVG path string is a valid easing
```
A designer draws a curve in Illustrator/Figma, pastes the `d` attribute in. GSAP eventually added `CustomEase.create('M0,0 C0.4,0 0.6,1 1,1')` but it took years and it's still a plugin, not core. Motion has springs but no arbitrary-curve system. **This is directly the DNA of your visual editor.** Every curve in the library is a nameable, serializable, reusable artifact.
*Reference:* https://mojs.github.io/api/easing/ · GSAP CustomEase: https://gsap.com/docs/v3/Eases/CustomEase/

**6. `.setProgress(0..1)` as a first-class primitive.**
```ts
burst.setProgress(0.5);   // jump to exactly halfway, in any state
```
Both GSAP and Motion have this, but mojs made it universal — every animation object supports it, not just timelines. This is what enabled `mojs-player` to exist at all. **Every primitive (`Shape`, `Burst`, `Swirl`, `Timeline`) must implement a unified `setProgress()` interface from day 1.** Retrofitting this later is painful — ask the GSAP team; they did.
*Reference:* https://mojs.github.io/api/tween/#api

**7. "Everything on a shape is tweenable" — with a semantic model.**
mojs's `Shape` has ~40 tweenable properties — `radius`, `radiusX`, `radiusY`, `angle`, `stroke`, `strokeWidth`, `strokeDasharray`, `strokeDashoffset`, `fill`, `fillOpacity`, `points`, `x`, `y`, `scale`, `scaleX`, `scaleY`, and so on — and all accept delta-syntax. GSAP can animate anything, but you have to *tell* it what and how. mojs came with a semantic model of what a shape *is*. **TypeScript makes this even better** — `Shape<'polygon'>` can have `points` while `Shape<'circle'>` doesn't. This is where your TS rewrite genuinely improves on the CoffeeScript original.
*Reference:* https://mojs.github.io/api/shape/

#### 1.8.2 Five things mojs got wrong — do NOT copy

**1. `.then()` chaining for sequencing.**
```ts
new Shape().then({ radius: 50 }).then({ radius: 0 });   // ❌ overloads Promise semantics
```
mojs overloaded `.then()` to mean "queue another tween." It conflicts with `async/await`, and is the source of the persistent bugs #256 and #276 in your exploration doc. **Do instead:** use a proper `Timeline` for sequencing; keep `.then()` as a real Promise.
*Reference:* https://github.com/mojs/mojs/issues/256

**2. Global mutable state and singleton easings.**
```ts
mojs.easing.bezier.default = [...];   // ❌ global mutation, breaks parallel tests
```
GSAP has this to a lesser degree; Motion actively fixed it. **Do instead:** all defaults are per-instance or per-scope; nothing user-mutable at module level. Enforce with TypeScript.

**3. Multiple confusing entry points.**
mojs exports `Shape`, `Html`, `ShapeSwirl`, `Burst`, `Timeline`, `Tween`, `Tweenable`, `Module`… some public, some internal, some deprecated-but-still-exported. **Do instead:** exactly 5 public primitives (`Shape`, `Burst`, `Swirl`, `Stagger`, `Timeline`), everything else internal. Enforce with the `package.json` `exports` map.

**4. Manual SVG DOM writes every frame.**
mojs writes to `<circle>`, `<polygon>` etc. via `setAttribute` per frame — slow past ~500 shapes. **Do instead:** SVG renderer batches writes per frame; Canvas renderer becomes default above a child-count threshold. This is exactly the point of the renderer-adapter split in §2.2.

**5. Docs that show effects but don't teach the model.**
mojs docs are a series of "here's a cool thing" examples. Users copy them without ever learning to compose their own. **Do instead:** docs teach the model first (one page per primitive, focused on the *why*), examples second. Motion does this well; imitate their structure.
*Reference:* https://motion.dev/docs/react-motion-component

#### 1.8.3 What GSAP does better than mojs — adopt these

- **Centralized ticker.** `gsap.ticker` drives every animation from a single rAF loop. Multiple mojs instances each rAF separately — wasteful. **Your core should have one central ticker; every primitive subscribes.**

  **Open decision — settle it before writing `setProgress()`.** Core owns the clock standalone, but inside `gsap.timeline()` GSAP must drive it, and under Motion, Motion must. Three possible owners, so design the ticker as a *replaceable driver*: core ships a default rAF driver, each adapter swaps in the host's clock at registration. Retrofitting this is the same trap as #6 below.
  *Reference:* https://gsap.com/docs/v3/GSAP/gsap.ticker/
- **`gsap.context()` for scoped cleanup.** Massively better than mojs's manual `.destroy()` calls. Look at how `useGSAP` uses context — that's the pattern.
  *Reference:* https://gsap.com/docs/v3/GSAP/gsap.context()/ · React hook: https://gsap.com/resources/React/
- **`gsap.utils` namespace.** `wrap`, `clamp`, `mapRange`, `snap`, `random`, `interpolate`, `pipe`. Utilities that support the main API. mojs had these scattered or missing. **Ship these from day 1 as a `@motly/core/utils` subpath export** — tree-shakeable, no extra package, no extra version to manage.
  *Reference:* https://gsap.com/docs/v3/GSAP/UtilityMethods
- **Community-first docs.** Every page has example CodePens, forum-thread links, video walkthroughs. Decade of investment — you can't match it, but you can start smaller: **every primitive page has one CodePen embed at minimum.**

#### 1.8.4 What Motion does better than mojs — adopt these

- **Hybrid engine (JS + WAAPI).** Motion picks the best backend per animation — hands simple transforms to WAAPI, uses JS for complex chains. Your renderer split (SVG vs. Canvas per instance) is the *analogue*, not the equivalent: WAAPI moves work off the main thread; a renderer split does not. **We ship no WAAPI backend in v1** — procedurally drawn Canvas can't use one — so don't lean on "no WAAPI backend" when arguing against mojs. Scope it to v2 or drop it.
  *Reference:* https://motion.dev/docs/animate#hardware-accelerated-animations
- **TypeScript-first API design.** Not "definitions bolted on" — the API itself is built around discriminated unions and generics. `motion.div` vs `motion.svg` have different prop types. **Your `Shape<'polygon'>` vs `Shape<'circle'>` should work the same way.** This is a v1 requirement, not a v2 nice-to-have.
  *Reference:* https://motion.dev/docs/react-motion-component
- **Explicit reduced-motion API.** `useReducedMotion()` hook + `reducedMotion: "always" | "never" | "user"` option. mojs had nothing. **Ship this on day 1** — it's already in §1.5 as a must-have; this is the reference implementation.
  *Reference:* https://motion.dev/docs/react-use-reduced-motion
- **`<AnimatePresence>` for exit animations.** No mojs equivalent. Exit-animation support is table stakes for the Phase 4 React components — plan for it.
  *Reference:* https://motion.dev/docs/react-animate-presence
- **`layoutId` for shared-element transitions.** Not directly relevant to particle/burst work, but shows how far the state of the art has moved past mojs's timeline-only mental model. Useful frame of reference when you scope v2.
  *Reference:* https://motion.dev/docs/react-layout-animations

#### 1.8.5 The synthesis — what your v1 API actually looks like

Combining the best of all three:

```typescript
import { Shape, Burst, Swirl, Timeline, createContext, rand } from '@motly/core';

// mojs DNA: delta-syntax, children composition, procedural
const burst = new Burst({
  count: 20,
  radius: { 0: 100 },
  children: {
    shape: 'polygon',
    points: 5,
    radius: { 20: 0 },
    fill: ['cyan', 'yellow', 'deeppink'],       // array-distributes across children
    angle: rand(-180, 180),                     // typed randomness helper
    duration: rand(500, 1500),
    easing: 'M0,100 C21.3,72.5 51.4,50.5 100,0' // curve-as-data
  }
});

// GSAP DNA: real Promises, scoped cleanup, utilities
await burst.play();                             // real Promise, no .then() overload
burst.setProgress(0.5);                         // scrubbable — every primitive

const ctx = createContext(() => {               // GSAP-context-style scoped cleanup
  new Burst({ /* ... */ });
  new Swirl({ /* ... */ });
});
ctx.destroy();                                  // cleans everything at once

// Motion DNA: TypeScript-first, reduced-motion, renderer choice
const shape = new Shape<'polygon'>({            // typed by shape kind
  points: 5,                                    // only exists on 'polygon'
  reducedMotion: 'user',                        // explicit accessibility API
  renderer: 'canvas'                            // per-instance backend choice
});
```

Every line above is:
- **From mojs:** the *what to animate* (declarative, procedural, children-composing)
- **From GSAP:** the *how to control it* (Promises, scoping, utilities, central ticker)
- **From Motion:** the *how it feels in modern code* (TypeScript, reduced-motion, renderer choice)

**None of the three current libraries writes like this.** That's your opening — and it's the concrete API contract you build `@motly/core` against in Phase 1.

#### 1.8.6 Design-decision quick reference

When you hit a fork in the road during Phase 1, this is the table to consult:

| Decision | Steal from | Not from | Why |
|---|---|---|---|
| Property definition shape | mojs | GSAP/Motion | Delta-syntax is more declarative for procedural motion |
| Children composition | mojs | (nobody has it) | Unique differentiator |
| Randomness | mojs (both function + string forms) | GSAP | Keeps animations serializable for the editor SaaS |
| Curves | mojs + GSAP CustomEase | Motion (springs-only) | Serializable, designer-friendly |
| Sequencing | GSAP Timeline | mojs `.then()` | Real Promises, no semantic overload |
| Cleanup | GSAP `context()` | mojs manual `.destroy()` | Scoped, automatic, less error-prone |
| Ticker | GSAP (central) | mojs (per-instance rAF) | Perf, coordination, single source of truth |
| Utilities | GSAP `gsap.utils` | (nobody else ships these coherently) | Table-stakes for a "grown-up" library |
| TypeScript design | Motion | mojs (none) / GSAP (bolted on) | Table-stakes in 2026 |
| Reduced motion | Motion | mojs (none) / GSAP (partial) | Accessibility from day 1 |
| Renderer choice | Motion (hybrid engine idea) | mojs (SVG-only) | Perf story past ~500 shapes |
| Exit animations | Motion (`AnimatePresence`) | mojs (none) | Required for Phase 4 React |
| Docs structure | Motion (model-first) | mojs (examples-first) | Users actually learn |

Print this table. Tape it above your monitor while you write Phase 1.

---

## 2. How we structure

### 2.1 Repository — monorepo

Single monorepo. pnpm workspaces + Turborepo (or Nx if you prefer).

```
motly/
├── packages/
│   ├── core/                 → @motly/core         (engine + /utils subpath, no deps)
│   ├── gsap/                 → @motly/gsap         (GSAP plugin adapter)
│   ├── motion/               → @motly/motion       (Motion adapter)
│   ├── react/                → @motly/react        (React components)
│   ├── presets/              → @motly/presets      (Heart, Confetti, etc.)
│   └── shared/               → internal utilities  (private)
├── apps/
│   ├── docs/                 → docs.motly.dev      (Astro or Nextra)
│   ├── playground/           → play.motly.dev      (live editor — UNBUDGETED, see §3.5)
│   └── demos/                → demos.motly.dev     (killer visual gallery)
├── examples/
│   ├── react-next/
│   ├── vanilla-vite/
│   └── gsap-timeline/
├── .changeset/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 2.2 Architecture — hexagonal (ports & adapters)

This is where your day-job architecture pattern maps 1:1.

```
                    ┌─────────────────────────────┐
                    │      @motly/core            │
                    │  (domain: primitives)       │
                    │                             │
                    │  Shape, Burst, Swirl,       │
                    │  Stagger, Timeline          │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────▼─────┐   ┌──────▼──────┐  ┌──────▼──────┐
        │ Renderer  │   │  Adapter    │  │  Framework  │
        │  ports    │   │   ports     │  │    ports    │
        └─────┬─────┘   └──────┬──────┘  └──────┬──────┘
              │                │                │
   ┌──────────┼─────┐    ┌─────┼─────┐    ┌─────┼─────┐
   │          │     │    │     │     │    │     │     │
 ┌─▼─┐   ┌────▼─┐  ┌▼──┐┌▼──┐┌▼───┐ ┌▼───┐┌▼───┐┌▼───┐
 │SVG│   │Canvas│  │WGL││GSAP││Motn│ │Vanl││Rct ││Vue │
 └───┘   └──────┘  └───┘└────┘└────┘ └────┘└────┘└────┘
  v1       v1       v2   v1   v1     v1   v1     later
```

- **Core knows nothing about the DOM, GSAP, Motion, or React.** It emits render commands (a normalized draw list per frame) and lifecycle events.
  **The draw list must be pooled and mutated in place, never reallocated per frame.** 5,000 Canvas shapes at 60fps (§1.6) is 300k object allocations/sec crossing this boundary — a GC problem before it is a rendering one. Use a reused buffer of flat structs or a typed array; do not emit fresh objects.
- **Renderer adapters** (`SVGRenderer`, `CanvasRenderer`, later `WebGLRenderer`) consume the draw list and paint.
- **Timeline adapters** (`GSAPAdapter`, `MotionAdapter`, `VanillaTimeline`) wrap the engine so it plays inside `gsap.timeline()`, `animate()`, or standalone.
- **Framework adapters** (`@motly/react` — components, hooks; later Vue/Svelte) provide idiomatic wrappers.

**Why this matters for shipping:**
- New renderer = new package, no core changes.
- New framework = new adapter package, no core changes.
- Core has zero runtime deps → tiny bundle, no version-conflict hell.

### 2.3 Package publishing strategy

- **All packages under the same npm scope** (`@motly/*`) once name is locked.
- **Changesets** for version management and changelog generation.
- **Independent versioning** (core can be at 1.4.0 while gsap adapter is at 0.9.2).
- **Peer dependencies** for GSAP and Motion (`peerDependencies: { gsap: ">=3.13.0" }`), never bundled.
- **CDN builds** via jsDelivr and unpkg — copy-paste-friendly `<script>` tags for CodePen.

### 2.4 Tooling stack

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) | Non-negotiable given the whole reason we're doing this |
| Package manager | pnpm | Fast, workspace-native, disk-efficient |
| Monorepo | Turborepo | Simple, caches well, no config sprawl |
| Bundler (libs) | tsup | Zero-config TS → ESM+CJS+dts |
| Bundler (apps) | Vite | Fast dev, great DX |
| Testing | Vitest + Playwright | Vitest for unit/engine; Playwright for visual regression |
| Docs site | Astro Starlight or Nextra | Astro if content-heavy; Nextra if you want MDX + React live demos |
| Component playground | Sandpack or StackBlitz WebContainers | Embed live examples in docs |
| CI | GitHub Actions | Test + build + changesets release + Playwright visual diffs |
| Visual regression | Playwright + Percy or Chromatic | Motion library visual regressions are brutal without this |
| Release | Changesets → auto-PR → npm publish | Fully automated once approved |
| Analytics | Plausible on docs; npm-stat on packages | Non-invasive |

### 2.5 Legal / licensing

- **MIT license** for all OSS packages. Standard, permissive, no adoption friction.
- **CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md** from day one.
- **No CLA.** Adds friction, deters casual PRs.
- **Porting hygiene.** mojs and canvas-confetti are both MIT. Copying their *ideas* is free; adapting their *code* requires retaining the copyright notice. Decide per file whether you're writing clean-room from docs or adapting source, and keep a `NOTICE` for anything adapted. Appendix E tells you to read these sources closely — this is the rule for what you then do with them.
- **Trademark:** register the name if it's uncommon and you're serious about the SaaS extension later.
- **Sponsorship:** GitHub Sponsors from day one. Even if it earns nothing early, it signals intent to sustain.
- **License for the SaaS product** (Phase 6+, if it happens): see §2.6.4 for the industry-standard options and which one fits your situation.

### 2.6 Ownership structure — OSS libraries vs SaaS product

This is where projects that grow past "solo library" hit friction they didn't plan for. Structure it right in Phase 0 and you won't have to migrate later. The rules below reflect what the mature OSS+SaaS companies actually do — not what looks clean in a blog post.

#### 2.6.1 Personal profile vs. organization — settle this first

**Use a GitHub organization from day 1.** Not a personal profile. Every argument below assumes the org exists.

Why an org, not `github.com/<your-handle>/motly-core`:
1. **Namespace alignment.** The npm scope `@motly/*` and the org `github.com/motly` should be the same word. (The mapping is scope→org, not package→repo — packages live inside the monorepo, per §2.1.) Mismatched names read as amateur.
2. **Multi-repo project.** You will have 8–10 repos (core + adapters + docs + playground + examples + presets + registry + editor). Personal profiles get cluttered fast.
3. **Contributor scaling.** Orgs have teams, permissions, and shared secrets. Personal profiles have "collaborators" — doesn't scale.
4. **Transfer pain later.** GitHub *does* preserve stars and forks on transfer, but not CI secrets, npm auth, README badges, or third-party links. At 100 stars the migration is annoying; at 10k it's a lost weekend.
5. **SaaS split preparation.** When Phase 6+ comes, the SaaS lives naturally as a private repo in the same org. No org means messy structural changes later.

Your personal profile stays yours — dotfiles, blog, `mo-trader`, `playmates`, `recital`. The *product* belongs to the *product's namespace*.

#### 2.6.2 The three industry patterns for OSS + SaaS

This is the map. Pick the one that fits your stage.

**Pattern A — Single org, license split** (recommended for you)

Real examples: **Supabase** (`github.com/supabase/supabase`), **Cal.com** (`github.com/calcom/cal.com`), **PostHog** (`github.com/PostHog/posthog`), **Plausible** (`github.com/plausible/analytics`).

```
github.com/motly/           ← single organization
├── motly                   ← public, MIT — the OSS monorepo (per §2.1)
│                              contains: packages/core, gsap, motion, react, presets
│                                        apps/docs, playground, demos
├── editor                  ← PRIVATE, proprietary (Phase 6+)
├── editor-runtime          ← public, MIT (the JS runtime users embed)
└── .github                 ← public, org profile & shared templates
```

- One org, all repos in one place. **The OSS libraries live in a single monorepo (`motly/motly`)** — this matches §2.1, not one repo per package. Supabase and PostHog do this too.
- OSS monorepo: MIT-licensed, public.
- SaaS app: private repo(s) in the same org, proprietary license or source-available (see §2.6.4).
- Company entity (BV in NL, LLC in US, etc.) legally owns everything.
- Best for: solo founders, small teams, projects with clear OSS core + optional paid product.

This is the default for modern OSS+SaaS startups. Almost everyone starts here.

**Pattern B — Two orgs, clean split**

Real examples: **Prisma** (`prisma/` + `prisma-labs/`), **GitLab** (`gitlab-com/` + `gitlab-org/`), historically **Sentry**.

```
github.com/motly/           ← community org (OSS only)
├── motly                   ← OSS monorepo
└── editor-runtime          ← MIT (kept community-side since it's a library)

github.com/motly-cloud/     ← commercial org (SaaS + enterprise)
├── editor                  ← private, proprietary
├── billing
├── api
└── infra
```

- Community-facing OSS separated visually and organizationally from commercial code.
- Signals "this org is community-first" even when the same team runs both.
- Cleaner for enterprise sales narratives ("the OSS org is neutral").
- Best for: companies past $1M ARR, or when you want to actively distance the commercial side from the community side.
- **Overkill until you have real SaaS revenue.** Migrate from A → B when the split earns its complexity.

**Pattern C — Foundation model**

Real examples: **Node.js** (OpenJS Foundation), **Kubernetes** (CNCF), **Vue** (Vue.js Foundation, informal).

- OSS owned by a neutral foundation.
- Commercial services built by companies *other than* the one owning the OSS. Note how rare this genuinely is: Next.js looks like this from outside but is owned by Vercel, i.e. Pattern A wearing a costume.
- Requires massive traction, multiple corporate contributors, and years of runway.
- **Not applicable to you.** Listed for completeness. If `motly` ever hits Vue-scale adoption, revisit.

#### 2.6.3 Your recommendation, concretely

**Start with Pattern A. Migrate to Pattern B only if the SaaS clears ~$1M ARR** (the industry-standard threshold where the org-management overhead of a split earns its complexity; see §2.6.6).

Concrete Phase 0 setup:

```
github.com/motly/                        ← create in Phase 0, Day 2
├── .github                              ← org profile + shared templates
│   └── profile/README.md                ← org landing page
├── motly                                ← main monorepo (public, MIT) — the only repo you need at launch
│   ├── packages/core, gsap, motion, react, presets
│   └── apps/docs, playground, demos
│
└── (added later, Phase 6+ only)
    ├── editor                           ← private, proprietary (the SaaS)
    └── editor-runtime                   ← public, MIT (the JS runtime users embed on their sites)
```

You don't need `motly-cloud` or `motly-inc` on day 1. But **reserve those org names on GitHub** so nobody else grabs them. Free, 5 minutes, blocks squatters.

#### 2.6.4 License choices for the SaaS piece

If Phase 6+ SaaS happens, you have four realistic license options. Pick with intent — this decision shapes what competitors can do.

| License | What it does | Real users | Fits you if… |
|---|---|---|---|
| **Fully proprietary (closed)** | Source is private, only you can build/host | Figma, Rive editor, most enterprise SaaS | You want the simplest legal story and don't care about community visibility of the SaaS code |
| **AGPL v3** | Open source, but forces network-hosted forks to open their modifications | Plausible, older Cal.com, Grafana | You want an "open core" narrative; competitors reselling your hosted version must share their improvements |
| **Business Source License (BSL)** | Source-available; commercial-use restrictions for N years, then converts to Apache/MIT | MariaDB, Sentry, CockroachDB | You want source visible for trust/audit but block AWS-style resellers for a fixed window |
| **Fair Source License (FSL / FCL)** | Source-available; converts to Apache after 2 years; blocks direct competitors immediately | Sentry (since Nov 2023), Keygen, some newer startups | You want the newest "friendly competitive" license — permissive for internal use, restrictive for competitors |

**For your specific case (visual editor SaaS, solo founder, NL-based):**

- **v1 of the editor SaaS: fully proprietary, closed source, private repo.** Simplest legal story, no license-fork risk, no obligation to explain your terms to users. You can always open-source later; you can't easily close-source once opened.
- **If it takes off and users ask "can we self-host?": switch to BSL or FSL.** Both let you keep the commercial moat while showing source. Do this reactively, not preemptively.
- **Do NOT AGPL your library packages.** MIT for `@motly/*` libraries is a hard rule — AGPL kills library adoption (many enterprises won't touch AGPL code, including your target audience of agency devs at Nationale-Nederlanden-like companies).

The `@motly/editor-runtime` package (the JS your SaaS embeds in customer sites) **stays MIT** even when the SaaS itself is proprietary. Runtime = library = MIT. Editor = product = proprietary.

#### 2.6.5 Legal entity — when to incorporate

You are in the Netherlands. The rules of thumb:

- **OSS libraries only, no revenue:** run under your personal name. Zero legal setup needed. Your Dutch personal income tax handles any donations under €7,000/year without much fuss.
- **GitHub Sponsors income under ~€5k/year:** still fine on personal. Report as "other income" on your NL tax return.
- **SaaS revenue starts, or Sponsors passes ~€10k/year:** register a **BV (Besloten Vennootschap)**. Costs €500–1,500 with a notary, takes 2–4 weeks. Caps personal liability, enables proper VAT handling, unlocks eligibility for the innovation-box tax regime (14.5% on qualifying tech IP income vs. 25.8% standard corporate rate).
- **Serious SaaS with employees:** BV is mandatory. Consider a holding structure (Holding BV owns Werk-BV) for cleaner exit tax treatment. Talk to a Dutch tax advisor — this pays for itself.

Key point for structural planning: **whatever legal entity you eventually form will want to own the trademark, the domain, and the GitHub org.** Choose the org name and register the domain as if the BV already exists. That means:

- ❌ Don't name the org `mo-labs` or `mo-projects` — hard to transfer to a BV called "Spark B.V." later.
- ✅ Do name the org after the product — the BV can be "Spark B.V." and inherit everything cleanly.

#### 2.6.6 Industry summary — one paragraph

> The modern default for OSS + SaaS is **one GitHub organization, MIT-licensed public libraries, proprietary or source-available private SaaS repos, all owned by a single legal entity**. Split into a second org only when the commercial side is large enough to justify the org-management overhead (~$1M ARR territory). Never AGPL a library — AGPL is a SaaS-defense weapon, not a library license. Never start on a personal profile if you intend to build a product; the migration cost compounds with every star.

That's the pattern. That's what Supabase, Cal.com, PostHog, Plausible, Sentry, Prisma, and most of the modern OSS-startup wave do. You are not inventing anything by following it — you are aligning with the well-worn path so you don't spend energy on structural questions instead of on the product.

---

## 3. What are the things needed

### 3.1 Skills you already have

- Senior TypeScript ✅
- Hexagonal / ports & adapters ✅ (this is the ideal use case)
- Fullstack / React ✅
- Spec-driven development ✅
- Figma MCP integration ✅ (useful for docs mockups)
- AWS serverless ✅ (useful for the SaaS extension later, not needed for v1)

### 3.2 Skills you'll need to learn or lean on

- **SVG deep internals** — path commands, transforms, filters. Read Pomax's SVG guide + MDN.
- **Canvas 2D perf patterns** — batching, offscreen, dirty rectangles. Read MDN + a few Christopher Wallis posts.
- **Animation engine math** — bezier easings, catmull-rom splines, stagger distributions. mojs's own source (despite being CoffeeScript) is actually a good study.
- **GSAP plugin API** — read GreenSock's plugin dev docs, study ScrollTrigger and Flip source.
- **Motion internals** — motion.dev docs, particularly the low-level `animate()` API.
- **Copy-paste-component registry format** — study shadcn's `registry.json` schema; you'll want to match it.
- **Visual/motion design vocabulary** — enough to talk to designers on Twitter without sounding like a backend engineer. Watch a few After Effects tutorials on YouTube (School of Motion is great). This is genuinely part of the work.

### 3.3 Tools & accounts to set up

- GitHub org (name-locked with the library name).
- npm scope (paid ~€7/mo if you want private packages later; free is fine for OSS).
- Domain: `<name>.dev`.
- Discord server (empty for now, ready for later).
- CodePen Pro (~€8/mo — needed for embeddable pens without ads on your docs).
- Twitter/X and Bluesky handles matching the library name.
- YouTube channel (later, for demo videos).
- Buy the name early. Squatters are real.

### 3.4 Design assets you'll need

- Logo (get a designer on Dribbble for €200–500, or trade it for a shoutout).
- Docs site design (Figma mockup first — leverage your Figma MCP setup).
- **10–15 killer demos** built during development, not after. These ARE the product for launch purposes.
- OG image / social share cards (auto-generated per docs page ideally).

### 3.5 Time budget

Realistic solo, part-time (2–3 evenings + one weekend day per week). **The Appendix A cadence actually sums to ~13 hrs/week; 15 is the optimistic ceiling.** The hours column below assumes 15, so read the week counts as a *floor*. This mirrors the phase structure in §4 exactly, so you can track actual vs. planned as you go:

| Phase | Scope | Duration | Total hours |
|---|---|---|---|
| Phase 0 | Setup: name, org, monorepo, CI | 1 week | ~15 |
| Phase 1 | Core engine (`@motly/core`) | 8 weeks | ~120 |
| Phase 2 | GSAP adapter + first 5 demos + first public release | 4 weeks | ~60 |
| Phase 3 | Motion adapter + 2 new demos | 2 weeks | ~30 |
| Phase 4 | React components + `@motly/presets` + effects gallery | 4 weeks | ~60 |
| Phase 5 | Standalone framing, v1.0 launch, migration guide | 6 weeks | ~90 |
| **Total to full public v1** | | **25 weeks @ 15 hrs/wk · ~29 weeks @ 13** | **~375 hrs** |

That's assuming you hit the scope discipline in §1.2. Every "wouldn't it also be nice if…" adds a week.

It also **excludes the scheduled breaks** in Appendix A (one week off every 6–8 weeks = 3–4 more weeks), and excludes `apps/playground`, which appears in the §2.1 tree but is funded by no phase here. Calendar-realistic range to v1: **28–33 weeks (~7–8 months)**. Plan against that number, not against 25.

### 3.6 Money budget

Minimum viable spend for a serious launch:

| Item | Cost |
|---|---|
| Domain (.dev) | €12/year |
| Domain (.com, defensive — per Phase 0 Day 1) | €12/year |
| CodePen Pro | €8/mo × 6 = €48 |
| Logo (Dribbble designer) | €200–500 |
| Chromatic or Percy (free tier likely OK) | €0 |
| GitHub Sponsors setup | €0 |
| Docs hosting (Vercel/Cloudflare free tier) | €0 |
| Launch tweet promo (optional) | €0–100 |
| EU word-mark registration (only if pursuing the SaaS — §2.5) | €850+, deferred |
| **Total to v1 launch** | **€272–672** (trademark excluded — it's a post-traction spend) |

Cheap. This is a time investment, not a capital one.

---

## 4. Priority order

> **⚠ Open decision — the one thing this plan hasn't settled.**
>
> §0.2 rejects the mojs rewrite because "a full four-repo TypeScript rewrite is a 6–12 month solo effort" and the ROI is bad. The six phases below then commit to *more* scope than that: core engine + two renderers + four adapters + ~10 React components + a registry + presets + docs site + demos site + 15 demos + 85% coverage + visual regression + five launch campaigns — in six months, solo, part-time.
>
> `mojs-exploration.md` is blunter still: *"Timebox to 3 months for v1-alpha. If you're not shipping usable alpha by month 3, cut scope again or stop."* This plan ships its first public artifact at week 12 and 1.0 at week 24. Option A from that document ("just the burst library, 2–3 months") was upgraded into a four-surface platform with no recorded rationale.
>
> **Two honest resolutions. Pick one and log it in `DECISIONS.md` before Phase 1:**
>
> 1. **Cut v1 to Phases 0–2** — core + GSAP adapter + demos, public at month 3. Phases 3–5 become post-v1, contingent on Phase 2 traction. This is the recommendation; it matches the exploration doc's own timebox and makes the hour budget honest.
> 2. **Keep all six phases** — but write down why the effort argument that killed the rewrite doesn't apply here, and re-plan against the 28–33 week range in §3.5 rather than 25.
>
> What isn't available is leaving it unresolved. Everything below assumes resolution (2).

Six phases. Ship at the end of each — don't batch releases.

### Phase 0 — Setup (Week 0, ~1 week)

**Goal:** foundations locked before writing any engine code. Governance and identity decisions are cheap now and expensive later (see §2.6 for the full reasoning on org structure).

**Day 1 — Name & identity lock (~2 hours)**
- [ ] Shortlist 5 candidate names. Requirements: reads well as `gsap.<name>()`, `<Name />`, and `@<name>/core`; not derivative of mojs; motion-graphics vocabulary.
- [ ] Availability check across all surfaces, same session:
  - npm scope: `npm view @<name>/core` (404 = free) or check https://www.npmjs.com/settings/<name>/packages — note `npm access ls-packages` lists *your* packages, it does not test availability
  - GitHub org name (must be available — this is the hard constraint)
  - Domain `<name>.dev` and `<name>.com`
  - Twitter/X, Bluesky, YouTube handles
  - GitHub repo names inside the org (single-word `core` if you're strict)
- [ ] Lock everything the same day. **Do not proceed to Day 2 with any surface unclaimed** — squatters take names hourly.

**Day 2 — GitHub organization creation (~1 hour)**
- [ ] **Create the GitHub organization** (not a personal profile — see §2.6 for why).
  - Free tier is sufficient for OSS repos; upgrade to Team (~€4/user/mo) only when SaaS repos go private in Phase 6+.
  - Org name = product name = npm scope.
  - Set yourself as sole owner.
  - Public visibility.
- [ ] **Create `<org>/.github` repo.** This is the org-wide profile repo. Files there apply org-wide:
  - `profile/README.md` — org-level landing (shown on the org page).
  - `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`.
  - `.github/ISSUE_TEMPLATE/` — bug, feature request, docs templates.
  - `.github/PULL_REQUEST_TEMPLATE.md`.
  - `.github/FUNDING.yml` — GitHub Sponsors config.
- [ ] Enable GitHub Discussions on the future main repo (for Roadmap threads).
- [ ] Enable GitHub Sponsors on the org (or link to your personal Sponsors — your call).
- [ ] Reserve `<org>-app`, `<org>-labs`, `<org>-inc` as GitHub org names too if you can, for the SaaS split later (see §2.6, Pattern B). Cheap insurance.

**Day 3 — Monorepo scaffold (~4 hours)**
- [ ] `<org>/<mono-repo-name>` — main monorepo (many teams call this `<org>` or `<product>`).
- [ ] Initialize: pnpm workspaces + Turborepo + Changesets.
- [ ] Package skeletons: `packages/core` (with a `./utils` subpath export, §1.8.3), `packages/gsap`, `packages/motion`, `packages/react`, `packages/presets`.
- [ ] App skeletons: `apps/docs`, `apps/demos`. (`apps/playground` is funded by no phase in §3.5 — scaffold it when a phase actually pays for it.)
- [ ] Root: `LICENSE` (MIT), `README.md` (draft), `.editorconfig`, `.gitignore`, `.nvmrc`, `.node-version`.
- [ ] Configure npm scope publishing — link your npm account to the `@<org>` scope; verify `npm publish --dry-run` from an empty package works.

**Day 4 — CI, automation & secrets (~3 hours)**
- [ ] GitHub Actions: `.github/workflows/ci.yml` — lint + typecheck + test + build on every PR.
- [ ] `.github/workflows/release.yml` — Changesets → auto-PR → npm publish, gated on approval.
- [ ] npm publish token stored as `NPM_TOKEN` in **org-level secrets** (not repo-level — future repos inherit).
- [ ] Turborepo remote cache token if using Vercel's free tier.
- [ ] Branch protection on `main`: required PR reviews (self-review OK for solo), required CI passing, no direct pushes.
- [ ] Codeowners file (`.github/CODEOWNERS`) — `* @<your-handle>` for now.

**Day 5 — Community surface (~2 hours)**
- [ ] Discord server (create empty, don't launch publicly yet — link goes in README once you have users).
- [ ] `apps/docs` skeleton deployed (Vercel or Cloudflare Pages) at `<name>.dev` — even if it's just "Coming soon."
- [ ] GitHub Discussion #1: "Roadmap & scope — feedback welcome" (pinned).
- [ ] `README.md` for main repo: one-line pitch + install placeholder + "under active development" note.
- [ ] Confirm all social handles resolve to a landing (Twitter/Bluesky bio → docs site URL).

**Exit criterion:**
- `pnpm install && pnpm build && pnpm test` runs green with an empty scaffold.
- Org page at `github.com/<name>` renders your profile README, shows the main repo, and looks like a real project — not a personal experiment.
- `<name>.dev` resolves.
- All namespaces (npm scope, org, domain, socials) are yours.

**Ship:** nothing publicly announced yet. Phase 0 is quiet infrastructure. First public words come in Phase 2.

---

### Phase 1 — Core engine (Weeks 1–8, ~8 weeks)

**Goal:** `@motly/core` is a real thing that works standalone, no adapters yet.

- [ ] Domain model: `Shape`, `Burst`, `Swirl`, `Stagger`, `Timeline` — TypeScript interfaces first (spec-driven, as you already work).
- [ ] Property tween engine (numbers, colors, unit-aware strings, arrays).
- [ ] Easing library (bezier, spring-lite, custom curves).
- [ ] Seeded RNG for reproducible bursts.
- [ ] Draw-list output (renderer-agnostic frame representation).
- [ ] `SVGRenderer` — first, easier, parity with mojs.
- [ ] `CanvasRenderer` — second, for the perf story.
- [ ] Reduced-motion detection + honoring.
- [ ] `.destroy()` that actually cleans up.
- [ ] Vitest unit tests to ≥85% coverage.
- [ ] Playwright visual regression harness + tests for 5 canonical bursts. **Budget ~15–20 hrs for the harness alone** (deterministic seeding, frame pinning, tolerance tuning, CI flake control) before the first assertion lands. If Phase 1 runs hot, defer *this* to Phase 2 — not the coverage target.
- [ ] Internal-only demo page (`apps/demos`) that renders 5 things.

**Exit criterion:** You can do `new Burst({ ... }).play()` in vanilla HTML and see it work in Safari, Chrome, Firefox.

**Ship:** nothing publicly yet. This phase is quiet.

---

### Phase 2 — GSAP adapter + first public release (Weeks 9–12, ~4 weeks)

**Goal:** land the plugin in the GSAP community. This is the wedge.

- [ ] `@motly/gsap` — registers via `gsap.registerEffect()`, exposing `gsap.effects.burst()` / `gsap.effects.swirl()` that return tweens composable into `gsap.timeline()`.
  **Correction to earlier drafts:** `gsap.registerPlugin()` registers *property* plugins (keys consumed inside a tween's vars object); it cannot add top-level `gsap.burst()` methods. Named top-level effects come from `registerEffect()`. Confirm which of the two — or both — you need against the plugin guide **before writing code**; the whole Phase 2 wedge rests on this.
- [ ] Read GreenSock's plugin dev guide cover to cover before writing this.
- [ ] 5 killer CodePen demos, each ~50 lines, each visually striking.
- [ ] Docs site: getting-started, primitives reference, GSAP integration guide, 5 embedded demos.
- [ ] READMEs for `@motly/core` and `@motly/gsap` with copy-paste install snippets.
- [ ] Publish v0.1.0 to npm (both packages).
- [ ] Post launch thread on GSAP forum (respectful, "here's a plugin I made" — not "here's a competitor").
- [ ] Launch thread on Twitter/X and Bluesky.
- [ ] Submit to `awesome-gsap` and `awesome-web-animation` lists.
- [ ] Ask one question in mojs GitHub Discussions: what would make you move? Cheap, early signal on the problem-statement audience #4 assumption — do it now, not in Phase 5 when the migration guide is already built.

**Exit criterion:** v0.1.0 published, 5 demos live, launch posts out — **and** the 4-week success signal below measured and written into `DECISIONS.md`, pass or fail. ("One non-Mo human installed it" is a nice first milestone but cannot fail, so it gates nothing.)

**Ship:** first public release. This is real.

---

### Phase 3 — Motion adapter (Weeks 13–14, ~2 weeks)

**Goal:** cover the other half of the modern animation market cheaply.

- [ ] `@motly/motion` — thin adapter, most work already done in core.
- [ ] 2 new demos specifically for Motion users (React-flavored).
- [ ] Docs page: Motion integration guide.
- [ ] Publish v0.2.0.
- [ ] Post in Motion Discord / on their GitHub Discussions.
- [ ] Update launch tweet thread with the Motion story.

**Exit criterion:** works inside Motion's `animate()` and inside `<motion.div>` gestures.

**Ship:** incremental release. Small but keeps momentum.

---

### Phase 4 — React copy-paste components (Weeks 15–18, ~4 weeks)

**Goal:** ride the shadcn / aceternity / magicui wave. Get on people's screens.

- [ ] `@motly/react` — components: `<Burst />`, `<Sparkle />`, `<HeartBurst />`, `<Confetti />`, `<Firework />`, `<RippleClick />`, ~10 total.
- [ ] `@motly/presets` — same effects as pure JS presets for non-React users.
- [ ] shadcn-compatible registry (`registry.json`) so people can install via `npx shadcn add burst`.
- [ ] Docs: `<Preview>` component that shows the effect + code side-by-side.
- [ ] "Effects gallery" landing page — this becomes your homepage hero.
- [ ] 3 more killer CodePen demos (React-flavored).
- [ ] Publish v0.3.0.

**Exit criterion:** the docs homepage has a scroll-through gallery of 10+ live effects. Someone new opening the site says "wait, how."

**Ship:** the big visual launch. This is the "the meme goes viral" release if any of them does.

---

### Phase 5 — Standalone framing & full 1.0 (Weeks 19–24, ~6 weeks)

**Goal:** formalize the "procedural motion graphics" positioning with the audience you now have.

- [ ] Docs rewrite around the After Effects mental model (composition, layer, curve — designer vocabulary).
- [ ] Full API reference — every primitive, every option, runnable example inline.
- [ ] Migration guide from mojs (this is a real audience — 33k weekly downloads currently orphaned).
- [ ] "Why not GSAP?" and "Why not Motion?" honesty pages — not defensive, just clear about the different problem space.
- [ ] Case-study blog post(s) — build 2–3 real microsites/demos in public, blog the process.
- [ ] Publish v1.0.0.
- [ ] Big launch: Product Hunt, Hacker News (Show HN), CSS-Tricks pitch, Smashing Magazine pitch, Frontend Focus / JavaScript Weekly submissions.

**Exit criterion:** v1.0 shipped, docs are complete, launch content queued for 4 weeks of drip.

**Ship:** the 1.0. This is where you either have traction or you don't.

---

### Phase 6+ — What comes after (roadmap)

Not in v1. Do based on what actually resonates:

- WebGL renderer (if perf ceiling is the top issue people report).
- Vue / Svelte adapters (if demand is real, not just polite requests).
- The visual editor SaaS (only if `@motly/core` clears 10k weekly downloads).
- Sponsor/consulting/paid-plugin tier (only if there's demand and time).

---

## 5. How to release each feature — channels, cadence, content

Two rules for everything below:
1. **Every release ships with at least one visible artifact.** Never publish an npm version without a tweet, a CodePen, or a blog post attached.
2. **Show, don't tell.** Motion graphics is visual. Nobody reads paragraphs. Videos, GIFs, live pens.

### 5.1 Channels — where the audience actually is

| Channel | Audience | Cadence | Best for |
|---|---|---|---|
| **Twitter/X** | Creative devs, motion designers, JS Twitter | 2–3 posts/week | Demo GIFs, launch threads, dev-in-public updates |
| **Bluesky** | Same crowd, migrating | Mirror Twitter | Redundancy + earlier adopter reach |
| **CodePen** | The single most important channel for a visual library | 1 pen per release, minimum | Actual working demos, forkable code |
| **GSAP forum** | GSAP power users | Once for launch, then reply-only | GSAP plugin discovery |
| **Motion Discord** | Motion / React devs | Once for adapter launch | Motion plugin discovery |
| **GitHub Discussions** | Existing users + curious devs | Ongoing | Roadmap transparency, feature requests |
| **Dev.to / Hashnode** | Beginner-to-mid JS devs | 1 post/phase | SEO + tutorial content |
| **Personal blog** | Long-term compounding | 1 post/phase | Case studies, architecture write-ups |
| **CSS-Tricks / Smashing Mag** | Broad web-dev audience | 1 pitch at v1.0 | Legitimacy, backlinks |
| **awwwards / Codrops** | Creative-dev audience | Feature submission at v1.0 | Aspirational audience |
| **Frontend Focus / JavaScript Weekly** | Newsletter subscribers | Submit at v1.0 | Wide distribution |
| **Hacker News** | Broad HN crowd | Show HN at v1.0 only | High-variance, one shot |
| **Product Hunt** | Product/startup crowd | Launch at v1.0 | Adjacent audience, some SEO benefit |
| **YouTube** | Long-form learners | 1 launch video, then case studies | Compounds slowly, huge if it hits |

### 5.2 Content template — per phase

Each phase gets the same content package. Templatize it once, reuse it.

**Per phase you produce:**

1. **1 launch thread on Twitter + Bluesky.** Format: hook GIF → what it is → 3 code snippets with GIFs → link to docs + CodePen. 6–10 posts.
2. **1 CodePen demo collection** (linked from docs).
3. **1 short blog post** on your personal site — what shipped, why, one thing you learned.
4. **1 update in GitHub Discussions** — roadmap check-in.
5. **1 short video / screen recording** (Loom or ScreenStudio) embedded in docs and social.
6. **1 update to the changelog + release notes** (Changesets handles most of this).

That's ~4–6 hours per release cycle. Batch it into a single "release day."

### 5.3 Phase-by-phase release plan

#### Phase 2 launch (first public v0.1 — GSAP plugin)

**Do:**
- **Tweet thread:** "I built a GSAP plugin for procedural motion graphics. Bursts, swirls, particles — declarative, TypeScript, MIT. Here's what it looks like:" → 5 GIFs → install snippet → CodePen link → docs link.
- **CodePen collection:** 5 pens (Heart burst, Confetti, Firework, Sparkle click, Ripple).
- **GSAP forum post:** "New GSAP plugin: [name] — procedural burst/particle primitives" — polite, links to demos, tags relevant maintainers only if genuinely relevant.
- **Blog post:** "Why I built a GSAP plugin instead of another animation library." (This is your positioning story. Directly addresses "why not just GSAP?")
- **Dev.to cross-post** of the same blog post.
- **Submit to `awesome-gsap`.**

**Do NOT:**
- Post on HN yet — you have one Show HN shot, save it for v1.0.
- Pitch CSS-Tricks yet — same reason.
- DM influencers cold. Let the work speak. If someone with reach picks it up, thank them publicly.

**Success signal at 4 weeks:** 100+ GitHub stars, 500+ weekly npm downloads on `@motly/gsap`, 3+ non-Mo issues opened.

#### Phase 3 launch (Motion adapter)

**Do:**
- **Tweet:** short, one GIF, "Now works inside Motion too. Same primitives, native `<motion.div>` integration." Link to Motion integration docs.
- **Motion Discord post:** in the appropriate channel, brief, "made a Motion adapter for [name]."
- **Blog post:** "Adapting a motion graphics engine to two ecosystems: what stayed, what changed." Architecture-focused. This is résumé content.
- **CodePen:** 2 new pens showing Motion-specific integration (gesture-triggered bursts).

**Success signal at 2 weeks:** measurable install spike on `@motly/motion`; someone in the Motion community reposts.

#### Phase 4 launch (React components) — the potentially viral one

**Do:**
- **Effects gallery landing page** — this is the artifact. Scroll-through of 10+ live components. Each one has a "copy code" button.
- **Tweet thread:** "10 copy-paste React motion graphics components. shadcn-compatible. `npx shadcn add burst`. Here's all of them:" → GIF collage → link.
- **Individual tweets per component over 2 weeks** — one component/GIF per tweet, drip-feed. Do not blow the whole gallery in one tweet.
- **Dev.to article:** "Building a shadcn-compatible motion components registry."
- **CodePen collection:** every component available as a pen.
- **Cross-post to Bluesky and LinkedIn** (LinkedIn actually works for creative dev content lately).
- **Submit to `awesome-react-components`** and similar registries.
- **DM friendly creators** who share shadcn-style content (only after you have some baseline traction — don't cold-DM if you're at 20 stars).

**Success signal at 4 weeks:** at least one component GIF hits 10k+ impressions; 1k+ weekly downloads across `@motly/react` and `@motly/presets`.

#### Phase 5 launch (v1.0 — the big one)

**Do — in this order over 2 weeks:**

Week 1:
- **Docs freeze + full v1.0 API reference published.**
- **Case-study blog post series** (2–3 posts): "I built X in production using [name]." Real examples, not toys.
- **YouTube video:** 5–8 min "tour of [name]" — visual, fast-cut, ends with install command.

Week 2 (the actual launch):
- **Monday:** Product Hunt launch (early morning PST). Prep hunter, gallery images, first-comment reply ready.
- **Tuesday:** Show HN post. Simple title: "Show HN: [name] – procedural motion graphics for the web." Be present in the thread all day.
- **Wednesday:** Big Twitter/Bluesky thread — the v1.0 announcement. Include the story arc: "6 months ago I started because [gap]. Here's what it became."
- **Thursday:** Newsletter blast if you have one; DEV.to feature article.
- **Friday:** Reflection blog post — "What I learned shipping [name] v1.0."

Ongoing (weeks 3–6 post-launch):
- **Pitch CSS-Tricks + Smashing Magazine** with the case-study angle.
- **Submit to Codrops / awwwards** as a resource.
- **Submit to Frontend Focus, JavaScript Weekly, Bytes, Node Weekly.** Free, high-value distribution.
- **Set up GitHub Sponsors** if not already, mention it lightly in the launch thread.

**Success signal at 30 days post-v1:** 1k+ GitHub stars, 5k+ weekly downloads combined, at least one production site using it publicly.

### 5.4 Ongoing content cadence (post-v1)

Once v1 ships, drop into a maintenance rhythm:

- **Weekly:** 1 demo GIF on Twitter/Bluesky. Small, fun. No pressure.
- **Monthly:** 1 blog post — case study, tutorial, architecture, or roadmap update.
- **Quarterly:** Minor version release with 2–3 new presets. Full release-package treatment.
- **Yearly:** Major version if needed. Otherwise, keep shipping incrementally.

### 5.5 Metrics to actually track

Vanity metrics vs. real metrics:

**Track weekly (dashboard it):**
- npm weekly downloads per package.
- GitHub stars (crude proxy, but public).
- Docs site unique visitors.
- CodePen fork count on demo pens.
- Non-Mo GitHub issues opened.
- Non-Mo PRs merged.

**Track quarterly:**
- Production sites in the wild (search GitHub for imports; set up a Google Alert for the name).
- Talks/tutorials by other people mentioning the library.
- Sponsors count and amount.

**Ignore:**
- Twitter follower count.
- Cumulative impression totals. (Reach on a *single* demo post is a real signal — §5.3 and Appendix C both gate on it. The running total across everything is not.)
- Hacker News points beyond launch day.

---

## Appendix A — Weekly cadence recommendation

To sustain 15 hrs/week for 6 months without burning out:

- **Mon evening (2 hrs):** engine code / adapter code (deep-focus work).
- **Tue evening (2 hrs):** engine code / testing.
- **Wed:** off.
- **Thu evening (2 hrs):** docs / demos / release-day tasks.
- **Fri:** off.
- **Sat morning (4 hrs):** biggest coding block of the week.
- **Sat afternoon:** off.
- **Sun (2–3 hrs):** flexible — either overflow coding OR content/tweets/blog (batched).

**This sums to ~13 hrs/week, not the 15 assumed in §3.5.** And **Phase 1 ships nothing publicly** — for those 8 weeks, roll the Thursday and Sunday content slots into engine work, tests, and building the demo backlog you'll launch with in Phase 2.

Take one full week off every 6–8 weeks. Non-negotiable. Solo OSS burns people out fast; scheduled breaks prevent it.

## Appendix B — Decision log (fill in as you go)

Keep a `DECISIONS.md` in the repo. One entry per significant call. Format:

```
## 2026-10-05 — Chose Canvas 2D over WebGL for v1
Context: needed a perf story past SVG's ~500-shape ceiling.
Options considered: Canvas 2D, WebGL via regl, PixiJS as a peer dep.
Decision: Canvas 2D.
Rationale: no runtime deps, works everywhere, good enough for 5k shapes.
              WebGL deferred to v2 based on real demand.
Trade-off: leaves particle-system-scale perf on the table until v2.
```

This is spec-driven-development discipline applied to product decisions. Future-you and future contributors will thank you.

## Appendix C — Kill criteria

Set the exit conditions now, when you're clear-headed.

**Pause the project if, after Phase 4 (~4 months in):**
- `@motly/gsap` has under 500 weekly downloads — i.e. it never cleared the Phase 2 four-week bar (§5.3). This threshold was 200, which sat *below* an earlier success bar and so only fired on active decline, never on a flat failure to launch.
- No non-Mo humans have opened issues.
- No component GIF has crossed 5k impressions.

**Not a failure — a signal.** The market told you it doesn't want this in this form. Options at that point:
- Pivot the framing (e.g., double down on the SaaS editor idea; the runtime becomes secondary).
- Reduce scope (ship it as a personal-project portfolio piece; stop marketing).
- Wind it down honestly (archive with a "here's what I learned" post).

Any of the three is a fine outcome. What's not fine is grinding on it for another 6 months out of sunk-cost momentum.

---

## Appendix D — External resources & reference links

All the links you'll actually need while building this, grouped by why you'd open them. Links verified September 2026 — GSAP was acquired by Webflow and all plugins went free in April 2025, so ignore any older tutorial that mentions "Club GreenSock" or `.npmrc` auth tokens.

### D.1 GSAP — the primary integration target

**Official**
- Homepage: https://gsap.com
- GitHub: https://github.com/greensock/GSAP
- npm: https://www.npmjs.com/package/gsap
- Docs (v3): https://gsap.com/docs/v3/
- Plugins overview: https://gsap.com/docs/v3/Plugins/
- `gsap.registerPlugin()` — the API your adapter hooks into: https://gsap.com/docs/v3/GSAP/gsap.registerPlugin()
- Community forum (the single most important place to launch your plugin): https://gsap.com/community/
- Cheatsheet: https://gsap.com/cheatsheet/
- Ease visualizer: https://gsap.com/docs/v3/Eases/
- "Why GSAP?" positioning page (study how they pitch themselves): https://gsap.com/why-gsap/
- Webflow acquisition announcement (context for the free-plugins shift): https://webflow.com/blog/webflow-acquires-greensock

**Study before writing the plugin**
- ScrollTrigger source (a well-architected GSAP plugin): https://github.com/greensock/GSAP/blob/master/src/ScrollTrigger.js
- Flip plugin source (compact, elegant): https://github.com/greensock/GSAP/blob/master/src/Flip.js
- Sarah Drasner's "SVG Animation" course + posts (older but timeless): https://sarahdrasnerdesign.com/

### D.2 Motion (formerly Framer Motion) — the secondary integration target

**Official**
- Homepage: https://motion.dev
- GitHub: https://github.com/motiondivision/motion
- npm: https://www.npmjs.com/package/motion
- Quick start: https://motion.dev/docs/quick-start
- React docs: https://motion.dev/docs/react
- Vanilla JS `animate()` API (this is what your adapter wraps): https://motion.dev/docs/animate
- `motionValue` — the low-level primitive: https://motion.dev/docs/motion-value
- Accessibility / reduced motion: https://motion.dev/docs/react-accessibility
- LLM-friendly docs index (feed this into Claude/Copilot for coding help): https://motion.dev/llms.txt

**Study before writing the adapter**
- Matt Perry's blog (Motion's creator, deep animation-engine content): https://mattperry.is/
- GSAP vs Motion honest comparison (Motion's own take — useful positioning study): https://motion.dev/docs/gsap-vs-motion

### D.3 mo.js — the source of the ideas you're rebuilding

- Website / demos: https://mojs.github.io/
- Main repo: https://github.com/mojs/mojs
- Player repo (study for architecture, do not port): https://github.com/mojs/mojs-player
- Timeline editor repo: https://github.com/mojs/mojs-timeline-editor
- Curve editor repo (archived): https://github.com/mojs/mojs-curve-editor
- Sarah Drasner's "Introduction to mo.js" (CSS-Tricks): https://css-tricks.com/introduction-mo-js/
- Codrops "Icon animations powered by mo.js" tutorial: https://tympanus.net/codrops/2016/07/12/icon-animations/
- Original TypeScript-declarations issue (open since 2017 — the thing you're solving): https://github.com/mojs/mojs/issues/109
- "Is this library still in development?" — the official maintainer stance: https://github.com/mojs/mojs/discussions/268

### D.4 Competitor landscape — know your neighbors

- **Anime.js v4:** https://animejs.com — GitHub: https://github.com/juliangarnier/anime
- **Popmotion:** https://popmotion.io (dormant, but architecturally influential — Motion's ancestor)
- **Theatre.js** (closest philosophical match to your positioning): https://www.theatrejs.com/ — GitHub: https://github.com/theatre-js/theatre
- **Rive** (character animation, editor-first): https://rive.app/
- **Lottie web** (canned AE exports): https://airbnb.io/lottie/ — GitHub: https://github.com/airbnb/lottie-web
- **party.js** (**the closest living competitor** — modern, TypeScript-first, MIT, burst/particle-shaped; the problem statement has to survive this one): https://party.js.org/ — GitHub: https://github.com/yiliansource/party-js
- **tsParticles** (particles the crowded way): https://particles.js.org/
- **canvas-confetti** (the "one primitive done well" model to emulate): https://github.com/catdad/canvas-confetti
- **PixiJS** (WebGL, if you go there in v2): https://pixijs.com/
- **Web Animations API (MDN)** — the platform primitive Motion is built on: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- **View Transitions API (MDN)** — increasingly overlaps with UI animation libraries: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API

### D.5 The copy-paste-components ecosystem you're joining in Phase 4

- **shadcn/ui** (the pattern-setter — study the registry format): https://ui.shadcn.com/
- **shadcn registry docs** (the JSON schema your `@motly/react` needs to match): https://ui.shadcn.com/docs/registry
- **Aceternity UI** (animation-heavy competitor): https://ui.aceternity.com/
- **Magic UI** (animation-heavy competitor): https://magicui.design/
- **React Bits** (free, OSS animated components): https://reactbits.dev/

### D.6 Docs, tooling, and monorepo references

- **Astro Starlight** (docs framework option A): https://starlight.astro.build/
- **Nextra** (docs framework option B — MDX + React live demos): https://nextra.site/
- **Turborepo** docs: https://turbo.build/repo/docs
- **pnpm workspaces**: https://pnpm.io/workspaces
- **Changesets** (release automation): https://github.com/changesets/changesets
- **tsup** (zero-config lib bundler): https://tsup.egoist.dev/
- **Vitest**: https://vitest.dev/
- **Playwright** (visual regression testing): https://playwright.dev/
- **Chromatic** (visual regression SaaS, free tier): https://www.chromatic.com/

### D.7 Distribution channels — bookmark these

- **CodePen** — the single most important channel for a visual library: https://codepen.io/
- **CSS-Tricks** (article pitching for launch): https://css-tricks.com/guest-writing-for-css-tricks/
- **Codrops** (creative-dev audience, article submissions): https://tympanus.net/codrops/
- **Smashing Magazine** (write-for-us): https://www.smashingmagazine.com/write-for-us/
- **awwwards** (aspirational audience, submissions): https://www.awwwards.com/
- **JavaScript Weekly** (submit at v1.0): https://cooperpress.com/publications/
- **Frontend Focus** (submit at v1.0): https://frontendfoc.us/
- **Bytes newsletter** (submit at v1.0): https://bytes.dev/
- **Product Hunt** (launch tooling): https://www.producthunt.com/
- **Show HN guidelines** (read before posting): https://news.ycombinator.com/showhn.html

### D.8 Learning resources — read these while you build

- **Pomax's "A Primer on Bézier Curves"** — the reference for path/easing math: https://pomax.github.io/bezierinfo/
- **MDN Canvas API tutorial**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
- **MDN SVG tutorial**: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial
- **Josh W. Comeau's animation posts** (great writing style to imitate for your own blog): https://www.joshwcomeau.com/
- **Chris Coyier's "A Complete Guide to CSS Animations"** (CSS-Tricks, foundational): https://css-tricks.com/almanac/properties/a/animation/
- **School of Motion** (After Effects motion-graphics thinking — worth watching a few free videos for vocabulary): https://www.schoolofmotion.com/blog

### D.9 Community you'll want to be seen in

- **GSAP Discord**: linked from https://gsap.com/community/
- **Motion Discord**: linked from https://motion.dev
- **Reactiflux Discord** (React community): https://www.reactiflux.com/
- **r/webdev**: https://www.reddit.com/r/webdev/
- **r/reactjs**: https://www.reddit.com/r/reactjs/
- **CodePen Spark newsletter** (get featured here and traffic spikes): https://codepen.io/motly/

### D.10 Legal / OSS-hygiene templates

- **MIT license text**: https://opensource.org/license/mit
- **Contributor Covenant** (CODE_OF_CONDUCT.md standard): https://www.contributor-covenant.org/
- **Keep a Changelog** (format standard): https://keepachangelog.com/
- **Semantic Versioning**: https://semver.org/
- **All Contributors** (recognize non-code contributors — nice for community-building): https://allcontributors.org/

---

## Appendix E — Per-feature inspiration & reference libraries

For each concept in this plan, the real-world projects that already solve part of it — what to study, what to steal, what to explicitly *not* copy. Use this as a study guide while building; each entry names one specific thing worth learning from that project.

### E.1 By primitive — what to study for each

#### `Shape` — procedural shape generation
The primitive that mojs got most uniquely right: shapes are *generated* from parameters, not drawn once.

- **Two.js** — https://two.js.org/ · GitHub: https://github.com/jonobr1/two.js
  *Study:* renderer-agnostic scene graph (SVG, Canvas, WebGL from the same API). This is the exact pattern your `Shape` should use.
- **Paper.js** — https://paperjs.org/ · GitHub: https://github.com/paperjs/paper.js
  *Study:* boolean path operations and the elegance of their vector math API. Older, but the API is a masterclass.
- **SVG.js** — https://svgjs.dev/ · GitHub: https://github.com/svgdotjs/svg.js
  *Study:* chainable, fluent API for SVG manipulation. Good reference for how the SVG renderer should feel.
- **Konva.js** — https://konvajs.org/ · GitHub: https://github.com/konvajs/konva
  *Study:* Canvas scene graph with hit detection. If you add pointer/click hit-testing on shapes later, this is the reference.
- **Rough.js** — https://roughjs.com/ · GitHub: https://github.com/rough-stuff/rough
  *Study:* single-purpose library done exquisitely well. ~20k stars for essentially one primitive (hand-drawn-style shapes). Direct parallel to your positioning strategy.

#### `Burst` — the flagship primitive
The one thing you should aim to do better than anyone else.

- **canvas-confetti** — https://github.com/catdad/canvas-confetti (~11k stars, ~1M weekly downloads)
  *Study:* the single most important reference in this whole document. It is *the* proof point that "one primitive done exquisitely well" is a viable OSS strategy. Read every line. Note the API: one function, one options object, promise return, `disableForReducedMotion` flag. That's the ergonomics target. Total library is ~1k LOC.
- **mo.js `Burst`** — https://github.com/mojs/mojs/blob/master/src/components/burst.babel.js
  *Study:* the delta-syntax and child-composition model. This is what you're reimplementing modernly.
- **party.js** — https://party.js.org/ · GitHub: https://github.com/yiliansource/party-js
  *Study:* modern TypeScript-first take on particles. Cleaner architecture than tsParticles, smaller scope. Good middle-ground reference between confetti and full particle systems.
- **tsParticles** — https://particles.js.org/ · GitHub: https://github.com/tsparticles/tsparticles (~8.6k stars)
  *Study (as counter-example):* what happens when a particle library sprawls. Config-driven instead of composable, framework wrappers for every UI lib, presets in-tree, 40+ packages in the org. Do the opposite of this. It's the "everything for everyone" trap you should avoid.
- **react-rewards** — https://github.com/thedevelobear/react-rewards (~2.5k stars)
  *Study:* how a reward/celebration effect is packaged as a React hook. Minimal API surface, one job.

#### `Swirl` — path/spiral motion
Motion along a generated curve, wrapping any child element.

- **mo.js `Swirl`** — https://github.com/mojs/mojs/blob/master/src/components/swirl.babel.js
  *Study:* the sinusoidal-path composition model.
- **GSAP MotionPathPlugin** — https://gsap.com/docs/v3/Plugins/MotionPathPlugin/
  *Study:* how a mature library exposes path-based motion. Notably has a `MotionPathHelper` visual editor — worth stealing the *idea* of ergonomic path editing.
- **Anime.js `createMotionPath`** — https://animejs.com/documentation/motion-path
  *Study:* v4's take on motion paths, cleaner than v3.
- **Flubber** — https://github.com/veltman/flubber
  *Study:* interpolation between SVG paths. If `Swirl` ever needs to morph between path shapes, this is the reference algorithm.

#### `Stagger` — timing distribution
Not just linear delay — easing-controlled distribution across N children.

- **GSAP `stagger`** — https://gsap.com/resources/getting-started/Staggers/
  *Study:* the canonical API. `stagger: { each: 0.1, from: "center", grid: "auto" }`. Their grid-aware staggering is the most sophisticated in the ecosystem.
- **Motion `stagger()`** — https://motion.dev/docs/stagger
  *Study:* Motion's smaller, tree-shakeable take. Function-based instead of options-object.
- **Anime.js `stagger()`** — https://animejs.com/documentation/utilities/stagger
  *Study:* v4's rewrite. Note the axis-aware distribution — good UX signal.
- **React Spring `useTrail`** — https://www.react-spring.dev/docs/components/use-trail
  *Study:* physics-based stagger as an alternative model. Different feel — worth knowing exists even if you don't ship it.

#### `Timeline` — composition primitive
Keep this minimal — don't fight `gsap.timeline()`. Just enough to sequence your primitives.

- **GSAP Timeline** — https://gsap.com/docs/v3/GSAP/Timeline/
  *Study (as ceiling):* what a mature timeline API looks like. Your timeline is deliberately a subset. Read to understand what you're *not* building.
- **Motion `animate()` sequences** — https://motion.dev/docs/animate#timeline-sequencing
  *Study:* how Motion handles sequencing without a formal Timeline class. Function-composition instead of object-oriented. Consider adopting this style — it's more modern.
- **Theatre.js `sequence`** — https://www.theatrejs.com/docs/latest/api/core
  *Study:* the After Effects mental model applied to code. Project → Sheet → Object → Sequence. If you fully commit to the AE framing (per our earlier conversation), this is the closest philosophical match in the ecosystem.
- **Anime.js `createTimeline`** — https://animejs.com/documentation/timeline
  *Study:* v4's cleaner rewrite. Note it's function-based, not class-based.

### E.2 By adapter/package — reference implementations

#### `@motly/gsap` — GSAP plugin
Study these plugin sources in the GSAP repo before writing yours.

- **ScrollTrigger** — https://github.com/greensock/GSAP/blob/master/src/ScrollTrigger.js
  *Study:* the largest and most-installed GSAP plugin. How it hooks into `gsap.ticker`, exposes global state, handles cleanup on `.kill()`. Reference implementation for what a serious plugin looks like.
- **Flip** — https://github.com/greensock/GSAP/blob/master/src/Flip.js
  *Study:* compact plugin (~1.5k LOC), clean separation between the state-capture API and the animate-diff API. Good size target.
- **CustomEase** — https://github.com/greensock/GSAP/blob/master/src/CustomEase.js
  *Study:* how to extend GSAP's easing system. Directly relevant if you expose custom curves.
- **GSAP registerPlugin docs** — https://gsap.com/docs/v3/GSAP/gsap.registerPlugin()
  *Study:* the formal plugin registration API. Read this cover-to-cover before writing a line.
- **GSAP React hook (`useGSAP`)** — https://gsap.com/resources/React/
  *Study:* how the React integration works. Your React components should compose with `useGSAP` cleanly when GSAP is present.

#### `@motly/motion` — Motion adapter
- **Motion source** — https://github.com/motiondivision/motion
  *Study:* the `packages/framer-motion/src/animation/animate/` folder — the low-level `animate()` implementation. Your adapter wraps this. (**Path may be stale** after the Motion repo restructure — re-check before Phase 3.)
- **Motion One (predecessor)** — https://github.com/motiondivision/motionone
  *Study:* the earlier, simpler version of Motion focused purely on the WAAPI wrapper. Cleaner code to read than the current Motion, and clarifies what the base primitives *do*.
- **`motionValue` API** — https://motion.dev/docs/motion-value
  *Study:* how Motion's reactive value system works. Your adapter probably wants to output `motionValue`s that Motion timelines can subscribe to.

#### `@motly/react` — React components
- **shadcn/ui** — https://ui.shadcn.com/ · GitHub: https://github.com/shadcn-ui/ui
  *Study:* the pattern-setter for copy-paste registries. Registry schema, install CLI, component conventions. Match this exactly.
- **Registry docs** — https://ui.shadcn.com/docs/registry
  *Study:* the JSON schema your components need to conform to for `npx shadcn add burst` to work.
- **Aceternity UI** — https://ui.aceternity.com/
  *Study:* competitor in the animated-components space. Read their component source to see how they package Framer Motion + Tailwind. They are the direct precedent for your Phase 4 launch style.
- **Magic UI** — https://magicui.design/ · GitHub: https://github.com/magicuidesign/magicui
  *Study:* similar to Aceternity but more restrained. Good size reference for individual components.
- **React Bits** — https://reactbits.dev/ · GitHub: https://github.com/DavidHDev/react-bits
  *Study:* free-forever alternative. Cleaner organization, good taxonomy for browsing.
- **Tremor** — https://tremor.so/ · GitHub: https://github.com/tremorlabs/tremor
  *Study:* not animation-focused, but the gold standard for how a shadcn-adjacent component library is documented and marketed. Their docs site is the target quality bar.

#### `@motly/presets` — the effect collection
- **canvas-confetti presets** — https://www.kirilv.com/canvas-confetti/
  *Study:* the effect gallery — every preset has a runnable "run it" button. This is the interaction model for your effects gallery.
- **party.js effects** — https://party.js.org/samples
  *Study:* how effects like "confetti" and "sparkles" get named and demoed.

### E.3 By architectural concern

#### Renderer abstraction (multiple backends from one API)
- **Two.js renderers** — https://two.js.org/#renderers
  *Study:* the exact pattern. `new Two({ type: Two.Types.svg })` vs `Two.Types.canvas` vs `Two.Types.webgl`. Same scene graph, three renderers.
- **Konva stage/layer** — https://konvajs.org/docs/overview.html
  *Study:* Canvas scene graph with layers. Different mental model — worth understanding as an alternative.
- **Three.js WebGLRenderer** — https://threejs.org/docs/#api/en/renderers/WebGLRenderer
  *Study:* if you ever add a WebGL renderer (v2), this is the reference. But wait for real demand.

#### Hexagonal / ports-and-adapters in libraries
Your day-job pattern; here's what it looks like in OSS.

- **Prisma** — https://github.com/prisma/prisma
  *Study:* their query engine (core) has database-specific adapters (`@prisma/adapter-pg`, `@prisma/adapter-libsql`, etc.). Directly parallel to your renderer/adapter split.
- **tRPC** — https://github.com/trpc/trpc
  *Study:* core is transport-agnostic; adapters for Next.js, Express, Fastify, Fetch. Clean example of the same architecture pattern for a completely different domain.
- **Drizzle ORM** — https://github.com/drizzle-team/drizzle-orm
  *Study:* even cleaner adapter separation than Prisma. Read their monorepo layout.

#### Monorepo structure
- **Radix UI** — https://github.com/radix-ui/primitives
  *Study:* well-organized package-per-primitive layout. Very similar to your `packages/core`, `packages/gsap`, etc. structure.
- **Chakra UI** — https://github.com/chakra-ui/chakra-ui
  *Study:* mature Turborepo + Changesets + docs setup. Copy their `.github/` and CI configs shamelessly.
- **shadcn/ui monorepo** — https://github.com/shadcn-ui/ui
  *Study:* how they structure a monorepo where the *docs* are also the *registry source*.
- **Turborepo kitchen-sink starter** — https://github.com/vercel/turborepo/tree/main/examples
  *Study:* official reference layouts. Start here for Phase 0.

#### Docs site design
- **Radix docs** (Astro-adjacent style) — https://www.radix-ui.com/primitives/docs
  *Study:* the design bar. Clean, dark-mode-first, live examples inline, sidebar navigation done right.
- **Motion docs** — https://motion.dev/docs
  *Study:* how a competing animation library documents itself. What lives on the landing vs. in docs. Their `llms.txt` is worth stealing.
- **GSAP docs** — https://gsap.com/docs/v3/
  *Study:* the ceiling of animation-library docs. Massive but well-organized. Read to understand what people expect.
- **Astro Starlight showcase** — https://starlight.astro.build/showcase/
  *Study:* real Starlight docs sites for design references before you commit to a framework choice.

### E.4 By UX / experience pattern

#### Copy-paste-component distribution
- **shadcn CLI** — https://github.com/shadcn-ui/ui/tree/main/packages/cli
  *Study:* the actual code behind `npx shadcn add <component>`. If you want to ship your own `@motly/cli` for adding presets, this is the reference implementation.
- **Registry schema spec** — https://ui.shadcn.com/schema/registry.json
  *Study:* the exact JSON your `registry.json` needs to output.

#### Live playground in docs
- **CodeSandbox Sandpack** — https://sandpack.codesandbox.io/ · GitHub: https://github.com/codesandbox/sandpack
  *Study:* the React component that renders live editable code. Motion.dev uses this. This is what you want on every docs page.
- **StackBlitz WebContainers** — https://webcontainers.io/
  *Study:* the alternative — actually runs Node in the browser. Overkill for animation demos but useful to know.
- **RunKit / CodePen embeds** — https://codepen.io/features/embed
  *Study:* the low-tech alternative. Older but universally supported. Good fallback.

#### Reduced-motion handling done right
- **canvas-confetti's `disableForReducedMotion` model** — https://github.com/catdad/canvas-confetti#disableforreducedmotion
  *Study:* the current best-practice API. Not on by default (they admit it should be), but the shape of the option is right. Your library should default it to `true`.
- **Motion's `useReducedMotion` hook** — https://motion.dev/docs/react-use-reduced-motion
  *Study:* the React-idiomatic version.
- **MDN reduced-motion guide** — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
  *Study:* the platform primitive. Everything else is a wrapper around this.

#### Visual editors (for the Phase 6+ SaaS)
- **Theatre.js Studio** — https://www.theatrejs.com/docs/latest/manual/Studio · GitHub: https://github.com/theatre-js/theatre
  *Study:* the closest existing implementation of what you'd build. Runs in-app during dev, exports JSON state. Read the source when planning the editor's data model.
- **Rive editor** — https://rive.app/community/
  *Study:* the commercial gold-standard for browser-based motion editing. Not open source, but study the UX. Their runtime is at https://github.com/rive-app/rive-runtime (**verify the licence per repo** — the WASM runtime has historically been MIT, not Apache 2.0) — reference for how an editor's output binds to a runtime.
- **GSAP MotionPathHelper** — https://gsap.com/docs/v3/Plugins/MotionPathHelper/
  *Study:* the smallest possible "visual editor" — a single-purpose overlay. Good MVP shape if you want to ship an editor primitive before the full SaaS.
- **Cubic-bezier.com** — https://cubic-bezier.com/ · GitHub: https://github.com/LeaVerou/cubic-bezier
  *Study:* the canonical single-purpose visual editor. Lea Verou's ~500-LOC gem. If you ship a curve-editor micro-tool as a marketing piece, this is the exact size and scope target.

### E.5 Case-study sources to read cover-to-cover

Ranked by size and readability. All open source, all worth spending an evening on.

**Tier 1 — read these first (each is 1–2 evenings)**
- **canvas-confetti** — https://github.com/catdad/canvas-confetti/blob/master/src/confetti.js (~1000 LOC, single file). This is the single most important source read for you.
- **cubic-bezier.com** — https://github.com/LeaVerou/cubic-bezier (~500 LOC). Compact reference for how to ship a single-purpose visual tool.
- **rough.js** — https://github.com/rough-stuff/rough (~2k LOC). Reference for "small library, big impact."

**Tier 2 — read these before writing your adapters (~3–5 evenings each)**
- **Motion One core** — https://github.com/motiondivision/motionone/tree/main/packages/dom (Motion's simpler ancestor). Best entry point to understanding the modern animation engine architecture.
- **Anime.js v4 core** — https://github.com/juliangarnier/anime/tree/master/src (~5k LOC). Read for how to structure a modern tween engine as ES modules.
- **GSAP Flip** — https://github.com/greensock/GSAP/blob/master/src/Flip.js (~1500 LOC). Study for GSAP plugin patterns.

**Tier 3 — reference material, don't try to read end-to-end**
- **GSAP core** — https://github.com/greensock/GSAP/blob/master/src/gsap-core.js. Massive. Read specific functions when you have specific questions.
- **Theatre.js core** — https://github.com/theatre-js/theatre/tree/main/theatre/core. Large, well-architected. Reference for editor-driven library design.
- **PixiJS renderer** — https://github.com/pixijs/pixijs. Reference for eventual WebGL work.

### E.6 Aesthetic & creative inspiration

Motion graphics is visual. You need to fill your eye with references before you can build the killer demo gallery.

**Sites / galleries to browse regularly**
- **Codrops** — https://tympanus.net/codrops/ (the single best source for creative-dev inspiration)
- **Awwwards** — https://www.awwwards.com/ (site of the day/month, filter by "animation")
- **CSS Design Awards** — https://www.cssdesignawards.com/
- **httpster** — https://httpster.net/ (indie/experimental sites)
- **Godly** — https://godly.website/ (Awwwards-adjacent, curated)
- **CodePen "Popular" and "Picks"** — https://codepen.io/picks (mandatory daily browsing while building)
- **CodePen challenges** — https://codepen.io/challenges (thematic weekly prompts; great source for demo ideas)

**Individual creative devs to follow / study**
- **Bruno Simon** — https://bruno-simon.com/ (WebGL portfolio, canonical creative-dev site)
- **Sarah Drasner** — https://sarahdrasnerdesign.com/ (SVG animation authority, mo.js's original evangelist)
- **Cassie Evans** — https://www.cassie.codes/ (GSAP DevRel, best current source for SVG animation tutorials)
- **George Francis** — https://georgefrancis.dev/ (generative SVG, creative coding)
- **Josh Comeau** — https://www.joshwcomeau.com/ (blog style + micro-animations to imitate)
- **Matt Perry** — https://mattperry.is/ (Motion's creator; deep animation-engine content)
- **Emil Kowalski** — https://emilkowal.ski/ (Vercel design engineer; motion-heavy UI craft posts)

**Motion-designer channels (for AE vocabulary and creative direction)**
- **School of Motion** — https://www.schoolofmotion.com/blog (best free content on motion design fundamentals)
- **Motion Design School YouTube** — https://www.youtube.com/@motiondesignschool
- **Ben Marriott YouTube** — https://www.youtube.com/@BenMarriott (approachable AE tutorials)

**Portfolio references (things to build toward for your docs demos)**
- **Locomotive** — https://locomotive.ca/ (scroll-driven animation reference)
- **Active Theory** — https://activetheory.net/ (WebGL creative agency)
- **Resn** — https://resn.co.nz/ (interactive/motion agency)
- **Rauno Freiberg** — https://rauno.me/ (Vercel; micro-interaction craft)

### E.7 "One-primitive-done-well" model — the proof cases

Because this is your positioning strategy, here are the OSS projects that prove it works. Read *all* of these — each is a case study in narrow scope + wide adoption.

| Project | What it does | Stars | Lesson for you |
|---|---|---|---|
| **canvas-confetti** | One function: confetti burst | ~11k | The exact model you're aiming for |
| **rough.js** | Hand-drawn-style shapes | ~20k | Aesthetic niche + tiny API = massive adoption |
| **cubic-bezier.com** | Single-page bezier editor | ~2.5k | Marketing tool that also validates a UX |
| **Lenis** | Smooth scroll, one job | ~9k | Owns its lane, plays nice with everything else |
| **motion.dev's `animate`** | Sub-library (`animate` mini) | (in Motion) | Even inside a big library, tiny surface areas win |
| **`radash`, `remeda`** | Modern lodash-lites | ~13k, ~5k | Narrow, opinionated, TypeScript-first beats generalist |
| **`nanoid`** | ID generation, ~130 bytes | ~26k | Extreme scope discipline as a feature |
| **`clsx`** | Class-name joiner, tiny | ~9k | One utility, universal adoption |

**Common pattern across all of them:** one clear job, one small API surface, no scope creep, obsessive polish on the one thing. This is the shape of what you're building.

### E.8 Where to find your first users

For each channel in §5, one specific thread/place to be present in right now (start lurking in Phase 1, post in Phase 2).

- **GSAP forum** — https://gsap.com/community/forums/forum/11-gsap/ (the main GSAP forum; read for a month before posting your plugin)
- **GSAP "Showcase" subforum** — https://gsap.com/community/forums/forum/16-jobs-freelance/ (adjacent — see where people show work)
- **Motion Discord** — invite link on https://motion.dev (join, lurk, learn the vocabulary)
- **Reactiflux #animation channel** — https://www.reactiflux.com/
- **r/webdev "Showoff Saturday"** — https://www.reddit.com/r/webdev/search/?q=Showoff+Saturday (weekly thread; free reach)
- **r/reactjs weekly showoff** — https://www.reddit.com/r/reactjs/ (Sundays)
- **CodePen "Picks" nominations** — https://codepen.io/picks (get featured = massive spike)
- **Twitter/X search: "particle effect" "canvas confetti" "framer motion animation"** — real-time demand signal; look at who's asking for what you're building
