# 03: Stroke draw-on

**What to build:** An animated property that draws an Element's outline on or off, the way After Effects' trim paths do. Raised by instinct on 2026-10-01. Parked post-v1 (ADR-0007); not a Phase 3 candidate.

**Blocked by:** None.

**Status:** needs-triage

Leaning, not decided:

- `trimStart` / `trimEnd`, 0–1, matching the After Effects vocabulary of `product.md`'s motion-designer persona, over `draw`.
- Every kind, `path` included. SVG gets it free from `pathLength="1"` and a dash offset. Canvas has no `getTotalLength`, so core computes each kind's perimeter, and a custom path's arc length, itself: moderate work, no dependency.

Questions for triage:

- Whether `path` is in scope for the first cut, given the arc-length cost.
- What evidence promotes this (see 01).
