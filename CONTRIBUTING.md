# Contributing to motly

Thanks for helping. This file covers how to set up the repo, the rules every change has to keep,
and how a change gets released. For what motly *is*, start with the [README](README.md) and the
[docs](https://motly-labs.github.io/motly-monorepo/).

## Setup

You need Node 24 (`.nvmrc`; `engines` asks for `^24.5.0`) and pnpm 12, the version pinned in
`packageManager` in the root `package.json`. `corepack enable` picks it up.

```sh
pnpm install          # workspace install
pnpm build            # turbo run build   (tsdown, per package)
pnpm test             # turbo run test    (vitest)
pnpm typecheck        # turbo run typecheck (tsc --noEmit)
pnpm lint             # biome check .
pnpm format           # biome check --write .
pnpm changeset        # record a release note before opening a PR
```

## Repo layout

| Path | What |
| --- | --- |
| `packages/core` | `@motly/core`, the engine. Subpaths: `/utils`, `/svg`, `/canvas`, `/auto`. |
| `packages/gsap` | `@motly/gsap`, the GSAP plugin. |
| `packages/motion`, `react`, `presets` | Post-v1 placeholders, private. See ADR-0007. |
| `apps/docs` | The docs site (Astro Starlight), deployed to GitHub Pages from `main`. |
| `apps/demos` | Plain-HTML demo pages, the visual regression suite and the launch CodePens. |

Both apps are private. To work on the docs site:

```sh
pnpm --filter docs dev
```

For the demos and the visual regression suite, see [`apps/demos/README.md`](apps/demos/README.md).
The snapshots are rendered in a pinned Playwright container, so run them through
`pnpm test:visual:docker` rather than on your machine.

## Documents of record — read before proposing scope

| File | What it is | How to treat it |
| --- | --- | --- |
| `product.md` | The plan: problem, API synthesis, architecture, six phases | Source of truth for *intent*. Do not edit it to match code. |
| `product-review.md` | Critical review of the plan; rationale for every correction in it | Read before re-litigating a decision it already settled. |
| `mojs-exploration.md` | Why the naive mojs rewrite was rejected | Contains the 3-month timebox the plan overruns. |
| `CONTEXT.md` | The domain glossary: Element, Emitter, Spec, Driver… | Use its terms in code, docs and tickets. |
| `docs/adr/` | One file per locked decision (ADR) | **Add one whenever a hard-to-reverse decision is made or changed.** |
| `.scratch/` | Open questions, proposals, and tickets | Local issue tracker, one Markdown file per ticket. |

Deviating from `product.md` is allowed. Deviating *silently* is not — log it in
an ADR in `docs/adr/` with the reason.

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
   `{ __motly: 'rand', min, max }`, never an eagerly-evaluated number. A spec that
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
  hosted service (ADR-0003). After an intended visual change, update the baselines in the
  container and commit the PNGs.
- Coverage target is 85% on `@motly/core`. It does not apply to adapters.

## Releases

- Changesets. Every user-visible change needs a changeset in the same PR.
- Independent versioning — core can be at 1.4.0 while the GSAP adapter is at 0.9.2.
- `apps/*` and the placeholder packages are private and ignored by Changesets.
- Publishing happens only through `.github/workflows/release.yml`. Never `npm publish`
  by hand. On `main`, the workflow opens a "version packages" PR from the pending
  changesets; merging that PR publishes to npm with provenance.

## Before you open a pull request

- Run `pnpm lint && pnpm typecheck && pnpm test`. CI also runs `pnpm build`, the size budget
  (`pnpm --filter @motly/core size`) and the visual regression suite.
- Add a changeset (`pnpm changeset`) if a published package changes in a way users can see.
- Add an ADR if the change makes or reverses a hard-to-reverse decision.
- Don't add a runtime dependency to `@motly/core`, or a new package where a subpath export
  works. Raise it first.
- Don't copy mojs or canvas-confetti source without adding a `NOTICE` entry. Both are MIT: the
  ideas are free, the code carries a copyright notice.
