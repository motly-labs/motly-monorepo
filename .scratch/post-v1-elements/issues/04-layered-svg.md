# 04: Multi-part SVG

**What to build:** An Element drawn from several paths with their own colours, so a pasted icon or logo is not limited to one `d` and one fill. Raised by instinct on 2026-10-01. Parked post-v1 (ADR-0007); not a Phase 3 candidate.

**Blocked by:** None.

**Status:** needs-triage

Leaning, not decided:

- A new kind taking `layers: [{ d, fill?, stroke? }]` in the same 100×100 box as `path`. Layer colours are static; the Shape keeps transform and opacity.

Rejected while grilling:

- Animated per-layer colour: multiplies the easing map per layer.
- Raw SVG markup: needs a parser in a dependency-free core.
- Path morphing (between `d` strings): a library of its own.

Questions for triage:

- How the Shape's own `fill` and `stroke` combine with a layer's: fallback for a layer that leaves them out, or ignored.
- What evidence promotes this (see 01).
