# Arrays are keyframes; distribution is a descriptor

In a Spec, an array value means keyframes, as it does in GSAP and Motion. Handing one value to each Child of an Emitter uses a tagged descriptor, `each([...])`, which serializes as `{ __motly: 'each', values: [...] }`. This departs from `product.md` §1.8.5, where `fill: ['cyan', 'yellow', 'deeppink']` distributed across children as it does in mojs. The wedge audience comes in through the GSAP adapter and already reads arrays as keyframes, and Invariant 4 already uses descriptors for `rand`.

## Considered Options

- **Arrays distribute (mojs).** Rejected: GSAP users would misread it, and keyframes would then need their own syntax.
- **Meaning depends on where the property sits** (distribute on an Emitter's children, keyframes elsewhere). Rejected: the same syntax would mean two things.
