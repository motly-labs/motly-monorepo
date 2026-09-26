# Upgrade pnpm from 8.15.8 to 12

Status: resolved

`package.json` pins `"packageManager": "pnpm@8.15.8"` only because that was the installed binary, so the scaffold would install green. pnpm 12.5.1 is current. `corepack pnpm@12` fails on the installed corepack 0.33.0 (`Cannot find module .../pnpm/12.5.1/bin/pnpm.cjs`), so it needs a real install:

```sh
npm i -g pnpm@12
# bump packageManager in package.json, delete pnpm-lock.yaml, pnpm install
```

Do it before Phase 1: the lockfile format changes between 8 and 12, which is cheapest with no real dependencies in the tree. pnpm 8 also lacks `catalog:`, which is why versions are duplicated across package manifests; consider moving shared dev dependency versions into a catalog as part of this.

Done when `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm build && pnpm test` passes on pnpm 12.

**Implementation notes.**

- `packageManager` is `pnpm@12.6.0`, the `latest` tag at the time; 12.7.0 was only on `next`. The pnpm that nvm's Node 24 carries switches to it by itself; `pnpm/action-setup@v6` reads the same field in CI.
- pnpm 12 does not read the version 6 lockfile, so `pnpm-lock.yaml` was generated anew.
- Every dependency was then raised to its latest release: turbo 2.11.4, vitest and `@vitest/coverage-v8` 5.0.2, motion 13.4.4. The rest were already latest, `@playwright/test` included, which keeps the container tag at v1.63.0. Peer dependency ranges were left alone: they state what users may bring, not what is installed here.
- `engineStrict: true` in `pnpm-workspace.yaml`, where pnpm 10 and later read it, makes `pnpm install` refuse a Node outside the root `engines`, `^24.5.0`. Under pnpm 8 it could not be turned on: it also enforces `@changesets/cli`'s `engines.pnpm` of 10 or later.
- The Actions moved to their latest majors: checkout v7, setup-node v7, pnpm/action-setup v6, upload-artifact v7, and changesets/action v2.1.2, which has no moving `v2` tag. v2 renamed its inputs to `version-script`, `publish-script`, `commit-message` and `pr-title`, and takes the GitHub token from its own `github-token` input, `github.token` by default, so the `GITHUB_TOKEN` variable was dropped.
- Not done: a `catalog:` for the versions repeated across the package manifests.
- Not changed, found on the way: `release.yml` passes `NODE_AUTH_TOKEN`, but `setup-node` there has no `registry-url`, so no `.npmrc` reads it, and publishing may not authenticate. Check before the first release.
