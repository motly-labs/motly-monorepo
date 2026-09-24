# Duration is computed; completion resolves once

An Instance's duration is derived, not declared: the latest end across all Children (stagger offset + delay + duration), recursively. `play()` returns a Promise that resolves the first time the Playhead reaches that duration moving forward. Scrubbing back over the end does not resolve it again, and `destroy()` before the end resolves the Promise rather than rejecting it, so an unmounted component cannot produce an unhandled rejection.

An Instance has no repeat count in v1. Repeating belongs to the Driver (ADR-0009), and a repeating Driver resolves on its final pass.

## Consequences

- Nothing can await "the animation ran to completion" as distinct from "the animation stopped". If that distinction is ever needed, it goes on the settled value, not in a rejection.
- Changing a Child's duration changes the parent's, which the docs need to say plainly.
