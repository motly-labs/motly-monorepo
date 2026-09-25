# 02: Burst — an Emitter placing N Children by angle and radius

Status: ready-for-agent
Blocked by: 01

**What to build:** A developer can describe a Burst — `count` Children thrown outward around the Origin — and play it like the Shape from 01. This is the flagship primitive and the first Emitter (ADR-0010). Children are recursive: a Child may itself be an Emitter.

- [ ] A Scope creates a Burst Instance, and a bare `new Burst(…)` gets its own private Scope, as with Shape.
- [ ] A Burst spawns `count` Children and places them evenly by angle around the Origin at a radius; the radius can animate, so Children travel outward.
- [ ] A Child may be an Element or another Emitter, to any depth.
- [ ] An Instance's duration is derived: the latest end across all its Children, recursively. There is no duration field on an Emitter (ADR-0016).
- [ ] The Draw list has one record per Element. The record pool grows when the Element count grows and at no other time.
- [ ] `apps/demos` shows a Burst.
