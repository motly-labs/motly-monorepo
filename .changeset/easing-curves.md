---
'@motly/core': minor
---

Add easing. `easing` on a Shape or Burst takes a curve for every property, or a map by property name with a `default`: `easing: { default: 'ease-out', opacity: backIn }`. A curve is a CSS keyword (`'ease'`, `'ease-in-out'`, …) or a cubic-bezier as four numbers, matching Chrome's `cubic-bezier()` to within 1e-6 at every reference point. Named curves (`quadOut`, `expoInOut`, `backOut` and 21 more) are importable constants holding their cubic-bezier, so a Spec stays JSON and unused curves tree-shake out.
