# TypeScript 7

The workspace is on TypeScript 7.0.2, the native port, over the conservative TypeScript 5.9.3 (verified clean at the time). Chosen knowingly with a live risk attached.

## Consequences

tsdown prints on every build:

```
WARN  TypeScript 7.0 does not yet have a stable API and is experimental.
      Some options will be unavailable.
```

Declaration emit for a library whose pitch is TypeScript quality runs through that path. Builds measured ~2.5x slower than the 5.9 path (1041ms vs 414ms on `@motly/core`).

**Mitigation:** before the first public publish, install the built `.d.ts` files into a scratch consumer and check they resolve and typecheck under both TS 5.x and TS 7. Do not ship types that were never consumed.

Revisit if any `.d.ts` output is wrong, or the warning is still there when Phase 2 publishes. Falling back to 5.9.3 is a one-line change.
