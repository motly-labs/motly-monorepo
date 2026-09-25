# 03: Seed, `rand()` and `each()` Descriptors

Status: resolved
Blocked by: 02

**What to build:** A developer can randomise and distribute values across a Burst's Children while the Spec stays JSON-serializable, and `seed: 42` reproduces the exact same burst on any run and any machine (Invariant 4, ADR-0008).

- [x] `rand(min, max)` returns the Descriptor `{ __motly: 'rand', min, max }`, never a number. It resolves per Instance and per Child.
- [x] `each([...])` returns the Descriptor `{ __motly: 'each', values: [...] }` and hands successive values to successive Children. With more Children than values, the values repeat in order.
- [x] The two compose: an `each` of `rand`s resolves each Child's `rand` independently.
- [x] The Seed is bound at Instance creation. Each Child derives its own Seed from the Instance Seed and its index, so raising `count` from 20 to 21 leaves Children 0–19 unchanged.
- [x] The same Seed gives an identical Draw list in a fresh process. The seeded path never calls `Math.random`.
- [x] With no Seed given, the Instance picks a fresh random one, so repeated plays look different.
- [x] A Spec containing both Descriptors survives `JSON.parse(JSON.stringify(spec))` and builds an Instance with an identical Draw list.

## Comments

**Implementation notes (ticket 03 build).**

- **The RNG is stateless hashing, not a generator.** `rng.ts` has a 32-bit mixer (`lowbias32`), `derive(seed, key)` and FNV-1a for names. A value depends only on its Seed and key, never on draw order. Seeds nest: Child Seed = `derive(parent Seed, index)`, property Seed = `derive(Child Seed, hash(property name))`, Keyframe slot = `derive(property Seed, slot)`. So adding a property, raising `count` or turning `rand` into `[rand, 0]` leaves every other value where it was.
- **The Seed is an integer**, coerced with `>>> 0`. `42.7` behaves as `42`. It lives on `InstanceBinding`, never in the Spec (ADR-0014). This also ticks ticket 01's open box.
- **`Math.random` appears once in core**, in `freshSeed()` in `instance.ts`, for an Instance created with no Seed. The RNG module never calls it. A test spies on it to prove the seeded path never does either.
- **Fresh-process determinism is pinned by value**: `rand(0, 100)` and `rand(0, 1)` under Seed 42 are hard-coded in the test. Everything before the final divide is integer arithmetic, so the numbers are identical on every engine. If they ever change, every saved seeded burst changes with them — a breaking change, not a snapshot update.
- **Where Descriptors may appear:** `rand` wherever a Spec takes a number, including inside Keyframes and `duration`; `each` over any whole property value (numbers, Keyframes, `rand`s, strings). `count` takes neither: it sizes the Draw list pool, so it stays a plain number until something needs it to vary.
- **`each` counts Children within their own Emitter.** In a Burst of Bursts, a leaf's `each` index is its position in its immediate parent, not in the whole tree. A top-level Shape is Child 0.
- **`each()` infers a const tuple** so `each([1, [2, 4]])` types as a number-or-Keyframes Distribution, and rejects an empty array at compile time. A JSON-parsed Spec with `values: []` is not checked at runtime.
- **Descriptor resolution lives in `descriptors.ts`** (`resolveValue`, `resolveNumeric`), taking a property's Seed and the Child's index; `resolve.ts` only derives Seeds and walks the tree. A new Descriptor kind still touches `spec.ts` for its type.
- **"Children 0–19 are unchanged" means their resolved values.** Their positions do change when `count` goes 20 to 21, because a Burst re-spaces its Children evenly (`2π·i/count`). That is the Burst's geometry, not Seed instability.
- **"Any machine" holds for resolved values, not for every coordinate.** Placement uses `Math.sin`/`Math.cos`, which the language spec does not require to agree to the last bit across engines, so `x`/`y` may differ by an ulp between browsers. Irrelevant visually; it matters only if a cross-browser test ever compares records exactly. The fix would be a bundled sin/cos, not worth it now.
- **The resolver now produces concrete values.** Defaults moved from `sample()` into `resolve()`; `sample()` only interpolates resolved numbers. This closes the gap noted in ticket 02.
- **Not added:** a readonly `seed` on the Instance, so someone can reproduce a random burst they liked from a bug report. Small, but not asked for; worth a ticket if story 25's "bug report" case comes up.
