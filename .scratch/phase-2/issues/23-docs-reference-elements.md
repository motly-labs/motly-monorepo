# 23: Docs: Spec reference — Elements

**What to build:** Every field of every Element documented, with a live example beside it. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 62.

**Blocked by:** 21

**Status:** resolved

- [x] Shapes: the fields every Shape takes, then one section per kind (`circle`, `polygon`, `star`, `cross`, `line`, `zigzag`, `path`) with its own fields. The source of truth is `ShapeParams` and `ShapeCommon` in `packages/core/src/spec.ts`.
- [x] The Burst Emitter: `count`, `radius`, `stagger`, `delay`, `restAt`, `easing`, `children`, and a Burst as a Child of a Burst.
- [x] The Swirl Modifier: `size`, `frequency`, `direction`, `child`, and why it is reached only through a Burst's `children`.
- [x] One live example per kind and per Emitter and Modifier, at least.
- [x] Terms as in `CONTEXT.md`: Element, Emitter, Modifier, Child.

## Comments

Done 2026-09-30. Three pages under `reference/`: Shapes (the common fields, then one section per kind with a field table), Burst (fields, mixed Children with `each`, a Burst of Bursts) and Swirl. Twelve `ref-*` examples, each repeating forever through GSAP's `repeat: -1` so it can be watched without a click; all drew in headless Chrome 154 with no errors.

The tables take their wording and defaults from the doc comments in `packages/core/src/spec.ts` and the defaults in `resolve.ts`. The pages link ahead to anchors tickets 24 and 25 must create: `values/#keyframes`, `#descriptors`, `#colors`, `#curves`, and `time/#stagger`, `#the-resting-frame`.
