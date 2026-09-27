# 14: Publish v0.1.0

**What to build:** `@motly/core` and `@motly/gsap` at 0.1.0 on npm, with provenance, published only through the release workflow. Gated on Phase 1 ticket 16 (the check by hand in Safari, Chrome and Firefox). Spec: `.scratch/phase-2/spec.md`, "Builds and packaging", "Release gates".

**Blocked by:** 12, 13, Phase 1 ticket 16

**Status:** ready-for-human

- [ ] Phase 1 ticket 16's hand check is done.
- [ ] `NPM_TOKEN` is set; Actions are allowed to create pull requests in the repo settings.
- [ ] The release workflow's trigger is switched back to `push` to `main`.
- [ ] The version PR is merged and the workflow publishes both packages; no `npm publish` by hand.
- [ ] Both packages install from npm, and the IIFE loads from a CDN.
