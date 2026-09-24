# Three kinds of primitive; Stagger and Timeline are timing

`product.md` §1.3 lists five peer primitives. Core instead has three drawable kinds: Element (`Shape`), Emitter (`Burst`) and Modifier (`Swirl`). Stagger is an option on an Emitter, and Timeline is a Driver (ADR-0009). Stagger and Timeline draw nothing, so if they were peers the Child type and the `Shape<K>` discriminant would have to allow members that never appear in a draw list.

## Consequences

- There is no `new Stagger()`. Staggering is `new Burst({ stagger: ... })`.
- A Modifier wraps exactly one Child, and an Emitter spawns many.
