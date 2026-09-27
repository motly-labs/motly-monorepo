---
'@motly/gsap': minor
---

Initial release: motly's bursts as GSAP effects. After `gsap.registerPlugin(Motly)`, `gsap.effects.burst(target, { spec })` and `gsap.effects.shape(target, { spec })` return ordinary tweens, and `tl.burst()` and `tl.shape()` place them in a timeline with GSAP's position parameter.

- **GSAP's vocabulary.** Beside `spec`, `vars` takes `seed`, `container`, `renderer` and `reducedMotion`; every other key means what it means in any GSAP tween. `duration` stretches the whole burst, `ease` warps its time and is `'none'` unless given, `delay` holds back the tween while `spec.delay` waits inside it, and `repeat`, `yoyo`, the callbacks and `scrollTrigger` work as on any tween. `keyframes`, `startAt`, `runBackwards` and `stagger` are rejected by the types and ignored at runtime with a warning.
- **Where bursts come from.** An element, a selector or a list bursts from each element's centre, read when the tween starts from 0; `{ x, y }` bursts from a point in the viewport, as `clientX` and `clientY` give. `seed` makes the bursts the same on every load. A selector or list that matches nothing warns and gives a tween as long as the Spec that draws nothing.
- **Painting.** By default in an overlay over the viewport that exists only while the tween is between its ends; with `container`, inside that element, so a burst scrolls with its section and stays attached when ScrollTrigger scrubs it. `renderer` picks SVG, canvas or, by default, whichever suits the burst's size.
- **Cleanup.** `tween.kill()`, `tween.revert()`, `tl.revert()` and `gsap.context().revert()`, and so `useGSAP` on unmount, clear a burst mid-flight. `tl.kill()` on a parent timeline does not: revert the timeline or its context instead.
- **Reduced motion.** A viewer who prefers it sees the Spec's still Resting frame for the tween's full length, so a timeline keeps its timing.
- **Types.** Importing the package types all four entry points, so `spec` must be a Spec of the right kind. `BurstVars`, `ShapeVars`, `MotlyVars` and `RendererName` are exported.
- **Script tags.** `dist/motly.iife.js`, served by jsDelivr and unpkg, bundles core, defines the global `Motly` carrying `rand`, `each` and the curves, and registers itself when GSAP's script came first. `rand`, `each` and the curves are also named exports.
