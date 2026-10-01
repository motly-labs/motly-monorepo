# CLAUDE.md

Project-specific rules for `motly`. Merge with the global guidelines in
`~/.claude/CLAUDE.md` — this file adds the domain rules, it does not replace them.

## What this is

`motly` (working codename) is a **procedural motion-graphics library for the web**:
bursts, swirls, generated shapes, declarative parametric animation. It occupies the
gap between a canned-animation player (Lottie) and a creative-coding framework
(Pixi, Three). GSAP, Motion and anime.js animate *existing* DOM; `motly` *generates*
the thing being animated.

One engine, several distribution surfaces. v1 ships two: `@motly/core`
(standalone) and `@motly/gsap` (plugin). `@motly/motion`, `@motly/react` and
`@motly/presets` are post-v1 placeholders — see ADR-0007.

## Status

Phase 2 in progress. Phase 1's engine is done: Shape, Burst and Swirl, `rand`/`each`
Descriptors, colors, units, Keyframes, easing, stagger, playback, Timeline, reduced motion, Spec
validation, and the SVG, Canvas and auto Renderers. Phase 2 added `@motly/gsap`, Burst aiming
(aim, spread, orient) and the docs site. `@motly/core` and `@motly/gsap` are on npm. What remains
is mostly launch work for a human. The Status line of each ticket in `.scratch/phase-*/issues/`
says what is done and what is next. `motion`, `react` and `presets` hold placeholders.

## Read CONTRIBUTING.md first

`CONTRIBUTING.md` holds the rules humans and agents share: setup and commands, the repo layout,
the documents of record, the architecture invariants, code conventions, testing and releases.
Read it before proposing scope or writing code. Breaking an architecture invariant is a design
change, not a refactor — raise it before writing the code.

Run `pnpm lint && pnpm typecheck && pnpm test` before declaring work done.

## Don't

- **Don't add a runtime dependency to `@motly/core`.** Ask first, every time.
- **Don't add a sixth package** when a subpath export works. `@motly/core/utils` is
  the precedent.
- **Don't scaffold a new app** until the phase that funds it starts. `apps/playground` is
  funded by no phase at all.
- **Don't copy mojs or canvas-confetti source** without adding a `NOTICE` entry. Both
  are MIT: the ideas are free, the code carries a copyright notice.
- **Don't bump `typescript` or `tsdown`** without running the full build. tsdown warns
  that the TS 7 API is experimental — see ADR-0005 for the standing risk.
- **Don't quote competitor metrics** (download counts, star counts) from `product.md`
  without re-verifying. Several are flagged as inflated in-doc.
- **Don't widen v1 scope.** The plan already commits to more than the effort argument
  that killed the mojs rewrite allows. New ideas go in `.scratch/` as tickets.
- **Don't co-author any commits**

## Agent skills

### Issue tracker

Local markdown under `.scratch/<feature>/`, one file per ticket. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as `Status:` lines. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
