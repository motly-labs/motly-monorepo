# 21: Docs site tracer bullet

**What to build:** The thinnest docs site that proves the whole path: `apps/docs` on Starlight, one page with one live example, deployed from `main` to GitHub Pages. Every later docs ticket only adds pages. Spec: `.scratch/phase-2/spec.md`, "Demos and docs".

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

- [x] `apps/docs` scaffolded with Starlight (the create command is in `apps/docs/README.md`), private, with `dev` and `build` scripts that Turborepo picks up. The placeholder README is replaced.
- [x] A live-example component: an example is an `index.html` and a `main.js`, which the page shows as code and also runs, importing the workspace `@motly/gsap` and `@motly/core`. A replay button restarts it.
- [x] One page runs the first burst from the `@motly/gsap` README through that component.
- [x] A workflow builds `apps/docs` on every push to `main` and deploys it to GitHub Pages. CI builds it on pull requests, without deploying.
- [ ] By hand: Pages turned on in the repo settings with "GitHub Actions" as the source. The live URL recorded here.
- [x] `pnpm lint && pnpm typecheck && pnpm test` pass.

## Comments

Built 2026-09-30. What is left is the one step by hand above: turn Pages on, then run the Docs workflow (or merge to `main`) and record the URL. It will be `https://motly-labs.github.io/motly-monorepo/`.

- Scaffolded by hand rather than with `create astro`, so only the files the site uses are added: `astro.config.mjs`, `src/content.config.ts`, the landing page, `public/favicon.svg`.
- `src/components/Example.astro` shows an example's `main.js` and `index.html` in tabs and runs them in an iframe from `src/pages/embed/[name].astro`. An iframe per example keeps each example's `document.querySelector` to its own markup, lets the example be written exactly as a user would write it, and makes Replay a reload. The embed pages are left out of search with `data-pagefind-ignore`.
- The stage is dark in both site themes, like the pens, so an iframe never needs to be transparent.
- `base: '/motly-monorepo'` in `astro.config.mjs` goes when the site moves to `motlyjs.dev`.
- Biome cannot see what an `.astro` template uses, so `biome.json` turns off the unused-import and unused-variable rules for `.astro` files, as Biome's own docs suggest.
- pnpm 12 refuses installs with an unapproved install script. esbuild's is denied in `pnpm-workspace.yaml`: it only checks the binary, which esbuild finds without it.
- Checked in headless Chrome 154: the landing page loads, the example's burst draws on load and clears, and draws again on click; no errors.
- No `typecheck` script: the examples are plain JavaScript, and `astro check` against TypeScript 7 is untried.
- `release.yml` runs `pnpm build`, which now builds the docs too, so a broken docs build would also block a release.
