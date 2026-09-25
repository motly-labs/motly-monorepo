# 06: Easing — SVG path strings as curves

Status: ready-for-agent
Blocked by: 05

**What to build:** A developer can paste a curve drawn in a design tool — mojs's curve-as-data format, an SVG path in a 100×100 box (`product.md` §1.8.5) — and use it as easing. The spec flags this as unbudgeted in `product.md`'s eight weeks: a path parser plus solving y for x is more than an afternoon.

- [ ] A path-string curve is accepted anywhere a named or cubic-bezier curve is.
- [ ] Output matches reference values for a set of known curves, within a stated tolerance.
- [ ] A malformed path, or one that is not monotonic in x, fails with a clear error when the Instance is created.
- [ ] No mojs source is copied without a `NOTICE` entry.

## Comments

**Notes from ticket 05.**

- `Curve` is `CssEasing | CubicBezier`, converted to a function by `toEase()` in `easing.ts`: the path parser plugs in there. Type the path as a template literal (`` `M${string}` ``), not `string`, or a typo like `'quad.out'` stops being a type error. The error message in `toEase` lists the accepted forms and needs a path added.
- Open question for the user, not a checkbox: ship elastic and bounce, which no cubic-bezier can express, as exported path-string constants here, to complete ticket 05's named set.
