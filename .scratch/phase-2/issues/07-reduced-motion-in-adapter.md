# 07: Reduced motion in the adapter

**What to build:** A viewer who prefers reduced motion sees the burst's still Resting frame instead of motion, while the tween keeps its full duration so everything sequenced after it keeps its timing (ADR-0012). The preference is read at each start from 0 moving forward, so changing the OS setting takes effect without a reload; `vars.reducedMotion` forces either behaviour. Uses only the two core exports from ticket 01. Spec: `.scratch/phase-2/spec.md`, "Reduced motion".

**Blocked by:** 01, 02

**Status:** resolved

- [x] With reduced motion forced on through `vars.reducedMotion`, every progress between the ends paints the Resting frame.
- [x] The tween's duration is the same with and without reduced motion.
- [x] Forced off, the burst moves even when the viewer prefers reduced motion.
- [x] The preference is re-read on each forward start.
- [x] The adapter imports nothing from core beyond its public entry.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

Resolved: `vars.reducedMotion`, `'user'` by default, is read with core's `isMotionReduced()` where the Anchor is read (ticket 03's rule: when the tween leaves its very start, or on its first draw if a scrub brings it in mid-way). Until the next such start, every draw between the ends seeks each Instance to its `restingPlayhead` instead of `ratio` × its duration; mount and release still follow the tween's progress, and the tween's length is untouched. The Instances keep core's default `reducedMotion`, which `seek()` never consults, so `'never'` forces motion. Only `isMotionReduced`, `ReducedMotion` and `Instance.restingPlayhead` are used from core.

Left as they are:

- A repeat is not a start, so a burst with `repeat: -1` keeps the preference it started with until it is restarted or reverted. Re-reading on each repeat would move the rule away from the Anchor's; decide if an endlessly repeating burst should follow a changed setting.
- Under reduced motion every GSAP tick redraws the same Resting frame, so a canvas repaints it each frame. Cheap for a burst; skip the redraw if a large one shows it.
- Invariant 6: core's Timeline already decides reduced motion at its start and draws `restingPlayhead`; the adapter repeats that small rule. Move it into core if the Motion adapter needs it too.

Decided 2026-09-30: a burst with `repeat: -1` keeps the preference it started with until it is restarted or reverted, as core's Timeline does and as the README already says. Recorded in the spec's "Reduced motion".
