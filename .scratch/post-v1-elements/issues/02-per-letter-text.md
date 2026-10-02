# 02: Per-letter text built from glyphs

**What to build:** Text the library generates, one glyph per letter, so a word can assemble from a burst or scatter into one. Raised by instinct on 2026-10-01. Parked post-v1 (ADR-0007); not a Phase 3 candidate.

**Blocked by:** 01

**Status:** needs-triage

Questions for triage:

- Where it lives. A Burst places Children by angle and radius; letters need a baseline.
  - A Preset: a Timeline of glyph Shapes with x offsets computed up front. No core change; fits "everything else is a Preset". Letter spacing without font metrics is rough. (Leaning.)
  - A Burst option such as `layout: 'line'`. Fallback if the Preset looks wrong.
  - A new Emitter. Breaks "`Burst` is the Emitter primitive" and ADR-0010.
- What evidence promotes this (see 01).
