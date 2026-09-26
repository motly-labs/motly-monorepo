# 09: Swirl — the Modifier

Status: resolved
Blocked by: 02

**What to build:** A developer can wrap a Child in a Swirl to bend its path, and nest Swirls and Bursts inside each other. A Modifier wraps exactly one Child and draws nothing itself (ADR-0010). Parameters follow mojs's Swirl (size, frequency, direction) unless there is a reason not to.

- [x] A Swirl wraps exactly one Child and changes its motion.
- [x] A Swirl contributes no record of its own to the Draw list.
- [x] A Burst of Swirls and a Swirl around a Burst both work.
- [x] Derived duration passes through a Modifier unchanged.
- [x] No mojs source is copied without a `NOTICE` entry.

## Comments

**Implementation notes (ticket 09 build).**

- **What a Swirl bends (decided with the user):** the ray the nearest enclosing Burst throws its Child along, turned about the start of that ray. This is mojs's model, where a ShapeSwirl bends the travel a Burst hands it. A Burst of Swirls gives wavy rays; a Swirl around a Burst inside a Burst moves the inner Burst's centre along a wavy path and leaves its own rays straight. With no Burst around it there is no throw, so a Swirl at the root draws its Child unchanged. There is no `scope.swirl()` or `Swirl` class for that reason.
- **Parameters (decided with the user):**
  - `size` is an angle, default 10deg, as in mojs. The sideways reach grows with distance.
  - `frequency` is waves over the whole throw, default 1. mojs uses radians per throw (`sin(3p)` by default, under half a wave), so its numbers do not port one to one.
  - `direction` is 1 or -1, default 1; `each([1, -1])` alternates.
  - None take Keyframes. All take `each()`, and `size` and `frequency` take `rand()`.
- **Where the wave sits:** by progress through the throw as the Burst's radius eases, not by time, so for a radius moving between two values the path has the same shape whatever the Burst's `easing`. Tested by matching an eased Burst against a linear one at equal distances. With radius Keyframes that turn back (`[0, 100, 0]`) the wave follows eased time, not distance; with a constant radius, plain time.
- **Transparent:** a Swirl passes its Seed and Child index through, so `each()` and `rand()` inside it resolve as they would without it, and a Child's `delay` and duration pass through unchanged. Nested Swirls add their turns. Each Swirl on one throw draws its own `size` and `frequency` from a Seed keyed by its depth on that throw, so nested Swirls draw apart (found in review).
- **Resolver:** a Swirl appends itself to the last Placement's `swirls`; `sample()` turns that throw's direction by the sum. Tested to survive a JSON round trip.
- **Not changed after review:** `validate()` checks a Swirl's missing `child` in its own branch, beside Burst's `children`. Ticket 10's single table of kinds is the place to fold both in. A straight throw shares one empty array and takes the old path through the loop: 5,000 Elements sample in 0.79 ms against 0.78 ms before.
- **NOTICE:** none needed. The sine-turned ray is mojs's idea, written here from scratch; no mojs source was copied.
