---
'@motly/core': minor
---

Add `rand(min, max)` and `each([...])` Descriptors and an Instance `seed`. `rand` gives each Child its own random number, `each` hands successive values to successive Children, and the two compose. Both stay plain tagged objects, so a Spec survives `JSON.stringify`. Pass `seed` in the binding to reproduce a burst exactly on any run and machine; each Child derives its own Seed from the Instance Seed and its index, so raising `count` leaves the existing Children unchanged.
