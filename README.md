# motly

> Working codename. The name is not locked — see `DECISIONS.md`.

Procedural motion graphics for the web: bursts, swirls, generated shapes, declarative
parametric animation. After Effects thinking, in code you'd write for React.

GSAP, Motion and anime.js animate DOM that already exists. `motly` generates the thing
being animated, and composes it.

**Status: Phase 0 scaffold.** No engine code yet.

## Packages

| Package | What |
|---|---|
| `@motly/core` | Renderer-agnostic engine. Zero runtime dependencies. |
| `@motly/core/utils` | Shared numeric helpers. |
| `@motly/gsap` | GSAP plugin — primitives as `gsap.effects.*`. |
| `@motly/motion` | Motion adapter. |
| `@motly/react` | React components and hooks. |
| `@motly/presets` | Ready-made effects on the public core API. |

## Develop

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

## Docs in this repo

- `product.md` — the plan: problem, API, architecture, phases.
- `product-review.md` — critical review of that plan.
- `mojs-exploration.md` — why the mojs rewrite was rejected.
- `DECISIONS.md` — every locked choice, and what's still open.
- `CLAUDE.md` — working rules and architecture invariants.

## License

MIT
