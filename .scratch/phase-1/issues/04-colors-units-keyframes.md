# 04: Colors, unit-bearing strings and Keyframes

Status: resolved
Blocked by: 01

**What to build:** A developer can animate colors and unit-bearing strings with the same syntax as numbers, and write any property as an array of Keyframes spread over the Child's duration (ADR-0008).

One decision to make here, not guess: `product.md` §1.8.6 says to keep mojs's delta syntax (a `{ from: to }` object) for property definitions, while ADR-0008 made arrays mean Keyframes, which already cover the from-to case. Decide whether delta syntax is also accepted. Dropping it is a deviation from `product.md` and, per `CLAUDE.md`, needs an ADR saying why.

- [x] Colors (named, hex, `rgb()`/`rgba()`) interpolate; start, middle and end values are correct.
- [x] Unit-bearing strings interpolate and keep their unit. Mismatched units fail with a clear error when the Instance is created, not on a frame.
- [x] An array of N values is N Keyframes spread evenly over the Child's duration.
- [x] How a color appears in a Draw list record is fixed and documented; ticket 11's CanvasRenderer consumes it.
- [x] The delta-syntax decision is made and, if delta syntax is dropped, recorded as an ADR.

## Comments

**Implementation notes (ticket 04 build).**

- **Units convert at creation (decided with the user).** "Keep their unit" is read as "the unit is honoured": `'40px'`, `'0.5turn'`, `'600ms'` convert to px, degrees and seconds when the Instance is created, and Draw records stay numbers. Lengths take `px`, angles `deg`/`rad`/`turn`, durations `s`/`ms`; scale and opacity take no unit. "Mismatched" means a unit the property cannot take (`['10px', '1turn']` on a radius) or one that needs layout (`em`, `%`): both throw at creation, naming the property. The type rejects them too (`${number}px` template literals). Recorded in the spec.
- **Delta syntax is dropped: ADR-0017.** A JSON Spec using `{ 0: 50 }` throws at creation with "Keyframes are an array."
- **Colors in a Draw record:** a CSS string. A constant passes through exactly as written, so `none` and `currentColor` still work; while animating it is `rgba(r, g, b, a)`, whole-number channels, alpha to three decimals. Documented on `Style`. Checked in Chrome: SVG paints it, and all 148 named colors in the table match Chrome's own parsing. Chrome stores alpha in 8 bits, so `0.751` reads back as `0.753`; harmless.
- **Interpolation is straight sRGB per channel**, not premultiplied and not in a perceptual space. `transparent` → white goes through grey, as in GSAP.
- **The parser accepts a little more than the ticket lists**: `transparent`, `#rgba`/`#rrggbbaa`, space-separated `rgb(1 2 3 / 50%)`, percentages, any letter case. All standard CSS a designer pastes; cheap. Constant colors are not validated, since they pass straight to the Renderer.
- **Keyframes of length N:** `position = progress·(N−1)`; one value is a constant; an empty array throws at creation. Each Keyframe's `rand()` draws from slot `derive(propSeed, slot)`, unchanged from ticket 03, so the pinned Seed-42 values hold.
- **Named colors cost ~1.5 kB gzipped** in the barrel. Watch it against the 15 kB budget in ticket 15; it could move behind a subpath if needed.
- **Not fixed here:** a JSON Spec with `duration: [1, 2]` resolves to an array cast as a number (`Instance.duration` becomes `"1,2"`). Predates this ticket; ticket 07 touches duration next.
