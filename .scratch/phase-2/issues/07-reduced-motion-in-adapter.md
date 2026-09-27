# 07: Reduced motion in the adapter

**What to build:** A viewer who prefers reduced motion sees the burst's still Resting frame instead of motion, while the tween keeps its full duration so everything sequenced after it keeps its timing (ADR-0012). The preference is read at each start from 0 moving forward, so changing the OS setting takes effect without a reload; `vars.reducedMotion` forces either behaviour. Uses only the two core exports from ticket 01. Spec: `.scratch/phase-2/spec.md`, "Reduced motion".

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] With reduced motion forced on through `vars.reducedMotion`, every progress between the ends paints the Resting frame.
- [ ] The tween's duration is the same with and without reduced motion.
- [ ] Forced off, the burst moves even when the viewer prefers reduced motion.
- [ ] The preference is re-read on each forward start.
- [ ] The adapter imports nothing from core beyond its public entry.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.
