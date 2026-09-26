---
'@motly/core': minor
---

Accept an SVG path string as a curve, drawn in mojs's 100×100 box with y down, so a curve pasted from a design tool works unchanged. Add `bounceIn`, `bounceOut`, `bounceInOut`, `elasticIn`, `elasticOut` and `elasticInOut` as path-string constants. A path that is malformed, does not run from x 0 to x 100, or turns back in x fails when the Instance is created, saying why.
