---
'@motly/core': minor
---

Add `Burst`, the first Emitter: `count` Children placed evenly by angle around the Origin at an animatable `radius`. A Child may be a `Shape` or another `Burst`, to any depth. A Burst has no duration of its own; it lasts as long as its longest-running Child. Create one with `scope.burst(spec, binding)` or `new Burst(spec, binding)`.
