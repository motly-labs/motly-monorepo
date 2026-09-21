# `@motly/core/utils` is a subpath, not a package

The shared numeric helpers ship as `@motly/core/utils`, a second entry point of `@motly/core`. `product.md` §2.1 promised a separate utils package but never put it in the repo tree; a sixth package is a sixth version to reconcile on every release, for a handful of pure functions with no dependencies.

## Consequences

A consumer who wants only `clamp` still installs `@motly/core`. Harmless: core has zero runtime dependencies and is tree-shakeable. This is the precedent for the "don't add a sixth package" rule in `CLAUDE.md`.
