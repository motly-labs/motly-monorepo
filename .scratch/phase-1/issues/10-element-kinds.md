# 10: The remaining Element kinds, with discriminated types

Status: ready-for-agent
Blocked by: 01, 03

**What to build:** A developer can use every v1 Element kind — polygon, star, cross, line, zigzag and custom path, alongside circle — and the compiler rejects a property that does not belong to the kind (Invariant 9).

- [ ] Each kind has its own parameters in the Spec, and a type-level test proves `Shape<'polygon'>` requires `points` while `Shape<'circle'>` rejects it.
- [ ] Draw records carry each kind's parameters, not geometry. A custom path's geometry lives in the Spec and the record references it (ADR-0013).
- [ ] `SVGRenderer` draws every kind, updating attributes on a live element rather than rebuilding it each frame.
- [ ] One Burst can mix kinds: `children` accepts `each([...Child Specs])`, handing successive Child Specs to successive Children, each still typed by its own `kind`. `kind: each([...])` alone is not the way in: it would let a circle Child carry `points`.
- [ ] `apps/demos` shows every kind, and one Burst mixing several.

## Comments

**Note from the post-ticket-05 audit.** A new kind now touches three places that must agree: its parameters in `ShapeParams` (`spec.ts`), its fields in `FIELDS` (`validate.ts`, which also lists the property names its `easing` map may use), and the Resolver, whose `ResolvedElement` is still circle-only. Consider deriving the first two from one table here.
