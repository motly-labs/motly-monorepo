# 15: CI guards — bundle budget, SSR import, coverage threshold

Status: ready-for-agent
Blocked by: 11

**What to build:** The three non-functional promises of `product.md` §1.5–1.6 fail CI when broken, rather than being noticed at release.

- [ ] A size check per entry point, after tree-shaking, keeps `Burst` + `Shape` + one Renderer under 15 kB min+gzip. It fails CI when exceeded. It never measures the whole barrel.
- [ ] Every entry, including the Renderer subpaths, imports in a no-DOM environment without throwing. Constructing a Renderer is the first DOM access.
- [ ] An 85% coverage threshold on `@motly/core` fails CI when missed. The Renderer subpaths are excluded, since they are verified by ticket 17, not by fake-DOM tests.
- [ ] Any tool added is a devDependency. Core gains no runtime dependency.
