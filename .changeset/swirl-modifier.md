---
'@motly/core': minor
---

Add the Swirl Modifier: `{ kind: 'swirl', size, frequency, direction, child }` wraps one Child and bends the ray the Burst around it throws that Child along, by `direction` × `size` × sin(2π × `frequency` × progress). `size` is an angle (default 10deg), `frequency` is waves over the whole throw (default 1), and `direction` is 1 or -1. A Swirl draws nothing and adds no time, and wrapping a Child in one leaves every value it draws, other than its position, unchanged. Swirls nest inside Bursts, around Bursts, and inside each other.
