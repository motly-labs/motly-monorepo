# Resolve the v1 scope contradiction

Status: ready-for-human

`product.md` rejects the mojs rewrite as a "6–12 month solo effort" with bad ROI, then commits to more scope than that in six months. `mojs-exploration.md:223` sets an explicit 3-month timebox for v1-alpha that the six-phase plan overruns.

The flag at the top of `product.md` §4 offers two resolutions:

1. Cut v1 to Phases 0–2: core + GSAP adapter + demos, public at month 3. Recommended there.
2. Keep all six phases, write down why the effort argument that killed the rewrite doesn't apply, and re-plan against 28–33 weeks rather than 25.

Everything written so far assumes (2). Decide before Phase 1 and record the outcome as an ADR in `docs/adr/`.
