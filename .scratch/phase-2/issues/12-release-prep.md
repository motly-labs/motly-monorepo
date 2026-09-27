# 12: Release prep in the repo

**What to build:** Everything in the repo the release workflow's header lists before its first publish, and a clean first changelog. `@motly/motion`, `@motly/react` and `@motly/presets` are marked private so the workflow cannot publish them empty; setup-node gets `registry-url`; the fifteen pending Phase 1 changesets are replaced by one "Initial release" changeset for core, and `@motly/gsap` gets its own, so both version to 0.1.0. The trigger switch back to `push` is left to ticket 14, with the repo setting it needs. Spec: `.scratch/phase-2/spec.md`, "Builds and packaging".

**Blocked by:** 11

**Status:** resolved

- [x] The three placeholder packages are private; Changesets ignores them.
- [x] setup-node in the release workflow has `registry-url`.
- [x] One core changeset and one gsap changeset remain; any changesets from tickets 01–09 are folded in.
- [x] A dry run of versioning gives `@motly/core` and `@motly/gsap` at 0.1.0 with readable changelog entries.
- [x] `pnpm lint && pnpm typecheck && pnpm test` green.

## Comments

Resolved: `@motly/motion`, `@motly/react` and `@motly/presets` are `private` and in Changesets' `ignore`; the ignore is needed as well, or `updateInternalDependencies` would bump them to 0.0.1 with core. setup-node sets `registry-url`, and the workflow's header now lists only what ticket 14 still needs. The 24 pending changesets (16 for core, the 16th from ticket 01, and 8 for gsap) are two, `initial-release-core.md` and `initial-release-gsap.md`, both minor. A dry run of `changeset version` in a throwaway worktree gave both packages 0.1.0 with the two changelogs, and left the placeholders at 0.0.0.

Found in review and fixed here:

- Neither package had a `repository` field, which a provenance publish needs to match the repo that built it (E422 otherwise). Both now name `motly-labs/motly-monorepo` with their `directory`.
- Core's `VERSION` was a hard-coded `'0.0.0'` that the version bump would not change, re-exported by every other package. It is removed, as the user chose: nothing used it, and nothing is published yet. The placeholders' entries are empty.

Checked and fine: Changesets publishes with `pnpm publish`, which rewrites `workspace:^` and copies the root LICENSE into each tarball; the tarballs hold `dist/`, the README and the manifest, and every `exports` target exists.

