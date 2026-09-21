# Biome for lint and format

Biome is the single lint, format and import-sort tool: one `biome.json`, one dev dependency. `product.md` §2.4 never named a linter, so this fills a gap rather than overriding the plan.

## Considered Options

- **ESLint 9 + Prettier**: rejected. About eight dev dependencies, slow CI on a monorepo, flat-config churn. Its one real advantage is type-aware rules.
- **oxlint + Prettier**: rejected. Two tools to configure, and oxlint's type-aware support was still landing.

## Consequences

No type-aware lint rules, so `no-floating-promises` and `no-misused-promises` are unavailable. That matters most in the ticker and timeline code; cover it with tests and review. Revisit if async bugs in the engine slip through review, or Biome ships type-aware rules. Moving to ESLint later is mechanical.
