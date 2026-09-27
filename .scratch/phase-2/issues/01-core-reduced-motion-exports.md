# 01: Core exports `isMotionReduced` and the Resting frame's Playhead

**What to build:** Prefactoring for the adapter (Invariants 6 and 7). `@motly/core` gains two public exports, so `@motly/gsap` can honour reduced motion without reaching into core internals: `isMotionReduced(setting)`, which resolves a `ReducedMotion` setting against the viewer's preference, and a read-only property of Instance giving the Resting frame's Playhead in seconds. The property's name must not be confused with the Spec's `restAt`, which is a progress. Spec: `.scratch/phase-2/spec.md`, "Reduced motion".

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] `isMotionReduced` is exported from core's public entry, with a doc comment saying when to reach for it.
- [x] Instance exposes the Resting frame's Playhead in seconds, read-only, as `restingPlayhead`. It agrees with what a reduced-motion Instance draws: it is `restAt` × duration, and the duration when `restAt` is omitted.
- [x] Tested through core's public entry with the manual Driver; core stays at or above 85% coverage.
- [x] A changeset for `@motly/core`.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.
