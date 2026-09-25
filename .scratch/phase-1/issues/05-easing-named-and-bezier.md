# 05: Easing — named curves and cubic-bezier

Status: resolved
Blocked by: 01

**What to build:** A developer can give any property a curve, either by name or as a cubic-bezier, and the Spec stays serializable because a curve is data, never a function.

- [x] A set of named curves covers the common in/out/in-out families. Each is individually importable, so unused curves tree-shake out.
- [x] A cubic-bezier given as four numbers matches CSS `cubic-bezier()` within a stated tolerance.
- [x] A curve applies per Child property.
- [x] A curve in a Spec is a string or a number tuple; a Spec never holds a function.

## Comments

**Implementation notes (ticket 05 build).**

- **Named curves are data, not names (decided with the user).** The ticket's "individually importable" and "a curve is a string" pull against each other: a string name needs a lookup table that bundles every curve. So only the five CSS keywords are strings; the 24 named curves (`sine`, `quad`, `cubic`, `quart`, `quint`, `expo`, `circ`, `back` × `In`/`Out`/`InOut`) are exported constants holding their cubic-bezier. Checked with esbuild: an entry importing only `backOut` contains none of the others' numbers. The values are Penner's easings as cubic-bezier approximations, the set Ceaser and Bourbon publish; they are approximations, not the exact formulas.
- **Elastic and bounce are missing**, since no cubic-bezier can express them. Ticket 06's path curves could; recorded there as an open question, not a checkbox.
- **Per-property curves (decided with the user):** `easing` takes one Curve, or a map by property name with `default`; unnamed properties are linear without a `default`. `each()` works over it. A Burst's `easing` moves only its own `radius`; its Children take their own.
- **Tolerance: 1e-6 against Chrome, at the reference points.** The reference values in `easing.test.ts` are Chrome's `cubic-bezier()` read from the Web Animations API (`getComputedTiming().progress`), five points on each of the four eased keywords and four beziers including overshooting ones. The solver is Newton, then bisection, and solves t to 1e-12 rather than x to a tolerance: the review found that stopping on x error lost up to 3e-4 in y where the curve is near vertical (`[0, 0.5, 0, 0.5]` near 0, `expoInOut` near 0.5). A test now checks those against closed forms to 1e-9. One floating-point limit remains: exactly at a point where x(t) is flat (an inflection with zero slope, like `[1, 0, 0, 1]` at 0.5), rounding caps t at about 1e-6; the solver stops on an exact hit there.
- **An overshooting curve carries on past the end Keyframes** rather than clamping, so `backOut` on `[0, 10, 20]` reaches 21.35. Colors clamp their channels.
- **Every Curve a Child uses is checked at creation**, including in a map entry and on a property with no Keyframes. As with other `each()` values, a Curve no Child picks (`each(['ease', 'bogus'])` with `count: 1`) is never checked; an unknown keyword, a wrong-length tuple or an x outside 0–1 throws, naming `easing` or `easing.<property>`. Unknown map keys are rejected by the type but ignored at runtime.
- **Picking a Curve per property lives in the Resolver** (`easings()` in `resolve.ts`); `easing.ts` only turns a Curve into a function, as the spec's module list has it.
- **`cubicBezier()` is not exported.** It returns a function, and a Spec never holds one.
