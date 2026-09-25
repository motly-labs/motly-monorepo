# 04: Colors, unit-bearing strings and Keyframes

Status: ready-for-agent
Blocked by: 01

**What to build:** A developer can animate colors and unit-bearing strings with the same syntax as numbers, and write any property as an array of Keyframes spread over the Child's duration (ADR-0008).

One decision to make here, not guess: `product.md` §1.8.6 says to keep mojs's delta syntax (a `{ from: to }` object) for property definitions, while ADR-0008 made arrays mean Keyframes, which already cover the from-to case. Decide whether delta syntax is also accepted. Dropping it is a deviation from `product.md` and, per `CLAUDE.md`, needs an ADR saying why.

- [ ] Colors (named, hex, `rgb()`/`rgba()`) interpolate; start, middle and end values are correct.
- [ ] Unit-bearing strings interpolate and keep their unit. Mismatched units fail with a clear error when the Instance is created, not on a frame.
- [ ] An array of N values is N Keyframes spread evenly over the Child's duration.
- [ ] How a color appears in a Draw list record is fixed and documented; ticket 11's CanvasRenderer consumes it.
- [ ] The delta-syntax decision is made and, if delta syntax is dropped, recorded as an ADR.
