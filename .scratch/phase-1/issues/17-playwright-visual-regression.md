# 17: Playwright visual regression harness

Status: resolved
Blocked by: 16

**What to build:** A geometry change fails CI instead of being noticed in a demo weeks later. `toHaveScreenshot()` with committed PNGs, no hosted service (ADR-0003). Budget 15–20 hours for seeding, frame pinning, tolerance and flake control before the first assertion lands. This is the one Phase 1 ticket allowed to slip into Phase 2; the coverage target is not.

- [x] Each of the five demos is snapshotted under both Renderers at pinned Playheads, with fixed Seeds.
- [x] Baseline PNGs are committed; diffs and actuals are not.
- [x] The tolerance is tuned, and the chosen value and its reason are written down.
- [x] CI runs the suite, and it passes five consecutive runs with no retries configured.
- [x] Changing any Element's geometry makes the suite fail.

**Implementation notes (ticket 17, part 1).**

- Playwright 1.63.0 in `apps/demos`, pinned exactly to match the `mcr.microsoft.com/playwright:v1.63.0-noble` image that renders the baselines, locally through `pnpm test:visual:docker` and in the CI `visual` job. `serve.mjs` serves the page with Node alone.
- 30 baselines: five demos × two Renderers × Playheads at 0.25, 0.5 and 0.75 of each duration, `deviceScaleFactor` 1, 172 kB in all.
- **Tolerance: `maxDiffPixels: 0` and `threshold: 0`.** No pixel may differ, by any amount of color. The reason is also in `playwright.config.ts`.

**Implementation notes (ticket 17, part 2).** Docker Desktop hung locally, so this ran in CI, in the same pinned image, on a throwaway branch.

- The image's own Node is v24.20.0; the `visual` job sets 24 with `setup-node` on top of it.
- Fireworks' white circles are `dodgerblue` now, so they show on the white stage. Only the six Fireworks baselines changed; the other 24, rendered on another runner earlier, matched to the pixel at threshold 0.
- Noise at threshold 0: none. The suite passed 30 of 30 with `--repeat-each=5`.
- Playwright's default per-pixel `threshold` of 0.2 nearly hid geometry: every radius grown by 2% failed 2 of 30 snapshots, by 1 pixel each. At threshold 0, the geometry mutations fail these snapshots (differing pixels, SVG / canvas):

  | Mutation | Snapshots failed | Differing pixels |
  | --- | --- | --- |
  | Every radius ×1.02 | 28 of 30 (all but Swirl at 0.75) | 2 (Bloom 0.25) to 1,105 (Fireworks 0.25) |
  | Star inner radius ×1.1 | 12, every Confetti and Ripple snapshot | 2 (Confetti 0.75) to 25 (Ripple 0.25) |
  | Line length ×1.1 | 6, every Confetti snapshot | 1 (0.75) to 12 (0.25) |
  | Circle radius +0.25 px | 18, every Confetti, Swirl and Fireworks snapshot | 1 (Swirl 0.75, Confetti 0.25) to 1,674 (Fireworks 0.25) |

- Five consecutive green CI runs on 5a11d50, with no retries: run 36273549001, attempts 1 to 5, every job green.
