# 07: Stagger and delay

Status: resolved
Blocked by: 02, 05

**What to build:** A developer can offset when each Child of a Burst starts — per Child with `delay`, or across the whole Emitter with `stagger` shaped by a curve — so a burst lands unevenly on purpose. Stagger is an Emitter option, not a primitive (ADR-0010).

- [x] A Child's `delay` offsets its start.
- [x] An Emitter's `stagger` offsets successive Children's starts, and the spread follows a curve from 05.
- [x] Derived duration includes stagger and delay offsets (ADR-0016).
- [x] There is no `Stagger` primitive or constructor.

## Comments

**Implementation notes (ticket 07 build).**

- **API (decided with the user):** `delay` on a Shape and on a Burst, a time like `duration` (units, `rand()`, `each()`; not negative, not Keyframes). `stagger` on a Burst only: a time between successive Children, or `{ each, easing }`. With an easing, Child i starts at `each` × (`count` − 1) × ease(i / (`count` − 1)), so the span is the same as without; an offset the curve puts below 0 (`backIn`) is held at 0. Order is Child index, clockwise from 12 o'clock. No GSAP `from`/`grid`/`amount` in v1. `stagger` is not distributable with `each()`, but its time takes `rand()`.
- **Start times:** a Child starts at its Burst's start + its Stagger offset + its own `delay`; a Burst's `delay` shifts its whole subtree. The Resolver passes each Child its start, and the parent resolves the Child's `delay` from the Child's Seed, so a `rand()` delay is stable under changing `count`.
- **Before its start (decided with the user):** a Child is held at its first frame, as GSAP does, not hidden. The Draw list is unchanged. A constant-radius Child sits visibly at the Origin until it is thrown. This holds for a Child with `duration: 0` too: before its start it is at its first frame, and from its start at its last. Review found it jumping straight to its last frame.
- **Flight (decided with the user):** a Burst's radius runs on each Child's clock, from that Child's start, over the Emitter's duration: now the longest time any of its Children runs, not the latest end. A late Child is thrown from the Origin, as mojs does. With no stagger or delay, the result is the same as before.
- **Derived duration (ADR-0016):** the latest end across every Child, recursively, with every offset in it. Tested three levels deep, and `play()` resolves at the last offset Child's end, not before.
- **No `Stagger` primitive:** there is no export, constructor or Spec kind; a test checks the barrel.
- **Perf:** the Emitter radius is now worked out per Child start, cached per Emitter, and reused while Children start together, which is always without stagger or delay. On the 5,000-Element nested burst from 92bfa2e, with `backOut` on every property: 1.70 ms a frame at HEAD, 1.75 after, and about 1.9 with stagger on both levels. The first draft was 2.2: any extra field read in `sample()`'s loop cost 0.5 ms, as the loop grew past what V8 would optimize. Splitting the per-property writes into `paint()` fixed it; the comment there says why.
