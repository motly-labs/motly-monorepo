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
