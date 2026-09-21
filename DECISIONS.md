# DECISIONS

Dated log of locked choices. Append, never rewrite. One entry per decision:
what was chosen, what it rules out, and what would make us revisit it.

`product.md` $2.4 holds the original tooling table; where this file and that table
disagree, **this file wins** and the divergence is noted in the entry.

---

## 2026-09-20 — Lint and format: Biome

**Chosen:** Biome 2.5.x as the single lint + format + import-sort tool. One
`biome.json`, one dev dependency.

**Rejected:** ESLint 9 + Prettier (≈8 dev deps, slow CI on a monorepo, flat-config
churn); oxlint + Prettier (two tools, type-aware support still landing).

**Cost accepted:** no type-aware lint rules, so `no-floating-promises` and
`no-misused-promises` are not available. That matters most in the ticker and timeline
code — cover it with tests and review instead.

**Revisit if:** async bugs in the engine start slipping through review, or Biome's
type-aware rules ship. Migration to ESLint later is mechanical.

Fills a gap: $2.4 never named a linter.

---

## 2026-09-20 — Docs site: Astro Starlight

**Chosen:** Astro Starlight for `apps/docs`. $2.4 listed "Astro Starlight or Nextra"
unresolved; resolved to Starlight.

**Why:** the docs are mostly prose plus embedded live examples. Starlight's default
shape is exactly that and it ships no React runtime on pages that don't need one.
Nextra would have meant carrying Next.js for a documentation site.

**Not scaffolded yet** — `apps/docs` is a placeholder until Phase 3 funds it. The
create command is in `apps/docs/README.md`.

---

## 2026-09-20 — Visual regression: Playwright snapshots, no hosted service

**Chosen:** Playwright's built-in `toHaveScreenshot()` with PNGs committed to the
repo. No Percy, no Chromatic.

**Why:** the total project budget is €272–672. A hosted diff service has a free tier
and then a cliff, and adds a vendor to a solo OSS project.

**Cost accepted:** flake control is now our problem — pin the browser version in a
container, seed the RNG, pin frames, tune tolerance. `product.md` $4 already budgets
~15–20 hrs for the harness before the first assertion.

**Revisit if:** harness maintenance exceeds the time it saves, or a second maintainer
joins and review-by-UI starts paying for itself.

---

## 2026-09-20 — Bundler: tsdown, not tsup

**Chosen:** tsdown 0.23.x for every package in `packages/*`.

**Forced, not preferred.** $2.4 specified tsup. tsup's `dts` step bundles
`rollup-plugin-dts@6.1.1` compiled against TypeScript 5.7's internal API, and it
hard-fails on TypeScript 7:

```
TypeError: Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')
    at rollup-plugin-dts@6.1.1_typescript@5.7.3/.../rollup-plugin-dts.cjs
```

tsdown is tsup's successor from the same author, rolldown-based, and builds cleanly.

**Cost accepted:** tsdown emits `.mjs` / `.cjs` / `.d.mts` / `.d.cts`, so every
`exports` map differs from what $2.4 assumed. They are already written that way.
tsdown is also still 0.x.

**Revisit if:** tsdown 0.x breaks a release, or tsup ships a TS 7-compatible dts path.

---

## 2026-09-20 — TypeScript 7.0.2

**Chosen:** TypeScript 7.0.2 (the native port) across the workspace.

**Rejected:** TypeScript 5.9.3, which was verified clean and is the conservative pick.

**Standing risk — this one is live.** tsdown prints on every build:

```
WARN  TypeScript 7.0 does not yet have a stable API and is experimental.
      Some options will be unavailable.
```

Declaration emit for a library whose entire pitch is TypeScript quality runs through
that path. Measured cost today: builds are ~2.5× slower than the TS 5.9 path
(1041ms vs 414ms on `@motly/core`).

**Mitigation:** before the first public publish, install the built `.d.ts` files in a
scratch consumer project and check they resolve and typecheck under both TS 5.x and
TS 7. Do not ship types that were never consumed.

**Revisit if:** any `.d.ts` output is wrong, or the experimental warning is still
there when Phase 2 publishes. Falling back to TS 5.9.3 is a one-line change.

---

## 2026-09-20 — `@motly/core/utils` is a subpath, not a package

**Chosen:** the shared numeric helpers ship as `@motly/core/utils`, a second entry
point of `@motly/core`.

**Why:** $2.1 promised `@motly/utils` but never put it in the repo tree. A sixth
package means a sixth version to reconcile on every release, for a handful of pure
functions with no dependencies.

**Cost accepted:** a consumer who wants only `clamp` still installs `@motly/core` —
harmless, since core has zero runtime dependencies and is tree-shakeable.

---

## 2026-09-20 — pnpm pinned to 8.15.8 (temporary)

**Chosen:** `"packageManager": "pnpm@8.15.8"`, matching the locally installed binary,
so the scaffold installs green today.

**This is stale.** pnpm 12.5.1 is current. `corepack pnpm@12` fails on the installed
corepack 0.33.0 (`Cannot find module .../pnpm/12.5.1/bin/pnpm.cjs`), so the upgrade
needs a real install:

```sh
npm i -g pnpm@12
# then bump packageManager in package.json, delete pnpm-lock.yaml, pnpm install
```

**Do this before Phase 1.** Lockfile format changes between pnpm 8 and 12, so it is
much cheaper now than with real dependencies in the tree. pnpm 8 also has no
`catalog:` support, which is why versions are duplicated across package manifests.

---

## 2026-09-20 — Node: 24 in `.nvmrc`, `>=20.19` in `engines`

**Chosen:** `.nvmrc` / `.node-version` pin 24 (the LTS line). CI tests 20, 22 and 24.

**Note:** the dev machine runs Node 26. That is fine for building; CI is the contract.

---

## Open — not decided

### The v1 scope contradiction

`product.md` rejects the mojs rewrite as a "6–12 month solo effort" with bad ROI,
then commits to more scope than that in six months. `mojs-exploration.md:223` sets an
explicit 3-month timebox that the six-phase plan silently overruns. The flag at the
top of $4 offers two resolutions: cut v1 to Phases 0–2 (recommended there), or keep
all six phases and re-plan against the 28–33 week range. **Still unresolved.**
Everything currently written assumes six phases.

### Name and npm scope

`motly` is a working codename. `motly` is taken on npm (v1.1.1 published). `@motly/*`
returns 404 for `@motly/core`, which does not prove the scope is unclaimed. The whole
scaffold uses `@motly/*` as a placeholder — package names, `exports`, imports. Renaming
is a find-and-replace across `packages/*/package.json` and `packages/*/src`, cheap now
and expensive after the first publish. Phase 0 Day 1 is namespace locking: npm scope,
GitHub org, domain, socials, and a trademark check.

### Copyright holder and GitHub handle

`LICENSE` says "Mohamed Ismail" and `.github/CODEOWNERS` says
`@TODO-your-github-handle`. Fix both when the org is created.
