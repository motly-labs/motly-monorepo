# `apps/demos`

Internal demo page for Phase 1. Plain HTML and an import map pointing at the built
`@motly/core`, linked into `node_modules` as a workspace dependency — no bundler,
which is the vanilla-HTML story Phase 1 has to prove.

```sh
pnpm install                     # links @motly/core into this folder
pnpm --filter @motly/core build  # the page imports dist/, so rebuild after core changes
python3 -m http.server 8000      # from this folder
# open http://localhost:8000/
```

Opening `index.html` straight from disk (`file://`) does not work: browsers refuse to
load ES modules from `file://`.

## Canonical bursts and visual regression

`canonical.html` holds the five canonical bursts, each with a fixed Seed. Add
`?renderer=canvas` to switch Renderer, and `?progress=0.5` to pin every burst at half its
duration through a manual Driver instead of playing it.

The visual regression suite snapshots them under both Renderers at pinned Playheads
(ADR-0003). The baselines in `tests/__screenshots__/` are rendered in the Playwright container,
pinned by tag in `package.json` and in CI, so run the suite there:

```sh
pnpm --filter @motly/core build
pnpm test:visual:docker                       # from this folder
pnpm test:visual:docker --update-snapshots    # after an intended visual change; commit the PNGs
```

Diffs and actuals land in `test-results/`, which is not committed.
