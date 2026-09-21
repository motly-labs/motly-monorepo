# Astro Starlight for the docs site

`apps/docs` will be Astro Starlight. `product.md` §2.4 left it as "Astro Starlight or Nextra". The docs are mostly prose plus embedded live examples, which is Starlight's default shape, and it ships no React runtime on pages that don't need one.

## Considered Options

- **Nextra**: rejected. Makes inline `@motly/react` demos trivial, but carries Next.js for a documentation site and puts React on every page.

## Consequences

Not scaffolded yet. `apps/docs` stays a placeholder until Phase 3 funds it; the create command is in `apps/docs/README.md`.
