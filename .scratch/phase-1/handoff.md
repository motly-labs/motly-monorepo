# Handoff — Phase 1 spec, mid-flow

Written for a model taking over this session at the `/to-spec` → `/to-tickets` boundary.
Read the primary sources rather than trusting this file; it is a map, not a summary.

## Where we are

The `/mattpocock-skills:ask-matt` main flow, between step 3's two halves:

```
/grill-with-docs  ✅ done, frontier empty      → CONTEXT.md + ADR-0007..0016
/to-spec          ✅ done                      → .scratch/phase-1/spec.md
/to-tickets       ✅ done                      → .scratch/phase-1/issues/01..17
/implement        ⬅️ NEXT, per ticket, /clear between
```

Work the frontier: any ticket whose `Blocked by:` tickets are all done. Day one
that is 01 alone. Conventions: `docs/agents/issue-tracker.md`.

## Read these, in this order

1. `CLAUDE.md` — the 10 architecture invariants and the `## Don't` list. Non-negotiable.
2. `CONTEXT.md` — the 19-term glossary. Use these words in tickets; do not invent synonyms.
3. `docs/adr/0007`–`0016` — every design decision Phase 1 is built on. The spec cites them by number and does not restate them.
4. `.scratch/phase-1/spec.md` — the deliverable of the last step.
5. `product.md` §4 Phase 1 — the original 12-checkbox plan the spec expands.

## State of the tree

- Branch `main`, clean except `.scratch/phase-1/` (untracked: `spec.md` and this file).
- Last commits: `3aeb0fa` (CLAUDE.md scope line), `050b48e` (domain model + ADRs).
- No engine code exists. `packages/core/src` holds `VERSION` and two numeric helpers.
- Nothing needs `pnpm lint && pnpm typecheck && pnpm test` yet — markdown only so far.
  Run all three before declaring any code work done.

## Decisions made this session that live nowhere else

- **Renderers ship as `@motly/core` subpath entries**, one per Renderer, not as packages.
  Deviates from `product.md` §2.2. Recorded in the spec's Implementation Decisions.
  An ADR was drafted and deleted on the user's instruction — see next point.
- **Do not write an ADR until it is actually necessary.** The user overruled one.
  The bar is the `/domain-modeling` rule, applied strictly: hard to reverse AND
  surprising without context AND a real trade-off. When unsure, record the decision
  in the spec or the ticket and name the trigger that would justify an ADR later.
- **The two seams were confirmed with the user** before the spec was written:
  seam 1 is `@motly/core`'s public entry driven by a manual Driver, asserting on the
  Draw list; seam 2 is Playwright `toHaveScreenshot()` over `apps/demos`.
  Do not add a third seam without asking.
- **The Playwright harness is in Phase 1**, built last, and is the one ticket allowed
  to slip. The 85% coverage target is not allowed to slip.

## Traps

- **Do not widen v1 scope.** ADR-0007 fixed v1 at `@motly/core` + `@motly/gsap`.
  New ideas become tickets in `.scratch/`, not code.
- **Invariant 6 cannot be satisfied in Phase 1** — it needs two adapters and there is
  one. Build honestly against GSAP; do not speculatively generalize core's API for
  Motion. Reviewing core against Motion's `animate()` is a pre-1.0 task, not this one.
- **The 200-Element `renderer: 'auto'` threshold is a placeholder** (ADR-0015) and must
  be replaced by a measured number during this phase. Shipping it unmeasured is a
  silent failure of the phase.
- **Don't co-author commits.** `CLAUDE.md` says so, and it overrides the harness default.

## Session settings

Caveman mode is active at level `full` (terse, articles dropped) via a hook, and
persists until the user says "stop caveman" or "normal mode". It drops automatically
for security warnings, irreversible-action confirmations, multi-step sequences where
order could be misread, and whenever the user asks for clarification or repeats a
question. Commits, PRs and code are always written in normal prose.
