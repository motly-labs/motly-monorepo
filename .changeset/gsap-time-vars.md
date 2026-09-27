---
'@motly/gsap': minor
---

Top-level `vars` on `gsap.effects.burst()` and `tl.burst()` mean what they mean in any GSAP tween. `duration` stretches or squeezes the whole burst; `ease` warps its time, and is `'none'` unless given, so a Spec runs at its own pace; `delay` holds back the whole burst, while `spec.delay` keeps offsetting it inside; `repeat` and `yoyo` repeat the same burst. `onStart`, `onUpdate` and `onComplete` are called exactly as GSAP calls them. An ease that overshoots, such as `back.out`, keeps the burst drawn through the overshoot.
