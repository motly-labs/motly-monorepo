# 26: Docs: examples page

**What to build:** Working starting points to copy. Spec: `.scratch/phase-2/spec.md`, "Demos and docs", user story 63.

**Blocked by:** 21

**Status:** resolved

- [x] The five pens from `apps/demos/pens`, running live, each linked to its CodePen (the links are on ticket 15).
- [x] Four to six small examples of one idea each, for example a seeded burst, a Stagger curve, a Swirl, an SVG path curve, container mode.
- [x] Each example's code can be copied as a whole.

## Comments

Done 2026-09-30. `examples/` has the five pens, ported from `apps/demos/pens` to module examples (the HTML and CSS panes to `index.html`, the JS pane to `main.js` with imports in place of the `Motly` global), each linked to its CodePen, and five small ones: sparkle on hover or focus, a copied confirmation, an unread ping that `revert()` stops, a jelly pop on an SVG path Curve, and swirling confetti. Each was driven in headless Chrome 154 (clicked, hovered or scrolled) and drew, with no errors. Each code tab has Expressive Code's copy button.

Two things the checks caught:
- The swirling confetti first put `each()` on a Swirl's `child`, which takes one Spec; core threw `children.child.kind cannot be undefined`. `each()` now hands out whole Swirls. TypeScript would have rejected the first version; the examples are plain JavaScript, so only running them catches this.
- The fireworks pen drew nothing: the embed page centres its stage with `place-items: center` on `body`, and Chrome now applies `justify-items` to block layout too, so the pen's sections shrank to 0 px wide. The pen resets `display` and `place-items` on `body`.
