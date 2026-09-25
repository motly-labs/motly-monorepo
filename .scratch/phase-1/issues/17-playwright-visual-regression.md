# 17: Playwright visual regression harness

Status: ready-for-agent
Blocked by: 16

**What to build:** A geometry change fails CI instead of being noticed in a demo weeks later. `toHaveScreenshot()` with committed PNGs, no hosted service (ADR-0003). Budget 15–20 hours for seeding, frame pinning, tolerance and flake control before the first assertion lands. This is the one Phase 1 ticket allowed to slip into Phase 2; the coverage target is not.

- [ ] Each of the five demos is snapshotted under both Renderers at pinned Playheads, with fixed Seeds.
- [ ] Baseline PNGs are committed; diffs and actuals are not.
- [ ] The tolerance is tuned, and the chosen value and its reason are written down.
- [ ] CI runs the suite, and it passes five consecutive runs with no retries configured.
- [ ] Changing any Element's geometry makes the suite fail.
