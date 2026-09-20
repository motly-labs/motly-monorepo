# mo.js Exploration - Honest Assessment & Feasibility Report

> **Prepared for:** Mo
> **Date:** September 2026
> **Question:** Should I rewrite mo.js in TypeScript and finish its pending features?
> **Short answer:** No - not as a straight rewrite. Do a *smaller, sharper* thing instead. Details below.

---

## 1. TL;DR - the brutal version

You are looking at a **2015-era SVG animation library** with a **CoffeeScript legacy**, a **founder who stepped away in 2019**, and **two caretaker maintainers doing bare-minimum dependency bumps on their free time**. Meanwhile:

- **GSAP went 100% free in April 2025** (including all bonus plugins). The paid-license moat that used to make mojs attractive is gone.
- **Motion (ex-Framer Motion) benchmarks ~2.5-6x faster than GSAP** on modern value-type animations, and it's already TypeScript-first.
- **Anime.js v4 shipped a full rewrite** in 2024-2025, is written in modern JS, ~9 kB, ~65k GitHub stars (mojs has ~18.7k).
- **mo.js weekly downloads: ~33.8k for `@mojs/core`**, **97/month for `@mojs/player`**, **21/month for `@mojs/curve-editor`**. The tooling nobody's using.

A full TypeScript rewrite of all 4 repos + implementing the pending features is realistically a **6-12 month solo effort** for a project entering a market where three well-funded, TypeScript-native competitors already own the mindshare. The ROI, brutally, is bad.

**But** - there is a genuinely interesting, career-visible thing you can build *inspired by* mojs. That's in §7.

---

## 2. Current state of the mo.js ecosystem

### The 4 repos and their vitals

| Repo | Purpose | Last release | Weekly npm DL | Health |
| --- | --- | --- | --- | --- |
| `mojs/mojs` (`@mojs/core`) | Core animation engine | v1.7.1, over 1 year ago | ~33.8k | Maintenance mode |
| `mojs/mojs-player` (`@mojs/player`) | GUI player to scrub animations | v1.3.0, over 1 year ago | ~25 (97/mo) | Effectively dead |
| `mojs/mojs-curve-editor` (`@mojs/curve-editor`) | Visual easing curve editor | v1.7.1, over 4 years ago | ~5 (21/mo) | Effectively dead |
| `mojs/mojs-timeline-editor` | Visual timeline editor | Unreleased on npm | n/a | Dev-only |

### Governance reality

The founder **Oleg Solomka (LegoMushroom)** stepped back in 2019. Since then the project has been maintained by **Xavier Foucrier** and **Sandstedt**. In their own words (from an official discussion on the repo):

> "The MoJS project is not currently in 'active' / 'intensive' development, but it is not archived. We work on the project on our free time, have no sponsors since the beginning, are working together in private companies and finally are working on other open source projects too."

**Translation:** they will happily merge a PR that keeps the lights on. They will not commit to a rewrite. A hostile fork is your only path to controlling the direction.

### The codebase

- **Legacy origin: CoffeeScript.** The core has been partially migrated to ES6, but the internal shapes/architecture still smell of the CoffeeScript era (heavy prototype chains, magic string configs, non-standard event model).
- **SVG-first rendering** with some HTML. **No Canvas, no WebGL, no OffscreenCanvas, no WAAPI.** In 2026 that's a limitation, not a feature.
- **59 dependencies, 30 outdated, 6 deprecated** at last audit (Cloudsmith package health score: high complexity).
- **Zero official TypeScript support** - issue #109 has been open **since January 2017**. Community `.d.ts` attempts exist (@ao21, @ronanbrett on DefinitelyTyped) but are incomplete and drift from the current API.

---

## 3. The competitive landscape has moved on

This is the part you need to internalize before spending months of your life.

### GSAP (GreenSock)

- **The default for serious web animation.** Timeline, ScrollTrigger, Flip, SplitText, MotionPath, Draggable - no real equivalent anywhere else.
- **v3.13 (April 2025): 100% free, including bonus plugins.** The single biggest reason developers used to look for alternatives (paid plugins) - gone.
- TypeScript definitions are official and complete.
- Framework-agnostic. Runs everywhere. Massive community.

### Motion (formerly Framer Motion)

- **Rebranded to just "Motion" in mid-2025.** Now covers vanilla JS, React, and Vue - no longer React-only.
- **Written in TypeScript from day one.**
- Uses the **Web Animations API under the hood** - hardware-accelerated, ~2.5x faster than GSAP at animating from unknown values, ~6x faster between different value types.
- Best-in-class React ergonomics: `AnimatePresence`, layout animations, gestures.
- Tiny bundle (`animate` mini function ~2.6 kB).

### Anime.js v4

- Complete rewrite in 2024-2025. Modern ES modules, tree-shakeable.
- **~65k GitHub stars vs mojs's 18.7k.**
- Simple, intuitive API - the "easy on-ramp" competitor.
- Timelines, SVG, stagger, WAAPI-friendly.

### The others worth knowing

- **Native CSS + WAAPI** - increasingly handles what libraries used to. `View Transitions API` and `scroll-driven animations` are shipping. For fades, keyframes, hover states - zero runtime is a real answer now.
- **React Spring** - physics-based, still relevant in React.
- **Lenis** - the smooth-scroll layer everyone pairs with GSAP/Motion.
- **Lottie** - for pre-designed After Effects exports; different problem space.

### Where does mo.js actually still shine?

Honestly, one niche: **particle/burst effects with declarative composition**. `Burst`, `Swirl`, and the delta-based property tweening for radial explosions are genuinely nicer to author in mojs than in GSAP or Motion. That is a real thing.

But it's one shape of one problem, and you can rebuild that specific primitive in a weekend on top of Motion or WAAPI without inheriting 10 years of CoffeeScript baggage.

---

## 4. Pending features & open issues - the concrete list

From `mojs/mojs` issues, this is what's actually open and would need doing in your rewrite:

### Feature requests (never shipped)

- **#109 - TypeScript declarations / usage** (open since Jan 2017). The one you'd solve by definition.
- **#216 - `prefers-reduced-motion` support.** Should be table stakes in 2026; embarrassingly still not there.
- **#221 - Promise / async/await support** for animation completion. Every modern library has this.
- **#250 - Global time unit setting** (ms vs s). Ergonomic gap.
- **#258 - Better custom shape instantiation API.** Current API is awkward.
- **#144 - Proper `.destroy()` for `Burst`.** Memory leak risk in SPAs.
- **#114 - Multiple color tweens on same target.** A tween-model limitation.

### Bugs (unresolved)

- **#276 - Tween plays twice rapidly inside a Timeline** (race condition).
- **#256 - `.then()` throws `Cannot read property '4' of null`** (chained tween bug).
- **#246 - `Burst` count with `rand()` behaves weirdly.**
- **#124 - `onComplete` on `Html` constructor doesn't fire `isForward` correctly.**
- **#122 - Shape flash on hover.**

### Structurally missing in 2026

Even if all of the above landed, these are the gaps against modern libraries:

- No **ScrollTrigger equivalent** (scroll-linked animations).
- No **Flip / FLIP-style layout animations**.
- No **WAAPI backend** (still uses `requestAnimationFrame` + manual DOM/SVG writes).
- No **Canvas or WebGL renderer** - SVG hits a performance wall around 200-500 animated shapes.
- No **`OffscreenCanvas` / worker rendering.**
- No **spring physics** (only bezier easings + custom curves).
- No **gesture integration** (drag/pinch/pan).
- No **React / Vue / Svelte bindings** (huge friction for the framework crowd).
- No **SSR-safe API.**
- No **tree-shakeable ESM entry points** - the core is largely all-or-nothing.
- **Player and Curve Editor are jQuery/Riot-era React** - the tooling code is older than the core code.

That is a *lot* to catch up on. Every one of those is table stakes for a new animation library in 2026.

---

## 5. What a full TypeScript rewrite would actually cost you

Being honest with yourself:

| Effort item | Realistic solo estimate |
| --- | --- |
| Read + understand current CoffeeScript-origin core | 2-4 weeks |
| Port `@mojs/core` to strict TS (with tests) | 8-12 weeks |
| Fix the known bugs (#276, #256, #246, #124, #122) | 2-3 weeks |
| Implement pending features (#216, #221, #250, #258, #144, #114) | 3-4 weeks |
| Port `@mojs/player` | 3-6 weeks (React rewrite) |
| Port `@mojs/curve-editor` | 3-6 weeks (React rewrite) |
| Port `@mojs/timeline-editor` | 4-8 weeks (React rewrite) |
| Modern build/tooling (Vite, Vitest, tsup, changesets, docs site) | 2-3 weeks |
| Docs, migration guide, examples | 3-4 weeks |
| **Total** | **~30-50 weeks solo, part-time** |

And that gets you a **feature-parity TypeScript port**. It does **not** get you Canvas rendering, WAAPI, ScrollTrigger equivalent, React bindings, or spring physics - the things that would actually make it competitive in 2026.

To do those too: **add another 6-12 months.**

### The opportunity cost

You're a Senior Fullstack Engineer at Nationale-Nederlanden aiming toward team lead / mentoring work. A year spent shipping a niche animation library - and then having to market it against GSAP-that-just-went-free - is a year you didn't spend on things that more visibly signal senior/lead capability (systems design, architecture write-ups, mentoring content, a smaller-but-shipped OSS tool people actually adopt).

---

## 6. Should you do it anyway? A decision matrix

| If your goal is… | Then the mojs rewrite is… |
| --- | --- |
| "I want to deeply learn animation engine internals" | ✅ Great learning project. Fork core only, don't publish. |
| "I want a portfolio piece showing serious TS/architecture work" | ⚠️ Overkill - a smaller, sharper library shows the same skill and actually ships. |
| "I want an OSS library that gets adopted" | ❌ Very unlikely in this market. |
| "I want to become the maintainer of mojs" | ⚠️ Talk to Xavier/Sandstedt first. A fork without their blessing splits the community. |
| "I want to build something my team lead application talks about" | ❌ Too niche. Pick something with clearer business framing. |
| "I love the burst/particle primitive and there's nothing like it" | ✅ But only rebuild *that* - not the whole library. |

---

## 7. What I'd actually build instead

Ranked by "shippable value in 2-3 months of nights and weekends":

### Option A - `burst-ts`: a modern TypeScript burst/particle micro-library (RECOMMENDED)

- **Scope:** Just the `Burst` + `Swirl` primitives from mojs, rebuilt from scratch in TS.
- **Backend:** Canvas 2D by default, optional SVG fallback, `OffscreenCanvas` when supported.
- **API:** Declarative like mojs, but promise-based, tree-shakeable, `prefers-reduced-motion` aware.
- **Adapters:** Thin React and Vue wrappers.
- **Why:** Solves the one thing mojs actually still does uniquely well, in a modern package, in **~2-3 months**. Fits nicely alongside GSAP/Motion in a project rather than trying to replace them. Positioning: *"the burst effect nobody else has, drop-in."*

### Option B - Visual timeline/curve editor for GSAP or Motion

- **Scope:** Take the *idea* of `mojs-timeline-editor` and `mojs-curve-editor` and rebuild them as a modern web app that outputs GSAP or Motion code.
- **Why:** There is a **real gap** here. GSAP is now free but doesn't ship a visual editor. Motion doesn't either. Designers-turned-developers repeatedly ask for one.
- Ships as a web app + a tiny runtime helper library.
- Much more likely to get organic traction than yet-another-animation-lib.

### Option C - Contribute to Motion or Anime.js v4

- **Scope:** Pick 2-3 real issues on `motion` or `animejs` and land them.
- **Why:** Visible OSS contribution to a library people actually use. Faster credibility signal than a solo library nobody adopts. Great résumé line for team-lead moves.

### Option D - A "mojs-inspired" architecture write-up

- **Scope:** Deep post-mortem blog series: *"What mojs got right, what it got wrong, and how I'd design a motion graphics library in 2026."* Include benchmarks against GSAP/Motion.
- **Why:** Ships in weeks, not months. Directly showcases senior thinking (exactly what team-lead promotions look at). Doubles as marketing if you later build Option A.

---

## 8. If you're still going to do the rewrite anyway - do it smart

If you've read all of the above and still want to do it (which I respect), do it with these guardrails:

1. **Talk to Xavier Foucrier and Sandstedt first.** Open a discussion titled "TypeScript rewrite proposal - governance question." Ask if they'd accept an incremental TS migration inside `mojs/mojs`, or if a friendly fork is preferred. Don't surprise them.
2. **Do NOT rewrite all 4 repos.** Rewrite core only. Deprecate `mojs-player` and both editors - nobody's using them (25 and 5 weekly downloads). If the tooling matters, rebuild it later as an entirely separate modern app (see Option B above).
3. **Set a hard scope for v1:**
   - Strict TypeScript, ESM-first, tree-shakeable.
   - Backends: SVG (parity) + Canvas 2D (new). No WebGL in v1.
   - `prefers-reduced-motion` native.
   - Promise-based `.then()`, `async/await` friendly.
   - Fix the 5 known bugs.
   - Skip: player, curve-editor, timeline-editor.
4. **Vendor the CoffeeScript-origin JS as reference, don't port line-by-line.** Reimplement each module from its tests + docs. You'll end up with a cleaner architecture and it's actually faster.
5. **Use hexagonal / ports-and-adapters** (which you already do at NN). The renderer is an adapter - SVG today, Canvas tomorrow, WebGL later. This is the *one* place the rewrite genuinely improves on the original.
6. **Ship a migration guide from `@mojs/core@1.x`.** If existing users can't `npm install` and mostly work, the fork dies.
7. **Timebox to 3 months for v1-alpha.** If you're not shipping usable alpha by month 3, cut scope again or stop.
8. **Name it something new.** `mojs-next`, `burst-ts`, `mojs-modern` - whatever. Do not squat the mojs name if the original maintainers haven't handed it over.

---

## 9. Recommendation

Don't do the full rewrite.

Do **Option A (`burst-ts`)** or **Option B (visual editor for GSAP/Motion)**. Either one:

- Ships in 2-3 months, not 12.
- Solves a real gap the modern ecosystem has.
- Uses everything you'd learn from reading the mojs internals *anyway*.
- Is small enough to actually finish alongside a demanding day job.
- Shows senior-level scoping judgment - which is the actual signal that gets people team-lead roles.

And pair it with **Option D** - write up what you learned reading the mojs codebase. That post alone is worth more to your career than the rewrite would be.

---

## 10. References & sources

- mojs GitHub: <https://github.com/mojs/mojs>
- mojs website: <https://mojs.github.io/>
- Discussion #268 - "Is this library still in development?" - official maintainer statement
- Issue #109 - TypeScript declarations (open since 2017)
- npm `@mojs/core`, `@mojs/player`, `@mojs/curve-editor` - download stats via ecosyste.ms and Cloudsmith
- GSAP 100%-free announcement - v3.13, April 2025
- Motion (ex-Framer Motion) docs and benchmarks - motion.dev
- Anime.js v4 - animejs.com
- ICS MEDIA 2026 animation library comparison
- Annnimate 2026 GSAP alternatives comparison
