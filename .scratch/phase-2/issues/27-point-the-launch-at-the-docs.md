# 27: Point the launch at the docs

**What to build:** Every way into motly leads to the docs site. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", "Launch and the signal".

**Blocked by:** 22, 23, 24, 25, 26, 28

**Status:** ready-for-human

- [x] Both READMEs link to the docs site; both packages' `homepage` points at it, with a changeset.
- [x] The forum post draft (`.scratch/phase-2/gsap-forum-post.md`), the pen copy (`.scratch/phase-2/codepen-copy.md`) and the `awesome-web-animation` pull request text (ticket 17) link to the docs site.
- [ ] By hand: the repo's description and website set on GitHub. The `awesome-web-animation` site shows the description on motly's card.

## Comments

2026-09-30. Both READMEs link to `https://motly-labs.github.io/motly-monorepo/`, both packages' `homepage` is that URL, and a patch changeset covers both. The forum post draft names the docs and the real-world examples; the pen copy's "Docs:" lines and the `awesome-web-animation` pull request text (ticket 17) point at the site, and the PR text now links the CodePen collection.

Left by hand:
- [ ] The repo's description and website on GitHub (above).
- [ ] The five published pens and the collection still say `Docs: https://www.npmjs.com/package/@motly/gsap`; paste the new copy from `.scratch/phase-2/codepen-copy.md` into each.
- [ ] The URL is live only once Pages is on (ticket 21) and this branch is on `main`.
