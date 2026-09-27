---
'@motly/gsap': minor
---

`gsap.effects.shape()` and `tl.shape()` draw one Element, a ring, a star or a single spark, from each target, and behave as `burst` does for time, targets and cleanup. All four entry points are typed: importing `@motly/gsap` teaches GSAP's `effects` and `Timeline` types that `burst` takes a `BurstSpec` and `shape` a `ShapeSpec` of the `kind` given, with `seed`, `container`, `renderer` and `reducedMotion` beside GSAP's own tween vars. `BurstVars`, `ShapeVars`, `MotlyVars` and `RendererName` are exported. `keyframes`, `startAt`, `runBackwards` and `stagger` are rejected by the types and, given anyway, ignored with one warning per registration. An invalid Spec throws core's validation message at the effect call.
