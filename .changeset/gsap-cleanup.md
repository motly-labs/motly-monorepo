---
'@motly/gsap': minor
---

A burst never outlives its tween. `tween.kill()`, `tween.revert()`, `tl.revert()` and a `gsap.context()`'s `revert()`, and so `useGSAP` on unmount, clear a burst mid-flight, and an `onInterrupt` in `vars` is still called, after the clear. `tl.kill()` on a parent timeline reaches nothing on its children and leaves a burst mid-flight drawn: kill or revert the burst's own tween, or revert a context, instead.
