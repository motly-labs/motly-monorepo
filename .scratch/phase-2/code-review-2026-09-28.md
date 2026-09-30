# Code review: `HEAD~12...HEAD` (2026-09-28)

- **Fixed point:** `HEAD~12` = `42ea794`, **HEAD:** `fdc1697`
- **Commits:** 12, from `745d9cb` (clear a burst on kill and revert) to `fdc1697` (publish through npm trusted publishing). These are the `@motly/gsap` features and the 0.1.0 release.
- **Spec:** `.scratch/phase-2/spec.md` and tickets 04–12, plus only the CI part of ticket 14.
- **Standards sources:** `CLAUDE.md` (the architecture invariants), `docs/adr/`, `CONTEXT.md` and a baseline list of code smells.
- ✓ marks a finding I checked again against the code after the review.

## Standards

**Hard violations: none.** These rules all hold: Invariants 3, 8, 9 and 10, ADRs 0006, 0007 and 0018, changesets on every feature commit, and no co-author trailers.

### Where the code goes against a written rule (judgement calls)

1. **Invariant 6 ("anything two adapters both need belongs in core"), and the same code in two places.**
   - `packages/gsap/src/drawing.ts:218-222` copies how core's `AutoRenderer.#position()` (`packages/core/src/auto/index.ts:86-91`) makes a static container relative. The comment there says so.
   - `createLayer` (`drawing.ts:95-105`) copies the sizing and positioning styles of core's `cover()` (`auto/index.ts:95-103`).
   - A Motion adapter would need both, so they belong in core as one exported helper.
2. **Invariant 6 again.** `seekDriver()` (`drawing.ts:23-37`) is a Driver that moves only when it is seeked. Any adapter that lets the host own the clock needs one (Invariant 5, ADR-0009), so it should move to core.
3. **ADR-0014 and the Renderer entry in `CONTEXT.md` ("the only part of the library that touches the DOM").** The adapter creates svg, canvas and div layers, styles them, and changes `container.style.position` (`drawing.ts:77-107`, `:221`). The older `createOverlay` did the same; this diff adds a lot more of it.

### Code smells (judgement calls)

- **Same check in two places:** `kind === 'burst' ? scope.burst(…) : scope.shape(…)` appears at `drawing.ts:231-233` and `testing/dom.ts:53-54`. A core `scope.create(spec, binding)` would replace both.
- **Fields that travel together:** `DrawingOptions` (`drawing.ts:62-70`) is split into four private fields (`:136-138` plus `#seed`). Keeping the object would be simpler.
- **Unclear names:**
  - `draw()` (`plugin.ts:111`) builds and returns a tween; something like `effectTween` would say so.
  - `lost` (`plugin.ts:126`) means the container wasn't found; `containerMissing` would say so.
- **Small repetition:** the two warnings at `plugin.ts:119` and `:127` share the template `motly: ${name} … not found, so it draws nothing.`

### Not flagged

- The module-level `UNSUPPORTED` and `KEY` constants never change, so Invariant 3 holds.
- Re-exporting the curves in `descriptors-and-curves.ts` adds no logic, so Invariant 6 holds.
- The IIFE side effect (`iife.ts:15`) can't be reached from the ESM entry.

## Spec

Most acceptance criteria are covered by tests that go through GSAP's public API: the four cleanup cases, the `tl.kill()` gap, seeds, points and anchors, container mode, reduced motion re-read on each start, warning once per registration, and loading the script build before or after GSAP. These tests are in `cleanup.test.ts`, `targets.test.ts`, `container.test.ts`, `reduced-motion.test.ts`, `vars.test.ts` and `iife.test.ts`.

### (a) Missing or partial

1. Spec: "`Motly` carries `rand`, `each` and the curves as properties." Only the script build's copy does (`packages/gsap/src/iife.ts:12`). The ESM `Motly` (`plugin.ts:156`) doesn't. Ticket 09 records this, but neither the spec nor ADR-0018 was updated, which `CLAUDE.md` requires for deviations.
2. ✓ User story 59: "so that every published version has provenance." Provenance still depends only on `NPM_CONFIG_PROVENANCE: true` (`.github/workflows/release.yml:40`). `pnpm release` is `turbo run build && changeset publish` with no `--provenance` flag. Ticket 14 says pnpm ignored that env var. Whether pnpm handles the trusted-publishing token exchange is also unverified.

### (b) Scope creep

1. `VERSION` was removed from core's public exports (`packages/core/src/index.ts` and every re-export). The spec never asked for that; ticket 12 says the user chose it.
2. A `container` that matches nothing warns and draws nothing (`plugin.ts:123-126`). Ticket 06 flags this as "not in the spec".
3. `BurstVars`, `ShapeVars`, `MotlyVars` and `RendererName` are exported from `index.ts`. Ticket 08 says this goes "beyond the ticket".
4. CI moved to npm trusted publishing and dropped `registry-url`. The spec says: "after the prerequisites its header lists: placeholders private, `registry-url` on setup-node". There's no ADR or spec change for it.

### (c) Implemented but looks wrong

1. ✓ User story 44: "reverting returns the page to how it was before the burst." A static container is set to `relative` (`drawing.ts:221`) and never set back on release, revert or kill. The spec also says "a static container is made relative", so the spec contradicts itself here, and the change outlives the burst.
2. ✓ The spec types the option as `container?: Element | string`. The code has `HTMLElement | string` (`plugin.ts:30`). Ticket 06 left the final type to ticket 08, which never settled it.
3. With `repeat: -1`, reduced motion is only checked on a start from 0 (`drawing.ts:185`, `#mount`), so an endless repeat never sees a changed setting. That matches the spec's "at each forward start" but breaks user story 48 ("takes effect without a reload"). Ticket 07 lists it as open.
4. Noted only: the spec says "Phase 1 ticket 16 … gates the npm publish". Ticket 14 records that 0.1.0 was published before that check ran.

Tickets 10–12 (pens, READMEs, release prep) got a lighter check.
- The READMEs cover the `tl.kill()` gap, the `onInterrupt` rule, `delay`/`spec.delay` and `ease`/`spec.easing` (`packages/gsap/README.md:72-74,124-128,140`).
- The placeholder packages are private and ignored by Changesets.
- Both changelogs are at 0.1.0.

## Summary

- **Standards: 3 judgement calls on written rules and 4 code smells, no hard violations.** Worst: logic copied from core into the adapter (container positioning, layer styling, `seekDriver`), against Invariant 6.
- **Spec: 2 missing, 4 scope creep and 4 that look wrong.** Worst: the release may publish without provenance (user story 59). Close behind: a static container stays `relative` after revert (user story 44).
