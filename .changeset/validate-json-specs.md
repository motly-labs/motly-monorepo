---
'@motly/core': minor
---

Validate a whole Spec when an Instance is created, so a Spec from JSON gets the same guarantees as one the compiler checked. Every field of every Spec in the tree is checked, including `each()` values no Child picks and the Child of a Burst with `count: 0`. A bad value throws one error naming its place, such as `motly: children.fill[0] cannot be 'none'`. Unknown fields, fractional or negative `count`, negative durations and Keyframes on `duration` are now errors rather than silently wrong.
