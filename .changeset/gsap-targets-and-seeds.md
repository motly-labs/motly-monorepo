---
'@motly/gsap': minor
---

`gsap.effects.burst()` and `tl.burst()` take every kind of target GSAP does. A selector or list gives one burst per element, each from its own centre; a plain `{ x, y }`, as `clientX` and `clientY` give, bursts from that point in the viewport. `seed` in `vars` makes a burst the same on every page load: target `i` draws from `seed + i`. Without it, each call draws a random Seed, which a repeat, a restart and a scrub all keep. Targets that match nothing warn once and return a tween as long as the Spec that draws nothing, so a timeline keeps its timing.
