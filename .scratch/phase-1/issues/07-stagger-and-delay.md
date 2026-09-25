# 07: Stagger and delay

Status: ready-for-agent
Blocked by: 02, 05

**What to build:** A developer can offset when each Child of a Burst starts — per Child with `delay`, or across the whole Emitter with `stagger` shaped by a curve — so a burst lands unevenly on purpose. Stagger is an Emitter option, not a primitive (ADR-0010).

- [ ] A Child's `delay` offsets its start.
- [ ] An Emitter's `stagger` offsets successive Children's starts, and the spread follows a curve from 05.
- [ ] Derived duration includes stagger and delay offsets (ADR-0016).
- [ ] There is no `Stagger` primitive or constructor.
