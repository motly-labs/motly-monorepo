# Lock the name and npm scope

Status: ready-for-human

The codename moved from `spark` to `motly`. Checked on 2026-09-21:

- `motly` (unscoped) is **taken** on npm (1.0.19 published).
- `@motly/core` returns 404. That does not prove the `@motly` scope is unclaimed: scopes are tied to an npm user or org, which a 404 on one package doesn't reveal.

Still to do, per `product.md` Phase 0 Day 1: claim the npm org, GitHub org, domain, socials, and run a trademark check on `motly` (`spark` failed its check; see `product.md` §1).

Renaming again is a find-and-replace across `packages/*/package.json` and `packages/*/src`: cheap now, expensive after the first publish.
