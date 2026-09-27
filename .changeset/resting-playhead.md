---
'@motly/core': minor
---

Export `isMotionReduced(setting)`, which says whether a `ReducedMotion` setting calls for the Resting frame now, reading the viewer's preference for `'user'`. Add `restingPlayhead` to every Instance: the Playhead, in seconds, of its Resting frame, `restAt` × `duration`, or `duration` when `restAt` is left out. Together they let an adapter whose host moves the Playhead, such as GSAP's, show what reduced motion shows without reaching into core.
