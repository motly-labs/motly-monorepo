# 06: Easing — SVG path strings as curves

Status: resolved
Blocked by: 05

**What to build:** A developer can paste a curve drawn in a design tool — mojs's curve-as-data format, an SVG path in a 100×100 box (`product.md` §1.8.5) — and use it as easing. The spec flags this as unbudgeted in `product.md`'s eight weeks: a path parser plus solving y for x is more than an afternoon.

- [x] A path-string curve is accepted anywhere a named or cubic-bezier curve is.
- [x] Output matches reference values for a set of known curves, within a stated tolerance.
- [x] A malformed path, or one that is not monotonic in x, fails with a clear error when the Instance is created.
- [x] No mojs source is copied without a `NOTICE` entry.

## Comments

**Notes from ticket 05.**

- `Curve` is `CssEasing | CubicBezier`, converted to a function by `toEase()` in `easing.ts`: the path parser plugs in there. Type the path as a template literal (`` `M${string}` ``), not `string`, or a typo like `'quad.out'` stops being a type error. The error message in `toEase` lists the accepted forms and needs a path added.
- Open question for the user, not a checkbox: ship elastic and bounce, which no cubic-bezier can express, as exported path-string constants here, to complete ticket 05's named set.

**Implementation notes (ticket 06 build).**

- **Format:** mojs's 100×100 box, y down, typed `` `M${string}` `` as `PathCurve`. Commands M, L, H, V, C, S, Q, T, absolute and relative, with implicit repeats and pairs after M read as lines. Every segment becomes a cubic; lines and quadratics are converted exactly. Arcs (A), Z and a second M are rejected with their own messages: an arc would need an approximation, and Z or a second M cannot describe a function of x.
- **Bounds (decided with the user):** the path must start at x 0 and end at x 100, else it fails at creation. y is free, so a path can overshoot or end back at 0. At progress 0 and below, and 1 and above, it holds its first and last point, even where a vertical segment sits at an end. An end x within 1e-9 of 0 or 100 counts, because relative commands sum in floating point (`l1.1 l65.1 l33.8` ends at 99.99999999999999).
- **Monotonic in x:** checked per segment on the derivative of x(t) (both ends and the turning point), which covers turning back between segments as well as inside one. A vertical segment is allowed and makes a step; exactly at a step inside the curve, progress lands on the far side.
- **Solver:** the Newton-then-bisection solver from ticket 05 now takes any monotonic cubic axis, so cubic-beziers and path segments share it; `cubicBezier` goes through the same code, and ticket 05's Chrome references still pass at 1e-6.
- **Not accepted:** leading whitespace, or a lowercase `m` first. Both are valid SVG but fall outside the `` `M${string}` `` type, and get the general curve message. Loosen both together if a design tool is found that exports either.
- **Errors:** Validation asks `pathProblem()` for the reason and names the place, e.g. `motly: easing cannot be 'M0,100 L60,0 L40,50 L100,0'. A path curve never turns back in x, but the segment ending at (40, 50) does.` A number too big to be finite (`1e999`) is rejected too.
- **Reference values and tolerance:** a one-segment path equal to `ease` matches Chrome's `cubic-bezier()` values within 1e-6; `Q` against y = x², and `Q`…`T` against the exact quad in-out, within 1e-9; relative, `S`, `L` and `H`/`V` against their absolute or closed-form equivalents.
- **Elastic and bounce (decided with the user):** six exported path-string constants, `bounce`/`elastic` × `In`/`Out`/`InOut`. Bounce is exact, as the parabolas it is made of written with `Q`; measured worst error against Penner's formula is 2e-6 (four decimals of rounding), tested at 1e-5. Elastic is cubic Hermite segments through Penner's formula, subdivided until within 2e-4, then rounded to three decimals; Penner's elastic misses 0 and 1 by up to 4.9e-4 at its ends, so the fit is tilted linearly to hit them exactly. Measured worst error 5.5e-4, tested at 1e-3. The strings are about 1 KB each and tree-shake like the cubic-bezier constants. The generator was a scratch script and is not committed; to regenerate, fit the same way.
- **NOTICE:** no mojs source was read or copied; mojs samples paths with the DOM's `getPointAtLength`, which core cannot use. The Penner formulas are used as math to derive data, as ticket 05 did.
- **Bundle:** the parser lives in `easing.ts` next to `toEase`, so it ships whenever easing does, whether or not a Spec uses a path. About 2 KB unminified.
