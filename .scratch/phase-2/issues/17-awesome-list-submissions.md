# 17: `awesome-gsap` and `awesome-web-animation` submissions

**What to build:** motly listed where people browse for GSAP and web-animation tools. Spec: `.scratch/phase-2/spec.md`, "Launch and the signal".

**Blocked by:** 15

**Status:** ready-for-human

- [ ] Pull request to `awesome-gsap` opened; link recorded here.
- [ ] Pull request to `awesome-web-animation` opened; link recorded here.

## Comments

Checked on 2026-09-30.

**`awesome-gsap` has no list to submit to.** No maintained list goes by that name. The candidates on GitHub are `privilegemendes/awesome-gsap` (2 stars, still the awesome-list template, last commit 2024-11-08) and `tvalentius/awesome-gsap` (1 star, last commit 2018-10-23). `product.md` named the list without checking it. Unless a real GSAP list turns up, the first checkbox is dropped.

**`sergey-pimenov/awesome-web-animation`** (about 1.6k stars) is real, with two catches:

- It has merged no outside pull request since 2021-01-09. Eight are open, the oldest from 2023. The maintainer is active (on 2026-09-20 they added about 25 tools in their own commit), so a PR may still get read, or copied into one of their commits.
- The list is shown in two places: `readme.md`, and a site built from `data/items.yaml`. A PR edits both. Each card on the site shows the GitHub repo's `name` and `description`. As things stand, the motly card would say `motly-monorepo` with no description. **Set a description on `motly-labs/motly-monorepo` before opening the PR.**

### `readme.md`, at the end of `## Common`

```md
- [motly](https://github.com/motly-labs/motly-monorepo) - Procedural bursts generated from a JSON spec, playable as GSAP tweens.
```

### `data/items.yaml`, at the end of `common:` (after `rive-app/rive-wasm`)

```yaml
  - repo: motly-labs/motly-monorepo
    bundleData:
      jsdelivr:
        libName: '@motly/gsap'
        fileName: motly.iife.js
```

The site looks for `fileName` at the package root, then in `dist/`, and `dist/motly.iife.js` is in `@motly/gsap@0.1.1` on jsDelivr.

### Pull request

Title: `Add motly to Common`

Body:

```md
Adds [motly](https://github.com/motly-labs/motly-monorepo) to Common, in both `readme.md` and `data/items.yaml`.

motly generates the thing being animated. You describe a burst as a JSON spec, and motly generates the shapes and draws them. `@motly/gsap` registers bursts as GSAP effects, so each one is an ordinary tween: it sits in a timeline, scrubs, reverses, and can be driven by ScrollTrigger. `@motly/core` runs without GSAP.

- npm: https://www.npmjs.com/package/@motly/gsap
- Demos: <CodePen collection from ticket 15>
- License: MIT

The `bundleData` entry points at `@motly/gsap`'s script build, which bundles core.

I'm the author.
```
