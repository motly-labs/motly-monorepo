# 17: Playwright visual regression harness

Status: ready-for-agent
Blocked by: 16

**What to build:** A geometry change fails CI instead of being noticed in a demo weeks later. `toHaveScreenshot()` with committed PNGs, no hosted service (ADR-0003). Budget 15–20 hours for seeding, frame pinning, tolerance and flake control before the first assertion lands. This is the one Phase 1 ticket allowed to slip into Phase 2; the coverage target is not.

- [x] Each of the five demos is snapshotted under both Renderers at pinned Playheads, with fixed Seeds.
- [x] Baseline PNGs are committed; diffs and actuals are not.
- [x] The tolerance is tuned, and the chosen value and its reason are written down.
- [ ] CI runs the suite, and it passes five consecutive runs with no retries configured.
- [ ] Changing any Element's geometry makes the suite fail.

**Implementation notes (ticket 17, part 1).**

- Playwright 1.63.0 in `apps/demos`, pinned exactly to match the `mcr.microsoft.com/playwright:v1.63.0-noble` image that renders the baselines, locally through `pnpm test:visual:docker` and in the CI `visual` job. `serve.mjs` serves the page with Node alone.
- 30 baselines: five demos × two Renderers × Playheads at 0.25, 0.5 and 0.75 of each duration, `deviceScaleFactor` 1, 172 kB in all.
- **Tolerance: `maxDiffPixels: 0`**, with Playwright's default per-pixel color threshold of 0.2. Five consecutive runs in the container, with no retries, showed no differing pixel, so any allowance would only hide small geometry changes. The reason is also in `playwright.config.ts`.
- **Left to do, blocked on Docker Desktop, which hung:**
  1. Fireworks paints a quarter of its circles white on the white stage, so moving them would pass. Change that color, then re-render the baselines.
  2. The geometry mutation check: grow every radius by 2%, grow a star's inner radius by 10%, lengthen a line by 10%, and add 0.25 px to a circle. Record the differing pixels for each; every one must fail the suite.
  3. Five consecutive green CI runs, once this is pushed.
  4. `test:visual:docker` runs the image's own Node. Check that it is 24; CI already sets 24 with `setup-node`.
