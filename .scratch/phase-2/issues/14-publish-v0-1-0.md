# 14: Publish v0.1.0

**What to build:** `@motly/core` and `@motly/gsap` at 0.1.0 on npm, with provenance, published only through the release workflow. Gated on Phase 1 ticket 16 (the check by hand in Safari, Chrome and Firefox). Spec: `.scratch/phase-2/spec.md`, "Builds and packaging", "Release gates".

**Blocked by:** 12, 13, Phase 1 ticket 16

**Status:** ready-for-human

- [ ] Phase 1 ticket 16's hand check is done.
- [x] `NPM_TOKEN` is set; Actions are allowed to create pull requests in the repo settings.
- [x] The release workflow's trigger is switched back to `push` to `main`.
- [x] The version PR is merged and the workflow publishes both packages; no `npm publish` by hand.
- [x] Both packages install from npm, and the IIFE loads from a CDN.

## Comments


From ticket 12's review: npm issues granular tokens only, so `NPM_TOKEN` must be a granular token with publish rights on the `@motly` scope, which needs the org from ticket 13 first. The workflow authenticates through setup-node's `.npmrc` and `NODE_AUTH_TOKEN`; changesets/action v2.1.2 writes none of its own.

0.1.0 is on npm, published by the release workflow (run 36413077764) on 2026-09-28, before Phase 1 ticket 16's hand check. `npm i @motly/core@0.1.0 @motly/gsap@0.1.0` installs and `npm audit signatures` verifies both; `dist/motly.iife.js` loads from jsDelivr.

What it took, outside the repo:
- The repo was made public; npm provenance rejects private source repos.
- The repo's Actions policy was `local_only`, which blocked every action the workflows use; it now allows all actions. "Allow GitHub Actions to create and approve pull requests" is on.
- The first publish used a one-day granular token with "Bypass 2FA"; without it pnpm failed with `ERR_PNPM_OTP_NON_INTERACTIVE`. Trusted publishing cannot be set up for a package that does not exist yet, so one token publish was unavoidable.

**Open: 0.1.0 has no provenance.** Its `dist` has no `attestations`. `changeset publish` runs `pnpm publish` without `--provenance`, and pnpm 12 did not act on `NPM_CONFIG_PROVENANCE`. Whether pnpm 12 does the OIDC exchange for trusted publishing is also unverified; the next release will show both. `changeset publish` calls `pnpm publish` with fixed flags, so `--provenance` cannot be passed through it. The release workflow now checks `dist.attestations` for every version it publishes and fails the run if any lacks provenance.

The release workflow now authenticates through npm trusted publishing: `NODE_AUTH_TOKEN` and setup-node's `registry-url` (added in ticket 12) are gone, and the trigger is `push` to `main`. Still to do by hand:
- [ ] Delete the npm token and the `NPM_TOKEN` repo secret.
- [x] Add `motly-labs/motly-monorepo` + `release.yml` as trusted publisher on both packages (`npm trust github @motly/<pkg> --repo motly-labs/motly-monorepo --file release.yml --allow-publish`).
- [ ] Set both packages to "Require 2FA and disallow tokens".
- [ ] The next release publishes through OIDC with provenance.
