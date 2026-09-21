# tsdown, not tsup

Every package in `packages/*` builds with tsdown. `product.md` §2.4 specified tsup; this is a forced correction, not a preference. tsup's `dts` step bundles `rollup-plugin-dts@6.1.1` compiled against TypeScript 5.7's internal API and hard-fails on TypeScript 7 (see ADR-0005):

```
TypeError: Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')
    at rollup-plugin-dts@6.1.1_typescript@5.7.3/.../rollup-plugin-dts.cjs
```

tsdown is tsup's successor from the same author, rolldown-based, and builds cleanly.

## Consequences

tsdown emits `.mjs` / `.cjs` / `.d.mts` / `.d.cts`, so every `exports` map differs from what §2.4 assumed; they are already written that way. tsdown is still 0.x. Revisit if a 0.x release breaks a build, or tsup ships a TS 7-compatible dts path.
