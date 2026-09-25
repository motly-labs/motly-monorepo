# No `{ from: to }` delta syntax; Keyframes are the only from-to form

A Spec animates a property with an array of Keyframes (ADR-0008): `radius: [0, 50]`. It does not also accept mojs's delta syntax, `radius: { 0: 50 }`, which `product.md` §1.8.6 said to keep. A JSON Spec that uses it fails when the Instance is created, with an error pointing to Keyframes.

Once arrays meant Keyframes, the delta object only duplicated the two-Keyframe case, and it cannot do what the rest of the Spec can: its from-value is an object key, so it is always a string, can never be a `rand()` Descriptor, and loses its type (`{ 0: 50 }` and `{ '0px': '50px' }` have the same key type). Two syntaxes for one thing, one of which breaks composition with `rand` (story 10), is worse than one.

## Considered Options

- **Accept both, delta as sugar for a two-value array.** Rejected: the from-value can only be a constant, and the type cannot check it.

## Consequences

- mojs users porting an effect rewrite `{ a: b }` as `[a, b]`. The error message names the property and says Keyframes are an array.
- Adding delta syntax later stays possible and additive; removing it after release would not have been.
