---
'@motly/core': minor
---

Add the remaining Element kinds: `polygon` (`points`), `star` (`points`, `innerRadius` as a fraction of `radius`), `cross`, `line`, `zigzag` (`points`, `amplitude`) and `path` (`d`, an SVG path drawn in a 100×100 box and scaled to `radius`). Each kind takes only its own parameters, checked by the compiler and by validation, and each is drawn pointing at 12 o'clock. A cross, a line and a zigzag are stroked deeppink at 2 unless the Spec styles them. Draw records carry each kind's parameters, and `SVGRenderer` draws every kind. A Burst can mix kinds: `children` takes `each([...Child Specs])`.
