# 24: Docs: Spec reference — values

**What to build:** What a Spec field can hold, documented once and linked from every field that takes it. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 62.

**Blocked by:** 21

**Status:** resolved

- [x] Keyframes: an array animates from value to value (ADR-0008).
- [x] Descriptors: `rand` and `each`, where they are allowed, and how a Seed makes them repeatable.
- [x] Units and colors: which fields take which units, and every accepted color form.
- [x] Curves: the named curves, cubic-bezier, SVG path curves, and `easing` per property.
- [x] A live example for each, with a fixed `seed` where the example uses `rand`.
- [x] The anchors the Shapes and Burst pages already link to exist: `#keyframes`, `#descriptors`, `#colors` and `#curves`.

## Comments

Done 2026-09-30. `reference/values` covers Keyframes, `rand` and `each` with the Seed between them, units, colors and Curves, with seven `val-*` examples; all drew in headless Chrome 154 with no errors. The claims were checked against the code: lengths take only `px`; `count`, `points` and `restAt` take no `rand()`; a Keyframe color must be named, hex, `rgb()` or `rgba()` (`validate.ts`), so `'none'` cannot be one; colors mix all four channels together; `bounce` and `elastic` are path curves and the other named curves cubic-beziers.
