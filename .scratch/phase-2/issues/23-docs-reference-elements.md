# 23: Docs: Spec reference — Elements

**What to build:** Every field of every Element documented, with a live example beside it. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 62.

**Blocked by:** 21

**Status:** ready-for-agent

- [ ] Shapes: the fields every Shape takes, then one section per kind (`circle`, `polygon`, `star`, `cross`, `line`, `zigzag`, `path`) with its own fields. The source of truth is `ShapeParams` and `ShapeCommon` in `packages/core/src/spec.ts`.
- [ ] The Burst Emitter: `count`, `radius`, `stagger`, `delay`, `restAt`, `easing`, `children`, and a Burst as a Child of a Burst.
- [ ] The Swirl Modifier: `size`, `frequency`, `direction`, `child`, and why it is reached only through a Burst's `children`.
- [ ] One live example per kind and per Emitter and Modifier, at least.
- [ ] Terms as in `CONTEXT.md`: Element, Emitter, Modifier, Child.
