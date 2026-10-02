# 01: A glyph Element for text and emoji

**What to build:** A `Shape` kind that draws one character or emoji, so a Burst can throw 🎉 or letters without anyone hand-drawing a `d` string. Raised by instinct on 2026-10-01, not by a user request or a blocked example. Parked post-v1 (ADR-0007); not a Phase 3 candidate.

**Blocked by:** None.

**Status:** needs-triage

Leaning, not decided:

- `kind: 'glyph'`, with `char` distributable (`each(['🎉', '✨'])`), `font` as one CSS font string, and `radius` as half the em size, like the other kinds.
- The draw record carries `char` and `font` (ADR-0013); Canvas uses `fillText`, SVG a `<text>`.
- Font loading is the caller's job, documented, never done by core.
- Glyph metrics and emoji artwork differ by OS, so centring is approximate. Snapshot glyphs on the CI platform only; keep emoji out of the visual-regression suite (ADR-0003).

Questions for triage:

- What evidence promotes this: user requests, the ticket-19 readout, a planned Preset (`Confetti`, `HeartBurst`, `Sparkle`) that cannot be built without it, or any of these.
