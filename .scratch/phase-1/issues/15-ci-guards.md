# 15: CI guards — bundle budget, SSR import, coverage threshold

Status: resolved
Blocked by: 11

**What to build:** The three non-functional promises of `product.md` §1.5–1.6 fail CI when broken, rather than being noticed at release.

- [x] A size check per entry point, after tree-shaking, keeps `Burst` + `Shape` + one Renderer under 15 kB min+gzip. It fails CI when exceeded. It never measures the whole barrel.
- [x] Every entry, including the Renderer subpaths, imports in a no-DOM environment without throwing. Constructing a Renderer is the first DOM access.
- [x] An 85% coverage threshold on `@motly/core` fails CI when missed. The Renderer subpaths are excluded, since they are verified by ticket 17, not by fake-DOM tests.
- [x] Any tool added is a devDependency. Core gains no runtime dependency.

**Implementation notes (ticket 15).**

- **Size:** size-limit with its small-lib preset measures `{ Burst, Shape }` plus one Renderer, imported from `dist` so it is tree-shaken, never the barrel, min+gzip. At the time of writing: SVG 8.93 kB, Canvas 9.34 kB, Auto 9.95 kB, against a 15 kB limit each; the whole barrel is 18.0 kB. CI runs `pnpm --filter @motly/core size` after the build.
- **SSR:** `src/ssr.test.ts` imports every entry in Vitest's Node environment, where there is no `document` or `window`. It also fails when `package.json` exports an entry the test does not list. A top-level `document` access in `svg` was seen to fail it.
- **Coverage:** `@vitest/coverage-v8` runs on every `pnpm test`, with 85% on statements, branches, functions and lines. The Renderer subpaths and the `testing` helpers are excluded; `geometry.ts`, which only the Renderers import, stays in, and the engine is still at 94% of statements and 92% of branches. A 99% branch threshold was seen to fail the run.
- **Not changed, found in review:** the Node 20 leg of the CI test matrix may already fail, since vitest 5 needs Node 22.12 or later. Worth its own ticket.
