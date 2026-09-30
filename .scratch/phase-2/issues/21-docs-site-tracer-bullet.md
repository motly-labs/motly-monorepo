# 21: Docs site tracer bullet

**What to build:** The thinnest docs site that proves the whole path: `apps/docs` on Starlight, one page with one live example, deployed from `main` to GitHub Pages. Every later docs ticket only adds pages. Spec: `.scratch/phase-2/spec.md`, "Demos and docs".

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `apps/docs` scaffolded with Starlight (the create command is in `apps/docs/README.md`), private, with `dev` and `build` scripts that Turborepo picks up. The placeholder README is replaced.
- [ ] A live-example component: an example is one source file, which the page shows as code and also runs, importing the workspace `@motly/gsap` and `@motly/core`. A replay button restarts it.
- [ ] One page runs the first burst from the `@motly/gsap` README through that component.
- [ ] A workflow builds `apps/docs` on every push to `main` and deploys it to GitHub Pages. CI builds it on pull requests, without deploying.
- [ ] By hand: Pages turned on in the repo settings with "GitHub Actions" as the source. The live URL recorded here.
- [ ] `pnpm lint && pnpm typecheck && pnpm test` pass.
