# Confirm the GSAP registration API before writing the adapter

Status: resolved

The design assumes `@motly/gsap` uses `gsap.registerEffect()` only: `gsap.effects.burst(origin, vars)` builds an Instance and returns a tween of the Instance's duration whose `onUpdate` calls `sample(tween.time())`. The tween is then the Driver (ADR-0009), so the effect nests in `gsap.timeline()` and scrubs for free. No property plugin: a property plugin animates an existing property of an existing object, and there is none here.

`product.md` §5 flags that earlier drafts said `registerPlugin()`, which registers property plugins and cannot add top-level methods. The whole Phase 2 wedge rests on getting this right.

Done when GreenSock's plugin dev guide has been read end to end, the assumption above is confirmed or corrected against it, and the outcome is recorded as an ADR in `docs/adr/`.

## Answer

Confirmed, with two corrections, in ADR-0018. `registerEffect()` is right, and `extendTimeline: true` also puts `tl.burst()` on every timeline. The adapter is still passed to `gsap.registerPlugin()`, as an object whose `register(core)` hook calls `core.registerEffect()`, not as a property plugin. An effect's first argument is `targets`, run through `toArray()`, so `gsap.effects.burst(origin, vars)` does not fit; what `targets` means is for the Phase 2 spec.

GreenSock no longer publishes a plugin-authoring guide, so this was read from gsap 3.15.0's source (`gsap-core.js`) and the `gsap.registerEffect()` docs page, not a guide end to end.
