# Confirm the GSAP registration API before writing the adapter

Status: ready-for-human

The design assumes `@motly/gsap` uses `gsap.registerEffect()` only: `gsap.effects.burst(origin, vars)` builds an Instance and returns a tween of the Instance's duration whose `onUpdate` calls `sample(tween.time())`. The tween is then the Driver (ADR-0009), so the effect nests in `gsap.timeline()` and scrubs for free. No property plugin: a property plugin animates an existing property of an existing object, and there is none here.

`product.md` §5 flags that earlier drafts said `registerPlugin()`, which registers property plugins and cannot add top-level methods. The whole Phase 2 wedge rests on getting this right.

Done when GreenSock's plugin dev guide has been read end to end, the assumption above is confirmed or corrected against it, and the outcome is recorded as an ADR in `docs/adr/`.
