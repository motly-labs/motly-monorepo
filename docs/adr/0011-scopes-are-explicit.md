# Scopes are explicit; there is no ambient context

Scoped cleanup is `const scope = createScope()`, whose Instances are created through it (`scope.burst(spec)`) and released together by `scope.destroy()`. A Scope owns one rAF Driver, so the "central ticker" of `product.md` §1.8.6 is central per Scope, not per process. A bare `new Burst(spec)` gets its own private Scope.

`product.md` §1.8.5 copies GSAP's `createContext(() => { new Burst(...) })`, which can only collect Instances through a module-level "current context" variable. Invariant 3 in `CLAUDE.md` forbids module-level mutable state, and a singleton ticker is the same problem. An explicit Scope keeps the invariant with no exceptions.

## Considered Options

- **A synchronous current-scope stack**, pushed and popped around the callback, as a documented exception to Invariant 3. Rejected: the exception is the whole invariant, and one stale entry leaks every Instance made after it.
- **No scoped cleanup in v1.** Rejected: `.destroy()` per Instance is the mojs ergonomics problem the plan set out to fix.

## Consequences

- Adapters map a Scope onto their host's own scope: `gsap.context()` in Phase 2, a React effect later.
- Two Instances share a ticker only when they share a Scope. Document this where the perf story is made.
