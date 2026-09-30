# A Burst aims, spreads and orients its rays

A Burst takes three fields beside `count` and `radius`. `angle` turns its rays clockwise from 12 o'clock. `spread` is the arc they cover, 0 to 360 degrees. `orient` turns each Child to face its ray, its own `angle` added on top. Left out, they are 0, 360 and off, and the rays come from the same arithmetic as before any of them existed, so every Spec written without them draws exactly what it drew.

A full circle and a narrower arc lay out their rays differently. At 360 the first ray is at `angle` and the rays are 360 / `count` apart, so the last does not land on the first. Below 360 the arc is centred on `angle` with both edges included, `spread` / (`count` − 1) apart, because an arc is aimed by its middle: `angle: 0, spread: 90` is a fan straight up. A single Child goes along `angle`, and `spread: 0` sends every Child along it, as a jet.

`orient` is fixed for a Child's life: the ray's angle is added to a Shape's `angle`, or to a Burst Child's rays, when the Spec is resolved, and `sample()` does no more work per frame. A Swirl's Child faces the ray, not the Swirl's curve, since facing the curve means a tangent per Element per frame in the loop ADR-0009's performance work keeps lean.

Found by the two storytelling examples (Phase 2 tickets 29 and 31, ticket 30). Meteor streaks had to be turned with `angle: each([...])` computed from `count`, and the fireball, a Burst of one, could only fly straight up. The party's confetti cannons were full circles, half their confetti thrown into the floor.

## Considered Options

- **Keep the workarounds.** Rejected: the angle array puts the ray arithmetic in every Spec with a directed Child, goes stale when `count` changes, and cannot be written by an editor that exports Specs.
- **An arc that starts at `angle`, like the full circle.** Rejected: one rule for both would be simpler, but aiming a cone by its edge makes every cannon Spec subtract half its spread.
- **Orient along the curve under a Swirl.** Deferred: it costs per frame, and nothing built needs it yet.
- **`angle` as Keyframes, spinning the rays.** Rejected here: motion of the whole pattern over time is a Modifier's job, as Swirl is for the throw.

## Consequences

- A Burst's `angle` and a Shape's `angle` share a name but not a type: the Burst's is one value for its life, and the validator says so when given Keyframes.
- `stagger` orders Children by ray, from the first ray, which is 12 o'clock only when `angle` is 0 and the Burst rings the Origin.
- A Burst's `radius` stays one value per Burst, shared by its Children: a per-Child throw distance is a separate design, not taken up here.
