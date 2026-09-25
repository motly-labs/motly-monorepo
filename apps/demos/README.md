# `apps/demos`

Internal demo page for Phase 1. Plain HTML and an import map pointing at the built
`@motly/core` — no bundler, which is the vanilla-HTML story Phase 1 has to prove.

```sh
pnpm --filter @motly/core build
python3 -m http.server 8000   # from the repo root
# open http://localhost:8000/apps/demos/
```
