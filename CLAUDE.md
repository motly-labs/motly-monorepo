# CLAUDE.md

Project-specific rules for `motly`. Merge with the global guidelines in
`~/.claude/CLAUDE.md` — this file adds the domain rules, it does not replace them.

## What this is

`motly` (working codename) is a **procedural motion-graphics library for the web**:
bursts, swirls, generated shapes, declarative parametric animation. It occupies the
gap between a canned-animation player (Lottie) and a creative-coding framework
(Pixi, Three). GSAP, Motion and anime.js animate *existing* DOM; `motly` *generates*
the thing being animated.

One engine, four distribution surfaces: `@motly/core` (standalone),
`@motly/gsap` (plugin), `@motly/motion` (adapter), `@motly/react` (components),
plus `@motly/presets`.

## Documents of record — read before proposing scope

| File | What it is | How to treat it |
| --- | --- | --- |
| `product.md` | The plan: problem, API synthesis, architecture, six phases | Source of truth for *intent*. Do not edit it to match code. |
| `product-review.md` | Critical review of the plan; rationale for every correction in it | Read before re-litigating a decision it already settled. |
| `mojs-exploration.md` | Why the naive mojs rewrite was rejected | Contains the 3-month timebox the plan overruns. |
| `DECISIONS.md` | Dated log of every locked choice + open questions | **Append here whenever a decision is made or changed.** |

Deviating from `product.md` is allowed. Deviating *silently* is not — log it in
`DECISIONS.md` with the reason.

## Status

Phase 0 scaffold. No engine code exists yet. `packages/*/src` holds placeholders.

## Commands

```sh
pnpm install          # workspace install
pnpm build            # turbo run build   (tsdown, per package)
pnpm test             # turbo run test    (vitest)
pnpm typecheck        # turbo run typecheck (tsc --noEmit)
pnpm lint             # biome check .
pnpm format           # biome check --write .
pnpm changeset        # record a release note before opening a PR
```

Run `pnpm lint && pnpm typecheck && pnpm test` before declaring work done. CI runs
exactly these.

## Architecture invariants

These are the rules that make the hexagonal split real. Breaking one is a design
change, not a refactor — raise it before writing the code.

1. **`@motly/core` has zero runtime dependencies.** No renderer, no DOM API, no
   framework imports. If core needs a browser API, it belongs behind a port.
2. **Core emits a renderer-agnostic draw list.** Renderers consume it. Data flows
   one way; a renderer never feeds state back into core.
3. **No module-level mutable state.** No global defaults, no singleton config.
   Everything is per-instance or per-scope. This is the specific mojs mistake the
   plan calls out (§1.8) — enforce it with types.
4. **Specs stay JSON-serializable.** Inline randomness returns a tagged descriptor,
   `{ __spark: 'rand', min, max }`, never an eagerly-evaluated number. A spec that
   does not survive `JSON.stringify` breaks the editor-export story it exists for.
5. **The ticker driver is replaceable.** Inside a GSAP host, GSAP owns the clock;
   inside Motion, Motion does; standalone, core's rAF loop does. Core must never
   assume it owns the frame loop. Settle this before `setProgress()` is written.
6. **Adapters are thin.** Anything two adapters both need belongs in core. An
   adapter that grows animation logic is a bug report about core's API.
7. **Presets use only the public core API.** If a preset needs an internal, core's
   surface is short — extend core, don't reach inside.
8. **`gsap`, `motion` and `react` are peer dependencies.** Never bundled, never a
   hard dependency.
9. **Types discriminate.** `Shape<'polygon'>` has `points`; `Shape<'circle'>` does
   not. Generics and discriminated unions are the v1 API design, not a later polish
   pass.
10. **Reduced motion is a v1 API.** Not a v2 nice-to-have.

## Code conventions

- TypeScript strict, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
  `erasableSyntaxOnly`, `verbatimModuleSyntax`. See `tsconfig.base.json`.
- ESM-first, `"sideEffects": false`, tree-shakeable. Every export must be droppable.
- Biome owns formatting and import order. Don't hand-format; run `pnpm format`.
- Single quotes, semicolons, trailing commas, 100 columns — all enforced, don't argue
  with them in review.
- `console.log` is a lint error. `console.warn` / `console.error` are allowed.
- New public surface ships with a doc comment explaining *when* to reach for it, not
  just what it does.

## Testing

- Vitest for the engine. Unit tests live next to source as `*.test.ts`.
- The engine must be testable without a browser — if a test needs a DOM, the code
  under test is in the wrong package.
- Visual regression is Playwright's own `toHaveScreenshot()` with committed PNGs, no
  hosted service. Budget ~15–20 hrs for the harness (seeding, frame pinning,
  tolerance, CI flake control) before the first assertion lands.
- Coverage target is 85% on `@motly/core`. It does not apply to adapters.

## Releases

- Changesets. Every user-visible change needs a changeset in the same PR.
- Independent versioning — core can be at 1.4.0 while the GSAP adapter is at 0.9.2.
- `apps/*` are private and ignored by Changesets.
- Publishing happens only through `.github/workflows/release.yml`. Never `npm publish`
  by hand.

## Don't

- **Don't add a runtime dependency to `@motly/core`.** Ask first, every time.
- **Don't add a sixth package** when a subpath export works. `@motly/core/utils` is
  the precedent.
- **Don't scaffold `apps/docs`, `apps/demos` or a playground** until the phase that
  funds them starts. `apps/playground` is funded by no phase at all.
- **Don't copy mojs or canvas-confetti source** without adding a `NOTICE` entry. Both
  are MIT: the ideas are free, the code carries a copyright notice.
- **Don't bump `typescript` or `tsdown`** without running the full build. tsdown warns
  that the TS 7 API is experimental — see `DECISIONS.md` for the standing risk.
- **Don't quote competitor metrics** (download counts, star counts) from `product.md`
  without re-verifying. Several are flagged as inflated in-doc.
- **Don't widen v1 scope.** The plan already commits to more than the effort argument
  that killed the mojs rewrite allows. New ideas go in `DECISIONS.md` as proposals.
- **Don't co-author any commits**
