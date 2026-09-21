# Visual regression with Playwright snapshots, no hosted service

Visual regression uses Playwright's own `toHaveScreenshot()` with PNGs committed to the repo. No Percy, no Chromatic. The whole project budget is €272–672; a hosted diff service has a free tier and then a cliff, and adds a vendor to a solo OSS project.

## Consequences

Flake control is ours: pin the browser version in a container, seed the RNG, pin frames, tune tolerance. `product.md` §4 budgets ~15–20 hrs for the harness before the first assertion. Revisit if harness upkeep exceeds the time it saves, or a second maintainer joins and review-by-UI starts paying for itself.
