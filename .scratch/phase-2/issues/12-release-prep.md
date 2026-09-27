# 12: Release prep in the repo

**What to build:** Everything in the repo the release workflow's header lists before its first publish, and a clean first changelog. `@motly/motion`, `@motly/react` and `@motly/presets` are marked private so the workflow cannot publish them empty; setup-node gets `registry-url`; the fifteen pending Phase 1 changesets are replaced by one "Initial release" changeset for core, and `@motly/gsap` gets its own, so both version to 0.1.0. The trigger switch back to `push` is left to ticket 14, with the repo setting it needs. Spec: `.scratch/phase-2/spec.md`, "Builds and packaging".

**Blocked by:** 11

**Status:** ready-for-agent

- [ ] The three placeholder packages are private; Changesets ignores them.
- [ ] setup-node in the release workflow has `registry-url`.
- [ ] One core changeset and one gsap changeset remain; any changesets from tickets 01–09 are folded in.
- [ ] A dry run of versioning gives `@motly/core` and `@motly/gsap` at 0.1.0 with readable changelog entries.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` green.
