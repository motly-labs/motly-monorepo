# 10: The remaining Element kinds, with discriminated types

Status: resolved
Blocked by: 01, 03

**What to build:** A developer can use every v1 Element kind — polygon, star, cross, line, zigzag and custom path, alongside circle — and the compiler rejects a property that does not belong to the kind (Invariant 9).

- [x] Each kind has its own parameters in the Spec, and a type-level test proves `Shape<'polygon'>` requires `points` while `Shape<'circle'>` rejects it.
- [x] Draw records carry each kind's parameters, not geometry. A custom path's geometry lives in the Spec and the record references it (ADR-0013).
- [x] `SVGRenderer` draws every kind, updating attributes on a live element rather than rebuilding it each frame.
- [x] One Burst can mix kinds: `children` accepts `each([...Child Specs])`, handing successive Child Specs to successive Children, each still typed by its own `kind`. `kind: each([...])` alone is not the way in: it would let a circle Child carry `points`.
- [x] `apps/demos` shows every kind, and one Burst mixing several.

## Comments

**Note from the post-ticket-05 audit.** A new kind now touches three places that must agree: its parameters in `ShapeParams` (`spec.ts`), its fields in `FIELDS` (`validate.ts`, which also lists the property names its `easing` map may use), and the Resolver, whose `ResolvedElement` is still circle-only. Consider deriving the first two from one table here.

**Implementation notes (ticket 10 build).**

- **Parameters (decided with the user):**
  - Every kind is centred on its position and points at 12 o'clock at `angle` 0: a polygon's first corner, a star's first tip, a line and a zigzag running from 12 o'clock to 6.
  - `polygon`: `points` (3 or more, required), `radius` to each corner.
  - `star`: `points` (2 or more, required), `radius` to each tip, `innerRadius` as a fraction of `radius` (default 0.5, animatable), so a star keeps its shape while `radius` animates.
  - `cross`, `line`: `radius` only.
  - `zigzag`: `points` (corners, ends included, 2 or more, required), `radius` to each end, `amplitude` in px (animatable, default a quarter of `radius`, moving with it). The ends sit on the axis; the corners between swing right first.
  - `path`: `d` (required), an SVG path in a 100×100 box centred on (50, 50), like mojs custom shapes and path curves, scaled so the box spans 2 × `radius`. The stroke width is not scaled with it.
  - `points` and `d` hold still: they take `each()`, not Keyframes or `rand()`, and are not `easing` names.
  - A cross, a line and a zigzag enclose nothing, so they default to a deeppink stroke 2 wide and no fill. Each style field left out takes its kind's default, so `{ kind: 'line', fill: 'red' }` is still stroked.
- **Discriminated types:** a Shape of one kind marks the other kinds' parameters `?: never`, so a circle rejects `points` even inside `each([...])`, where the compiler does no excess-property check. `kinds.test.ts` holds the `@ts-expect-error` proofs.
- **The three places (audit note):** not merged into one runtime table, since the types would then lose a doc comment per parameter. Instead `FIELDS` is held to the Spec types by the compiler in both directions: a field the types have and `FIELDS` lacks, or the reverse, fails the build, and so does a required field missing from `REQUIRED`. The Resolver switches on kind in one function, `kindParameters`.
- **Records (ADR-0013):** each kind's record carries its parameters (`points`, `innerRadius`, `amplitude`, `d`), not geometry. A custom path's record holds the Spec's own `d` string. Held parameters are set on the pooled record once; the animated ones beyond `radius` are written each frame by `paintAnimated`, kept out of `paint` so a circle's frame costs what it did (5,000 circles: 0.78 ms both before and after; 5,000 animated stars 0.95 ms).
- **Geometry:** `src/geometry.ts` traces each outline through a `Pen` (`moveTo`, `lineTo`, `closePath`). A Canvas 2D context is already a Pen, so ticket 11 reuses it; `SVGRenderer` writes path data with one. It is shared by the Renderer entries and not exported. A circle stays an SVG `<circle>`; every other kind is one live `<path>` whose `d` and transform are updated each frame, and a custom path's `d` is set once.
- **Mixing kinds:** `children` is `Distributable<ChildSpec>`, so `each([...])` hands Child Specs out in turn, each still typed and validated by its own `kind`.
- **Held parameters:** `points` and `d` are named once, as `HeldParameter` in `spec.ts`. The `easing` names, validation's split and the Resolver's `held` field all key off it.
- **After review:**
  - **Fixed, with a test:** a zigzag's default `amplitude` now follows its own `easing.amplitude`, which was accepted and then ignored.
  - **Fixed:** every record type is exported (`PolygonRecord` … `PathRecord`), not only `CircleRecord`, and each kind's parameters say when to reach for it.
  - **Fixed:** `radius` sits once in validation's `shapeFields`, and `HeldParameter` ties the three held/animated splits.
  - **Measured:** a Burst mixing four kinds on 5,000 Elements samples in 0.52 ms, with no cliff from records of several shapes.
  - **Not changed:**
    - `innerRadius` is not bounded to 0–1. Above 1 the notches fold outward, which is a shape of its own.
    - The Resolver's `animated` parameters are keyed by record field name, a string the compiler does not check against the record types. The kind tests pin every field.
    - ADR-0013 says the SVG Renderer "keep[s] a live `<polygon>`"; it keeps a live `<path>` and rewrites its `d`, which is the same contract, so no ADR change is needed.
- **Demos:** `apps/demos` shows every kind in a row and one Burst mixing stars, circles, zigzags and triangles. Checked by eye in Chrome.
