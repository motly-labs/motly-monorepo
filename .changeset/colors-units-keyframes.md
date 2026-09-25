---
'@motly/core': minor
---

Animate colors and unit-bearing strings, and write any property as Keyframes of any length. `fill: ['red', '#0000ff80']` interpolates named, hex, `rgb()` and `rgba()` colors; `radius: ['0px', '40px']`, `angle: [0, '0.5turn']` and `duration: '600ms'` convert to px, degrees and seconds, and a unit the property cannot take throws when the Instance is created. `[0, 10, 40]` spreads three Keyframes evenly over the Child's duration. mojs's `{ from: to }` delta syntax is not accepted; use an array (ADR-0017).
