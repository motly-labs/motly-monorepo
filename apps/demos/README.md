# `apps/demos`

Internal demo pages, private. Plain HTML loading the built `@motly/core` and `@motly/gsap`,
linked into `node_modules` as workspace dependencies — no bundler, which is the vanilla-HTML
story they have to prove. `index.html` and `canonical.html` use an import map; the pens in
`pens/` use script tags.

```sh
pnpm install     # links the packages into this folder
pnpm build       # the pages load dist/, so rebuild after a package changes
node serve.mjs   # from this folder
# open http://localhost:4173/
```

Opening `index.html` straight from disk (`file://`) does not work: browsers refuse to
load ES modules from `file://`.

## Canonical bursts and visual regression

`canonical.html` holds the five canonical bursts, each with a fixed Seed. Add
`?renderer=canvas` to switch Renderer, and `?progress=0.5` to pin every burst at half its
duration through a manual Driver instead of playing it.

The visual regression suite snapshots them under both Renderers at pinned Playheads
(ADR-0003). The baselines in `tests/__screenshots__/` are rendered in the Playwright container,
pinned by tag in `package.json` and in CI, so run the suite there:

```sh
pnpm --filter @motly/core build
pnpm test:visual:docker                       # from this folder
pnpm test:visual:docker --update-snapshots    # after an intended visual change; commit the PNGs
```

Diffs and actuals land in `test-results/`, which is not committed.

## The five CodePens

`pens/` holds the sources of the five launch CodePens, one page each: Heart burst (timeline
sequencing), Confetti (`tl.burst`'s position parameter), Firework (ScrollTrigger scrubbing, in
container mode), Sparkle click (a burst at the click point) and Ripple (reversing). Each loads GSAP
and `@motly/gsap`'s script build with plain script tags, as a pen does, so it uses only the public
API and the global `Motly`.

Serve them as above and open, for example, `http://localhost:4173/pens/heart.html`.

To make a pen: put the `<style>` in the CSS pane, the markup under `<body>` in the HTML pane and
the last `<script>` in the JS pane, and add the script tags at the top of the page as external
scripts, with `https://cdn.jsdelivr.net/npm/@motly/gsap@0.1` in place of the local path. They are
checked by hand in Safari, Chrome and Firefox at launch, not snapshotted.

