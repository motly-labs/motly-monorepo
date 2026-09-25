# 03: Seed, `rand()` and `each()` Descriptors

Status: ready-for-agent
Blocked by: 02

**What to build:** A developer can randomise and distribute values across a Burst's Children while the Spec stays JSON-serializable, and `seed: 42` reproduces the exact same burst on any run and any machine (Invariant 4, ADR-0008).

- [ ] `rand(min, max)` returns the Descriptor `{ __motly: 'rand', min, max }`, never a number. It resolves per Instance and per Child.
- [ ] `each([...])` returns the Descriptor `{ __motly: 'each', values: [...] }` and hands successive values to successive Children. With more Children than values, the values repeat in order.
- [ ] The two compose: an `each` of `rand`s resolves each Child's `rand` independently.
- [ ] The Seed is bound at Instance creation. Each Child derives its own Seed from the Instance Seed and its index, so raising `count` from 20 to 21 leaves Children 0–19 unchanged.
- [ ] The same Seed gives an identical Draw list in a fresh process. The seeded path never calls `Math.random`.
- [ ] With no Seed given, the Instance picks a fresh random one, so repeated plays look different.
- [ ] A Spec containing both Descriptors survives `JSON.parse(JSON.stringify(spec))` and builds an Instance with an identical Draw list.
