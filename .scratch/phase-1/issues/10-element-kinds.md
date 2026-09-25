# 10: The remaining Element kinds, with discriminated types

Status: ready-for-agent
Blocked by: 01

**What to build:** A developer can use every v1 Element kind — polygon, star, cross, line, zigzag and custom path, alongside circle — and the compiler rejects a property that does not belong to the kind (Invariant 9).

- [ ] Each kind has its own parameters in the Spec, and a type-level test proves `Shape<'polygon'>` requires `points` while `Shape<'circle'>` rejects it.
- [ ] Draw records carry each kind's parameters, not geometry. A custom path's geometry lives in the Spec and the record references it (ADR-0013).
- [ ] `SVGRenderer` draws every kind, updating attributes on a live element rather than rebuilding it each frame.
- [ ] `apps/demos` shows every kind.
