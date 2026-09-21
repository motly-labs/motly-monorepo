# Upgrade pnpm from 8.15.8 to 12

Status: ready-for-agent

`package.json` pins `"packageManager": "pnpm@8.15.8"` only because that was the installed binary, so the scaffold would install green. pnpm 12.5.1 is current. `corepack pnpm@12` fails on the installed corepack 0.33.0 (`Cannot find module .../pnpm/12.5.1/bin/pnpm.cjs`), so it needs a real install:

```sh
npm i -g pnpm@12
# bump packageManager in package.json, delete pnpm-lock.yaml, pnpm install
```

Do it before Phase 1: the lockfile format changes between 8 and 12, which is cheapest with no real dependencies in the tree. pnpm 8 also lacks `catalog:`, which is why versions are duplicated across package manifests; consider moving shared dev dependency versions into a catalog as part of this.

Done when `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm build && pnpm test` passes on pnpm 12.
