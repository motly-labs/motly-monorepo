# v1 is Phases 0–2: core plus the GSAP adapter

v1 is `@motly/core`, `@motly/gsap` and the demos, public at month 3. The Motion adapter, React components and `@motly/presets` (Phases 3–5 of `product.md` §4) are post-v1 and go ahead only if Phase 2 lands. `product.md` rejected the mojs rewrite as a 6–12 month solo effort and then planned more than that; `mojs-exploration.md` sets a 3-month timebox for a usable alpha. Cutting the scope keeps the plan consistent with the reason it exists.

## Considered Options

- **Keep all six phases, re-planned to 28–33 weeks.** Rejected: nothing recorded explains why the effort argument that killed the rewrite would not apply to a larger plan.

## Consequences

- Phase 1 designs against a single adapter. Invariant 6 ("anything two adapters both need belongs in core") has one adapter to test against until Phase 3, so core's API is shaped by GSAP alone. Review it against Motion's `animate()` before 1.0.
- React-only needs (exit animations, `AnimatePresence`) are out of Phase 1.
- `packages/motion`, `packages/react` and `packages/presets` stay as placeholders and are not published in v1.
